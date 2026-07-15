import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaymentStatus, PaymentProvider } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

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

  async handleStripeWebhook(event: any) {
    const { type, data } = event;

    switch (type) {
      case 'checkout.session.completed': {
        const session = data.object;
        const payment = await this.findByTransactionId(session.payment_intent || session.id);

        if (payment) {
          await this.updateStatus(payment.id, 'COMPLETED', true);
          if (payment.subscriptionId) {
            await this.prisma.subscription.update({
              where: { id: payment.subscriptionId },
              data: { status: 'ACTIVE' },
            });
          }
          this.logger.log(`Payment completed: ${payment.id}`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = data.object;
        const payment = await this.findByTransactionId(invoice.payment_intent);

        if (payment) {
          await this.updateStatus(payment.id, 'COMPLETED', true);
          this.logger.log(`Subscription payment succeeded: ${payment.id}`);
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
          this.logger.log(`Subscription payment failed: ${payment.id}`);
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
          this.logger.log(`Payment refunded: ${payment.id}`);
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
        this.logger.warn(`Unhandled Stripe event: ${type}`);
    }
  }

  async createCheckoutSession(userId: string, planId: string, couponCode?: string) {
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
      currency: plan.currency,
      provider: 'STRIPE',
      description: `Subscription to ${plan.name}`,
      metadata: { planId, couponCode: couponCode || null },
    });

    return {
      paymentId: payment.id,
      amount: finalAmount,
      currency: plan.currency,
      stripePriceId: plan.stripePriceId,
      clientSecret: `pi_mock_${payment.id}`,
    };
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
}
