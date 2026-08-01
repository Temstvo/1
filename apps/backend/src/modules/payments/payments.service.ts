import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
      throw new NotFoundException('Payment not found');
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

  async handleStripeWebhook(event: any, signature?: string) {
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
            await this.prisma.subscription.update({
              where: { id: payment.subscriptionId },
              data: { status: 'ACTIVE' },
            });
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
            await this.prisma.subscription.update({
              where: { id: payment.subscriptionId },
              data: { status: 'ACTIVE' },
            });
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
      throw new NotFoundException('Plan not found or inactive');
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
      throw new BadRequestException('Can only refund completed payments');
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
      throw new NotFoundException('Plan not found or inactive');
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

    const payment = await this.createPayment({
      userId,
      amount: finalAmount,
      currency: plan.currency || 'RUB',
      provider: 'YOOKASSA',
      description: `APPI VPN — ${plan.name}`,
      metadata: { planId, couponCode: couponCode || null },
    });

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
    };
  }

  async handleYooKassaWebhook(body: any, signature?: string) {
    if (signature && !this.yookassaService.verifyWebhook(body, signature)) {
      this.logger.warn('YooKassa webhook: invalid signature — rejecting');
      return { event: 'rejected' };
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
          await this.prisma.subscription.update({
            where: { id: payment.subscriptionId },
            data: { status: 'ACTIVE' },
          });
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
      throw new NotFoundException('Plan not found or inactive');
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

    const payment = await this.createPayment({
      userId,
      amount: finalAmount,
      currency: 'USDT',
      provider: 'CRYPTOMUS',
      description: `APPI VPN — ${plan.name}`,
      metadata: { planId, couponCode: couponCode || null },
    });

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
    };
  }

  async handleCryptomusWebhook(body: any, signature: string) {
    if (!this.cryptomusService.verifyWebhook(body, signature)) {
      this.logger.warn('Cryptomus webhook: invalid signature');
      return;
    }

    const { status, order_id } = body;

    const payment = await this.findById(order_id);
    if (!payment) {
      this.logger.warn(`Cryptomus webhook: payment not found for ${order_id}`);
      return;
    }

    switch (status) {
      case 'paid': {
        await this.updateStatus(payment.id, 'COMPLETED', true);
        if (payment.subscriptionId) {
          await this.prisma.subscription.update({
            where: { id: payment.subscriptionId },
            data: { status: 'ACTIVE' },
          });
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
