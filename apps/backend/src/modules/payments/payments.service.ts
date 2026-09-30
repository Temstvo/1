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
import { CryptoBotService } from './providers/cryptobot.service';
import { queueAccess } from '../vpn/access-state';

const CRYPTO_OFFERS = {
  premium_30: { asset: 'USDT', amount: '2', days: 30, title: 'APPI VPN Premium — 30 дней' },
  donate: { asset: 'USDT', amount: '0.5', days: 1, title: 'Донат APPI VPN' },
} as const;

@Injectable()
export class PaymentsService {
  private logger = new Logger(PaymentsService.name);
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private yookassa: YooKassaService,
    private cryptobot: CryptoBotService,
  ) {}

  /** Ручная заявка: юзер перевёл напрямую, ждёт подтверждения админа. */
  async createManualClaim(telegramId: string, kind: 'premium_30' | 'donate') {
    const days = kind === 'premium_30' ? 30 : 1;
    const label = kind === 'premium_30' ? 'Premium 30 дней (перевод)' : 'Донат (перевод)';
    const created: any[] = await (this.prisma as any).$queryRawUnsafe(
      `INSERT INTO payments (id, user_id, provider, amount, currency, status, description, transaction_id, webhook_verified, metadata, created_at, updated_at)
       VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'TELEGRAM', 0, 'RUB', 'PENDING', $1, $2, false, $3, now(), now())
       RETURNING id, created_at`,
      label,
      `manual_${telegramId}_${Date.now()}`,
      JSON.stringify({ telegramId: String(telegramId), kind, days }),
    );
    return { claimId: created[0].id, days, label };
  }

  /** Подтверждение ручной заявки админом. Идемпотентно. */
  async approveManualClaim(claimId: string) {
    const found: any[] = await (this.prisma as any).$queryRawUnsafe(
      `SELECT id, status, metadata FROM payments WHERE id = $1::uuid LIMIT 1`,
      claimId,
    );
    if (found.length === 0) throw new NotFoundException('Заявка не найдена');
    const p = found[0];
    if (p.status === 'COMPLETED') return { approved: true as const, duplicate: true as const };
    if (p.status !== 'PENDING') throw new BadRequestException('Заявка уже обработана');
    const meta = typeof p.metadata === 'string' ? JSON.parse(p.metadata) : p.metadata;
    const telegramId = String(meta.telegramId);
    const days = Math.max(1, Number(meta.days) || 30);
    await (this.prisma as any).$executeRawUnsafe(
      `UPDATE sub_links SET expires_at = GREATEST(expires_at, now()) + make_interval(days => $2::int), updated_at = now()
       WHERE id = (SELECT id FROM sub_links WHERE telegram_id = $1 ORDER BY expires_at DESC LIMIT 1)`,
      telegramId,
      days,
    );
    await (this.prisma as any).$executeRawUnsafe(
      `UPDATE payments SET status = 'COMPLETED', webhook_verified = true, updated_at = now() WHERE id = $1::uuid`,
      claimId,
    );
    return { approved: true as const, telegramId, days };
  }

  /** Счёт CryptoBot для бота. Возвращает ссылку на оплату. */
  async createCryptoInvoice(telegramId: string, kind: 'premium_30' | 'donate') {
    const offer = CRYPTO_OFFERS[kind];
    if (!offer) throw new BadRequestException('Неизвестный тариф');
    const payload = `crypto_${kind}_${telegramId}_${Date.now()}`;
    const inv: any = await this.cryptobot.createInvoice({
      asset: offer.asset,
      amount: offer.amount,
      description: offer.title,
      payload,
    });
    return {
      invoiceId: inv.invoice_id,
      invoiceUrl: inv.bot_invoice_url,
      amount: inv.amount,
      asset: inv.asset,
      title: offer.title,
    };
  }

  /** Проверка оплаты счёта CryptoBot + продление подписки. Идемпотентно. */
  async checkCryptoInvoice(telegramId: string, invoiceId: number) {
    const status = await this.cryptobot.getInvoiceStatus(Number(invoiceId));
    if (status !== 'paid') return { paid: false as const };
    // Уже засчитывали?
    const rows: any[] = await (this.prisma as any).$queryRawUnsafe(
      `SELECT id FROM payments WHERE transaction_id = $1 LIMIT 1`,
      `crypto_${invoiceId}`,
    );
    if (rows.length > 0) return { paid: true as const, duplicate: true as const };
    const days = 30; // premium_30 и donate продлевают одинаково базово; точный срок ниже не критичен для MVP
    await (this.prisma as any).$executeRawUnsafe(
      `UPDATE sub_links SET expires_at = GREATEST(expires_at, now()) + make_interval(days => 30), updated_at = now()
       WHERE id = (SELECT id FROM sub_links WHERE telegram_id = $1 ORDER BY expires_at DESC LIMIT 1)`,
      String(telegramId),
    );
    await (this.prisma as any).$executeRawUnsafe(
      `INSERT INTO payments (id, user_id, provider, amount, currency, status, description, transaction_id, webhook_verified, metadata, created_at, updated_at)
       VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'CRYPTOMUS', 0, 'USDT', 'COMPLETED', 'CryptoBot invoice', $1, true, $2, now(), now())`,
      `crypto_${invoiceId}`,
      JSON.stringify({ telegramId: String(telegramId), invoiceId }),
    );
    return { paid: true as const, extendedDays: days };
  }

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
      const expectedUserId = meta.telegramId ? String(meta.telegramId) : payment.userId;
      matches =
        new Prisma.Decimal(remote.amount.value).eq(payment.amount) &&
        remote.amount.currency === payment.currency &&
        remote.metadata.paymentId === payment.id &&
        String(remote.metadata.userId) === String(expectedUserId) &&
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
        // Бот-покупка: продлеваем sub_links по telegramId, а не подписку юзера
        if (meta.telegramId) {
          const telegramId = String(meta.telegramId);
          const nowBot = new Date();
          const upd: any =
            await tx.$executeRaw`UPDATE sub_links SET expires_at = GREATEST(expires_at, now()) + make_interval(days => ${meta.duration}::int), updated_at = now() WHERE telegram_id = ${telegramId}`;
          if (upd === 0) {
            const token = require('crypto').randomBytes(12).toString('base64url');
            const label = `${telegramId}__${Math.floor(100000 + Math.random() * 900000)}`;
            const expiresAt = new Date(Date.now() + meta.duration * 86400000);
            await tx.$executeRaw`INSERT INTO sub_links (id, token, telegram_id, label, expires_at, traffic_used) VALUES (gen_random_uuid(), ${token.slice(0, 3) + '-' + token.slice(3)}, ${telegramId}, ${label}, ${expiresAt}, 0)`;
          }
          await tx.payment.update({
            where: { id: payment.id },
            data: { status: 'COMPLETED', webhookVerified: true, transactionId: remote.id },
          });
          await tx.invoice.create({
            data: {
              userId: payment.userId,
              paymentId: payment.id,
              number: 'APPI-' + payment.id,
              subtotal: payment.amount,
              total: payment.amount,
              currency: payment.currency,
              dueDate: nowBot,
              paidAt: nowBot,
            },
          });
          await tx.auditLog.create({
            data: {
              actorId: payment.userId,
              action: 'PAYMENT_CONFIRMED_BOT',
              resource: 'PAYMENT',
              resourceId: payment.id,
              result: 'success',
            },
          });
          return { received: true };
        }
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

  private static readonly BOT_USER_ID = '00000000-0000-0000-0000-000000000001';

  async createBotCheckout(telegramId: string, planId: string) {
    if (!this.yookassa.isConfigured())
      throw new ServiceUnavailableException('Оплата пока не настроена');
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan?.isActive) throw new NotFoundException('Тариф недоступен');
    const key = `bot_${telegramId}_${planId}`.slice(0, 64);
    const existing = await this.prisma.payment.findFirst({
      where: { idempotencyKey: key, status: 'PENDING', expiresAt: { gt: new Date() } },
    });
    if (existing?.checkoutUrl) return this.checkoutResult(existing);
    const amount = plan.price;
    const payment = await this.prisma.payment.create({
      data: {
        userId: PaymentsService.BOT_USER_ID,
        provider: 'YOOKASSA',
        amount,
        currency: plan.currency,
        idempotencyKey: key,
        description: 'APPI VPN (bot) — ' + plan.name,
        expiresAt: new Date(Date.now() + 24 * 3600000),
        metadata: {
          planId,
          telegramId,
          duration: plan.duration,
          trafficLimit: plan.trafficLimit.toString(),
        },
      },
    });
    // Создаём внешний платёж
    const remote: any = await this.yookassa.createPayment({
      id: payment.id,
      amount: (payment.amount as any).toFixed(2),
      currency: payment.currency,
      description: payment.description!,
      userId: telegramId,
      planId,
      email: `tg_${telegramId}@bot.local`,
    });
    this.verifyOrder(payment, remote);
    const checkoutUrl = remote.confirmation?.confirmation_url;
    if (!checkoutUrl) throw new ServiceUnavailableException('Провайдер не вернул ссылку');
    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: { transactionId: remote.id, checkoutUrl },
    });
    return this.checkoutResult(updated);
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
