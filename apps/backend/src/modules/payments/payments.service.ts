import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { lockUser } from '../../database/lock-user';
import { YooKassaService } from './providers/yookassa.service';
import { queueAccess } from '../vpn/access-state';

@Injectable()
export class PaymentsService {
  private logger = new Logger(PaymentsService.name);
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private yookassa: YooKassaService,
  ) {}

  async createCheckoutSession(
    userId: string,
    planId: string,
    couponCode?: string,
    provider = 'YOOKASSA',
    key: string = randomUUID(),
  ) {
    if (provider !== 'YOOKASSA') throw new BadRequestException('Поддерживается только ЮKassa');
    if (!this.yookassa.isConfigured())
      throw new ServiceUnavailableException('Оплата пока не настроена');
    if (!this.config.get('MARZBAN_URL'))
      throw new ServiceUnavailableException('VPN-инфраструктура пока не настроена');
    const payment = await this.prisma.$transaction(async (tx) => {
      await lockUser(tx, userId);
      const existing = await tx.payment.findUnique({
        where: { userId_idempotencyKey: { userId, idempotencyKey: key } },
      });
      if (existing) {
        const meta = existing.metadata as any;
        if (
          meta?.planId !== planId ||
          (meta?.couponCode || '') !== (couponCode || '').toUpperCase()
        )
          throw new ConflictException('Ключ уже использован для другого заказа');
        return existing;
      }
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user || user.status !== 'ACTIVE') throw new BadRequestException('Аккаунт недоступен');
      const plan = await tx.plan.findUnique({ where: { id: planId } });
      if (!plan?.isActive) throw new NotFoundException('Тариф недоступен');
      if (plan.currency !== 'RUB' || plan.price.lte(0))
        throw new BadRequestException('Для ЮKassa требуется тариф с положительной ценой в RUB');
      let amount = plan.price;
      if (couponCode) {
        const code = couponCode.toUpperCase();
        await tx.$queryRaw`SELECT id FROM coupons WHERE code = ${code} FOR UPDATE`;
        const coupon = await tx.coupon.findUnique({ where: { code } });
        if (
          !coupon?.isActive ||
          (coupon.expiresAt && coupon.expiresAt <= new Date()) ||
          (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) ||
          (coupon.planIds.length > 0 && !coupon.planIds.includes(planId)) ||
          (coupon.minAmount && amount.lt(coupon.minAmount))
        )
          throw new BadRequestException('Промокод недоступен');
        if (coupon.type === 'PERCENTAGE')
          amount = amount.mul(new Prisma.Decimal(100).minus(coupon.value)).div(100);
        else if (coupon.type === 'FIXED') amount = amount.minus(coupon.value);
        else throw new BadRequestException('Этот тип промокода не поддерживается в оплате');
        amount = amount.toDecimalPlaces(2);
        if (amount.lte(0)) throw new BadRequestException('Сумма платежа должна быть больше нуля');
        // Reserve at order creation, not callback, to avoid concurrent overuse.
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { currentUses: { increment: 1 } },
        });
      }
      return tx.payment.create({
        data: {
          userId,
          provider: 'YOOKASSA',
          amount,
          currency: plan.currency,
          idempotencyKey: key,
          description: 'APPI VPN — ' + plan.name,
          expiresAt: new Date(Date.now() + 24 * 3600000),
          metadata: {
            planId,
            duration: plan.duration,
            trafficLimit: plan.trafficLimit.toString(),
            couponCode: (couponCode || '').toUpperCase(),
            email: user.email,
          },
        },
      });
    });
    if (payment.status !== 'PENDING')
      throw new ConflictException('Заказ уже завершён. Создайте новый');
    if (payment.checkoutUrl) return this.checkoutResult(payment);
    if (payment.expiresAt && payment.expiresAt <= new Date())
      throw new ConflictException('Заказ истёк. Создайте новый');
    const meta = payment.metadata as any;
    // Timeouts are ambiguous: keep PENDING and reuse the same provider key on retry.
    // YooKassa retains idempotency keys for 24 hours; never re-submit after this window.
    const remote = await this.yookassa.createPayment({
      id: payment.id,
      amount: payment.amount.toFixed(2),
      currency: payment.currency,
      description: payment.description!,
      userId,
      planId,
      email: meta.email,
    });
    this.verifyOrder(payment, remote);
    const checkoutUrl = remote.confirmation?.confirmation_url;
    if (!checkoutUrl || new URL(checkoutUrl).protocol !== 'https:')
      throw new ServiceUnavailableException('Провайдер не вернул ссылку оплаты');
    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: { transactionId: remote.id, checkoutUrl },
    });
    return this.checkoutResult(updated);
  }

  createYooKassaPayment(userId: string, planId: string, couponCode?: string) {
    return this.createCheckoutSession(userId, planId, couponCode);
  }

  private checkoutResult(p: any) {
    return {
      paymentId: p.id,
      confirmationUrl: p.checkoutUrl,
      amount: p.amount.toString(),
      currency: p.currency,
      status: p.status,
    };
  }

  private verifyOrder(payment: any, remote: any) {
    const meta = payment.metadata as any;
    let matches = false;
    try {
      matches =
        new Prisma.Decimal(remote.amount.value).eq(payment.amount) &&
        remote.amount.currency === payment.currency &&
        remote.metadata.paymentId === payment.id &&
        remote.metadata.userId === payment.userId &&
        remote.metadata.planId === meta.planId &&
        (!payment.transactionId || payment.transactionId === remote.id) &&
        remote.recipient?.account_id === this.config.get('YOOKASSA_SHOP_ID') &&
        remote.test === (this.config.get('YOOKASSA_TEST_MODE', 'true') === 'true');
    } catch {
      matches = false;
    }
    if (!matches) throw new BadRequestException('Данные платежа не соответствуют заказу');
  }

  async handleYooKassaWebhook(body: any) {
    if (
      body?.type !== 'notification' ||
      !['payment.succeeded', 'payment.canceled', 'payment.waiting_for_capture'].includes(
        body.event,
      ) ||
      typeof body.object?.id !== 'string' ||
      !/^[a-zA-Z0-9-]{1,64}$/.test(body.object.id)
    )
      throw new BadRequestException('Некорректное уведомление');
    // YooKassa does not sign webhooks with x-signature. Authenticate by retrieving
    // the payment from its fixed HTTPS API; the untrusted body is never the source of amount/status.
    const remote = await this.yookassa.getPayment(body.object.id);
    if (remote.id !== body.object.id || body.event !== 'payment.' + remote.status)
      throw new BadRequestException('Статус не подтверждён провайдером');
    const candidate = await this.prisma.payment.findUnique({
      where: { id: remote.metadata?.paymentId || '00000000-0000-0000-0000-000000000000' },
    });
    if (!candidate || candidate.provider !== 'YOOKASSA')
      throw new NotFoundException('Заказ не найден');
    this.verifyOrder(candidate, remote);
    return this.prisma.$transaction(
      async (tx) => {
        await lockUser(tx, candidate.userId);
        const payment = await tx.payment.findUniqueOrThrow({ where: { id: candidate.id } });
        this.verifyOrder(payment, remote);
        if (['COMPLETED', 'REFUNDED'].includes(payment.status))
          return { received: true, duplicate: true };
        if (remote.status === 'waiting_for_capture') return { received: true };
        if (remote.status === 'canceled') {
          const reason = remote.cancellation_details?.reason;
          const status =
            reason === 'expired_on_capture' || reason === 'expired_on_confirmation'
              ? 'EXPIRED'
              : reason === 'canceled_by_merchant' || reason === 'canceled_by_user'
                ? 'CANCELLED'
                : 'FAILED';
          if (payment.status === 'PENDING') {
            await tx.payment.update({
              where: { id: payment.id },
              data: { status, webhookVerified: true, transactionId: remote.id },
            });
            const couponCode = (payment.metadata as any)?.couponCode;
            if (couponCode)
              await tx.coupon.updateMany({
                where: { code: couponCode, currentUses: { gt: 0 } },
                data: { currentUses: { decrement: 1 } },
              });
          }
          return { received: true };
        }
        if (remote.status !== 'succeeded' || remote.paid !== true)
          throw new BadRequestException('Оплата не подтверждена');
        const meta = payment.metadata as any;
        if (!Number.isInteger(meta.duration) || meta.duration < 1)
          throw new BadRequestException('В заказе отсутствует срок тарифа');
        const plan = await tx.plan.findUnique({ where: { id: meta.planId } });
        if (!plan) throw new BadRequestException('Тариф заказа не найден');
        const now = new Date();
        const current = await tx.subscription.findFirst({
          where: { userId: payment.userId, status: 'ACTIVE', expiresAt: { gt: now } },
          orderBy: { expiresAt: 'desc' },
        });
        const expiresAt = new Date(
          Math.max(now.getTime(), current?.expiresAt.getTime() || 0) + meta.duration * 86400000,
        );
        const subscription = await tx.subscription.create({
          data: {
            userId: payment.userId,
            planId: meta.planId,
            status: 'ACTIVE',
            expiresAt,
            autoRenew: false,
            paymentMethod: 'YOOKASSA',
          },
        });
        await tx.subscription.updateMany({
          where: {
            userId: payment.userId,
            id: { not: subscription.id },
            status: { in: ['ACTIVE', 'GRACE_PERIOD', 'TRIAL'] },
          },
          data: { status: 'CANCELLED', cancelReason: 'Superseded by paid renewal' },
        });
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            webhookVerified: true,
            transactionId: remote.id,
            subscriptionId: subscription.id,
          },
        });
        await tx.invoice.create({
          data: {
            userId: payment.userId,
            paymentId: payment.id,
            number: 'APPI-' + payment.id,
            subtotal: payment.amount,
            total: payment.amount,
            currency: payment.currency,
            dueDate: now,
            paidAt: now,
          },
        });
        await queueAccess(tx, payment.userId, expiresAt, BigInt(meta.trafficLimit || '0'));
        await tx.auditLog.create({
          data: {
            actorId: payment.userId,
            action: 'PAYMENT_CONFIRMED',
            resource: 'PAYMENT',
            resourceId: payment.id,
            result: 'success',
          },
        });
        return { received: true };
      },
      { timeout: 20000 },
    );
  }

  findByUserId(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        description: true,
        createdAt: true,
        checkoutUrl: true,
        webhookVerified: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
  async findById(id: string, userId?: string) {
    const p = await this.prisma.payment.findFirst({
      where: { id, ...(userId ? { userId } : {}) },
      select: {
        id: true,
        userId: true,
        amount: true,
        currency: true,
        status: true,
        createdAt: true,
        checkoutUrl: true,
        webhookVerified: true,
      },
    });
    if (!p) throw new NotFoundException('Платёж не найден');
    return p;
  }

  @Cron('0 */5 * * * *')
  async expirePending() {
    await this.prisma.payment.updateMany({
      where: { status: 'PENDING', expiresAt: { lte: new Date() } },
      data: { status: 'EXPIRED' },
    });
    // A delayed verified success may still settle an expired local order.
  }
}
