import { Injectable, Logger, NotFoundException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { PaymentStatus, PaymentProvider } from '@prisma/client';
import { YooKassaService } from './providers/yookassa.service';
import { CryptomusService } from './providers/cryptomus.service';
import { InvoicesService } from '../invoices/invoices.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly frontendUrl: string;
  private readonly backendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly yookassaService: YooKassaService,
    private readonly cryptomusService: CryptomusService,
    private readonly invoicesService: InvoicesService,
    private readonly emailService: EmailService,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'https://appi-frontend.vercel.app');
    this.backendUrl = this.configService.get<string>('BACKEND_URL', 'https://appibackend-production.up.railway.app');
  }

  async createPayment(data: {
    userId: string;
    subscriptionId?: string;
    amount: number;
    currency?: string;
    provider: PaymentProvider;
    description?: string;
    metadata?: Record<string, any>;
  }) {
    return this.prisma.payment.create({
      data: {
        userId: data.userId,
        subscriptionId: data.subscriptionId,
        amount: data.amount,
        currency: data.currency || 'USD',
        provider: data.provider,
        description: data.description,
        metadata: data.metadata,
      },
    });
  }

  private async activateSubscription(subscriptionId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });
    if (!sub) return;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + sub.plan.duration);

    await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'ACTIVE',
        startedAt: new Date(),
        expiresAt,
        autoRenew: true,
      },
    });

    await this.prisma.subscription.updateMany({
      where: {
        userId: sub.userId,
        id: { not: subscriptionId },
        status: { in: ['ACTIVE', 'GRACE_PERIOD'] },
      },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: 'Plan changed' },
    });

    this.logger.log(`Subscription activated: ${subscriptionId}`);
  }

  private async preparePendingSubscription(userId: string, planId: string): Promise<string> {
    await this.prisma.subscription.updateMany({
      where: { userId, status: 'PENDING' },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: 'Replaced by new checkout' },
    });

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (plan?.duration || 30));

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId,
        status: 'PENDING',
        paymentMethod: 'card',
        expiresAt,
      },
    });

    return subscription.id;
  }

  async findByUserId(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      include: {
        subscription: { include: { plan: true } },
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        subscription: { include: { plan: true } },
        invoice: true,
        user: { select: { id: true, email: true } },
      },
    });

    if (!payment) {
      throw new NotFoundException('Платёж не найден');
    }

    return payment;
  }

  async findByTransactionId(transactionId: string) {
    return this.prisma.payment.findUnique({
      where: { transactionId },
      include: { subscription: true, user: true },
    });
  }

  async updateStatus(id: string, status: PaymentStatus, webhookVerified = false) {
    return this.prisma.payment.update({
      where: { id },
      data: {
        status,
        webhookVerified,
        ...(status === 'REFUNDED' ? { refundedAt: new Date() } : {}),
      },
    });
  }

  private async onPaymentCompleted(payment: any) {
    try {
      await this.invoicesService.create({
        userId: payment.userId,
        paymentId: payment.id,
        subtotal: Number(payment.amount),
        total: Number(payment.amount),
        currency: payment.currency,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payment.userId },
        select: { email: true },
      });

      const planName = payment.metadata?.planId
        ? (await this.prisma.plan.findUnique({ where: { id: payment.metadata.planId } }))?.name || 'Pro'
        : 'Pro';

      if (user) {
        await this.emailService.sendPaymentConfirmationEmail(
          user.email,
          planName,
          Number(payment.amount),
          payment.currency,
        );
      }
    } catch (error: any) {
      this.logger.error(`Failed to create invoice/send email: ${error.message || error}`);
    }
  }

  private verifyStripeSignature(rawBody: Buffer | undefined, signature: string | undefined): boolean {
    const secret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET', '');
    if (!secret || !rawBody || !signature) return false;
    try {
      const parts = signature.split(',');
      const timestamp = parts.find((p) => p.startsWith('t='))?.slice(2);
      const sig = parts.find((p) => p.startsWith('v1='))?.slice(3);
      if (!timestamp || !sig) return false;
      const expected = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}.${rawBody.toString('utf8')}`)
        .digest('hex');
      return sig === expected;
    } catch {
      return false;
    }
  }

  async handleStripeWebhook(event: any, signature?: string, rawBody?: Buffer) {
    if (!this.verifyStripeSignature(rawBody, signature)) {
      this.logger.warn('Stripe webhook: invalid signature — rejecting');
      throw new BadRequestException('Invalid webhook signature');
    }

    if (!event?.type) {
      this.logger.warn('Stripe webhook: missing event type');
      return;
    }

    const { type, data } = event;
    const eventType = type as string;

    switch (eventType) {
      case 'checkout.session.completed': {
        const session = data.object;
        const payment = await this.findByTransactionId(session.payment_intent || session.id);

        if (payment && payment.status !== 'COMPLETED') {
          await this.updateStatus(payment.id, 'COMPLETED', true);
          if (payment.subscriptionId) {
            await this.activateSubscription(payment.subscriptionId);
          }
          await this.onPaymentCompleted(payment);
          this.logger.log(`Stripe payment completed: ${payment.id}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = data.object;
        const payment = await this.findByTransactionId(invoice.payment_intent);

        if (payment && payment.status !== 'COMPLETED') {
          await this.updateStatus(payment.id, 'COMPLETED', true);
          if (payment.subscriptionId) {
            await this.activateSubscription(payment.subscriptionId);
          }
          this.logger.log(`Stripe subscription payment succeeded: ${payment.id}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = data.object;
        const payment = await this.findByTransactionId(invoice.payment_intent);

        if (payment) {
          await this.updateStatus(payment.id, 'FAILED', true);
          if (payment.subscriptionId) {
            await this.prisma.subscription.update({
              where: { id: payment.subscriptionId },
              data: { status: 'PAST_DUE' },
            });
          }
          this.logger.log(`Stripe subscription payment failed: ${payment.id}`);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = data.object;
        const payment = await this.findByTransactionId(charge.payment_intent);

        if (payment) {
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'REFUNDED',
              refundedAt: new Date(),
              refundAmount: charge.amount_refunded / 100,
              webhookVerified: true,
            },
          });
          this.logger.log(`Stripe payment refunded: ${payment.id}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = data.object;
        await this.prisma.subscription.updateMany({
          where: { externalId: subscription.id },
          data: { status: 'CANCELLED', cancelledAt: new Date() },
        });
        break;
      }

      default:
        this.logger.warn(`Unhandled Stripe event: ${eventType}`);
    }
  }

  async createCheckoutSession(userId: string, planId: string, couponCode?: string, provider: string = 'YOOKASSA') {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      throw new NotFoundException('Тариф не найден или неактивен');
    }

    let discount = 0;
    if (couponCode) {
      const coupon = await this.prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive) {
        if (coupon.type === 'PERCENTAGE') {
          discount = Number(plan.price) * (Number(coupon.value) / 100);
        } else if (coupon.type === 'FIXED') {
          discount = Number(coupon.value);
        }
      }
    }

    const finalAmount = Math.max(0, Number(plan.price) - discount);
    const paymentProvider = provider.toUpperCase() as any;

    if (paymentProvider === 'CRYPTOMUS') {
      return this.createCryptomusPayment(userId, planId, couponCode);
    }

    return this.createYooKassaPayment(userId, planId, couponCode);
  }

  async refund(paymentId: string, amount?: number) {
    const payment = await this.findById(paymentId);

    if (payment.status !== 'COMPLETED') {
      throw new BadRequestException('Возврат возможен только для завершённых платежей');
    }

    const refundAmount = amount || Number(payment.amount);

    return this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REFUNDED',
        refundedAt: new Date(),
        refundAmount,
      },
    });
  }

  async getPaymentStats() {
    const [totalRevenue, completedPayments, failedPayments, refundedPayments] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.payment.count({ where: { status: 'COMPLETED' } }),
      this.prisma.payment.count({ where: { status: 'FAILED' } }),
      this.prisma.payment.count({ where: { status: 'REFUNDED' } }),
    ]);

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      completedPayments,
      failedPayments,
      refundedPayments,
    };
  }

  async createYooKassaPayment(userId: string, planId: string, couponCode?: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      throw new NotFoundException('Тариф не найден или неактивен');
    }

    let discount = 0;
    if (couponCode) {
      const coupon = await this.prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive) {
        if (coupon.type === 'PERCENTAGE') {
          discount = Number(plan.price) * (Number(coupon.value) / 100);
        } else if (coupon.type === 'FIXED') {
          discount = Number(coupon.value);
        }
      }
    }

    const finalAmount = Math.max(0, Number(plan.price) - discount);

    const subscriptionId = await this.preparePendingSubscription(userId, planId);

    const payment = await this.createPayment({
      userId,
      subscriptionId,
      amount: finalAmount,
      currency: plan.currency || 'RUB',
      provider: 'YOOKASSA',
      description: `APPI VPN — ${plan.name}`,
      metadata: { planId, couponCode: couponCode || null },
    });

    if (!this.yookassaService.isConfigured()) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
      throw new ServiceUnavailableException(
        'Платёжная система временно недоступна. Попробуйте позже или выберите другой способ оплаты',
      );
    }

    const yukResult = await this.yookassaService.createPayment({
      amount: finalAmount,
      currency: plan.currency || 'RUB',
      description: `APPI VPN — ${plan.name}`,
      metadata: { paymentId: payment.id, planId },
      returnReturnUrl: `${this.frontendUrl}/checkout/success`,
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { transactionId: yukResult.id },
    });

    return {
      paymentId: payment.id,
      confirmationUrl: yukResult.confirmationUrl,
      amount: finalAmount,
      currency: plan.currency || 'RUB',
      subscription: { id: subscriptionId, status: 'PENDING' },
    };
  }

  async handleYooKassaWebhook(body: any, signature?: string, rawBody?: string) {
    if (!this.yookassaService.verifyWebhook(rawBody || '', signature || '')) {
      this.logger.warn('YooKassa webhook: invalid signature — rejecting');
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = body.event;
    const paymentData = body.object;

    if (!paymentData?.id) {
      this.logger.warn('YooKassa webhook: missing payment id');
      return { event: 'invalid' };
    }

    const payment = await this.findByTransactionId(paymentData.id);
    if (!payment) {
      this.logger.warn(`YooKassa webhook: payment not found for ${paymentData.id}`);
      return { event: 'not_found' };
    }

    if (payment.status === 'COMPLETED' || payment.status === 'REFUNDED') {
      this.logger.log(`YooKassa webhook: payment ${payment.id} already ${payment.status}, skipping`);
      return { event: 'duplicate' };
    }

    switch (event) {
      case 'payment.succeeded': {
        await this.updateStatus(payment.id, 'COMPLETED', true);
        if (payment.subscriptionId) {
          await this.activateSubscription(payment.subscriptionId);
        }
        await this.onPaymentCompleted(payment);
        this.logger.log(`YooKassa payment succeeded: ${payment.id}`);
        break;
      }
      case 'payment.canceled': {
        await this.updateStatus(payment.id, 'FAILED', true);
        if (payment.subscriptionId) {
          await this.prisma.subscription.update({
            where: { id: payment.subscriptionId },
            data: { status: 'CANCELLED' },
          });
        }
        this.logger.log(`YooKassa payment canceled: ${payment.id}`);
        break;
      }
      case 'payment.waiting_for_capture': {
        this.logger.log(`YooKassa payment waiting for capture: ${payment.id}`);
        break;
      }
      default:
        this.logger.warn(`YooKassa unhandled event: ${event}`);
    }

    return { event };
  }

  async createCryptomusPayment(userId: string, planId: string, couponCode?: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      throw new NotFoundException('Тариф не найден или неактивен');
    }

    let discount = 0;
    if (couponCode) {
      const coupon = await this.prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive) {
        if (coupon.type === 'PERCENTAGE') {
          discount = Number(plan.price) * (Number(coupon.value) / 100);
        } else if (coupon.type === 'FIXED') {
          discount = Number(coupon.value);
        }
      }
    }

    const finalAmount = Math.max(0, Number(plan.price) - discount);

    const subscriptionId = await this.preparePendingSubscription(userId, planId);

    const payment = await this.createPayment({
      userId,
      subscriptionId,
      amount: finalAmount,
      currency: 'USDT',
      provider: 'CRYPTOMUS',
      description: `APPI VPN — ${plan.name}`,
      metadata: { planId, couponCode: couponCode || null },
    });

    if (!this.cryptomusService.isConfigured()) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
      throw new ServiceUnavailableException(
        'Платёжная система временно недоступна. Попробуйте позже или выберите другой способ оплаты',
      );
    }

    const cryptoResult = await this.cryptomusService.createPayment({
      amount: finalAmount.toString(),
      currency: 'USDT',
      order_id: payment.id,
      url_success: `${this.frontendUrl}/checkout/success`,
      url_callback: `${this.backendUrl}/api/payments/webhook/cryptomus`,
      currencies: ['USDT'],
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { transactionId: cryptoResult.uuid },
    });

    return {
      paymentId: payment.id,
      paymentUrl: cryptoResult.payment_url,
      amount: finalAmount,
      currency: 'USDT',
      subscription: { id: subscriptionId, status: 'PENDING' },
    };
  }

  async handleCryptomusWebhook(body: any, signature: string) {
    if (!this.cryptomusService.verifyWebhook(body, signature)) {
      this.logger.warn('Cryptomus webhook: invalid signature');
      return;
    }

    const { status, order_id } = body;

    const payment = await this.prisma.payment.findUnique({
      where: { id: order_id },
    });
    if (!payment) {
      this.logger.warn(`Cryptomus webhook: payment not found for ${order_id}`);
      return { status: 'not_found' };
    }

    if (payment.status === 'COMPLETED' || payment.status === 'REFUNDED') {
      this.logger.log(`Cryptomus webhook: payment ${payment.id} already ${payment.status}, skipping`);
      return { status: 'duplicate' };
    }

    switch (status) {
      case 'paid': {
        await this.updateStatus(payment.id, 'COMPLETED', true);
        if (payment.subscriptionId) {
          await this.activateSubscription(payment.subscriptionId);
        }
        await this.onPaymentCompleted(payment);
        this.logger.log(`Cryptomus payment completed: ${payment.id}`);
        break;
      }
      case 'cancelled': {
        await this.updateStatus(payment.id, 'FAILED', true);
        break;
      }
      case 'expired': {
        await this.updateStatus(payment.id, 'FAILED', true);
        break;
      }
      default:
        this.logger.log(`Cryptomus payment status: ${status} for ${payment.id}`);
    }

    return { status };
  }
}
