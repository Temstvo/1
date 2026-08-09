import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async getCurrentUserSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: { in: ['ACTIVE', 'GRACE_PERIOD'] } },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    return subscription || null;
  }

  async create(userId: string, dto: { planId: string; couponCode?: string; paymentMethod?: string; provider?: string }) {
    const plan = await this.prisma.plan.findUnique({ where: { id: dto.planId } });
    if (!plan || !plan.isActive) {
      throw new NotFoundException('Тариф не найден или неактивен');
    }

    const activeSubscription = await this.prisma.subscription.findFirst({
      where: { userId, status: { in: ['ACTIVE', 'GRACE_PERIOD', 'PENDING'] } },
    });

    if (activeSubscription && activeSubscription.status !== 'PENDING') {
      throw new ConflictException('У вас уже есть активная подписка');
    }

    const checkout = await this.paymentsService.createYooKassaPayment(userId, dto.planId, dto.couponCode);

    return {
      subscription: { id: checkout.subscription.id, status: 'PENDING' },
      payment: { id: checkout.paymentId, amount: checkout.amount, currency: checkout.currency },
      confirmationUrl: checkout.confirmationUrl,
    };
  }

  async cancel(userId: string, reason?: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: { in: ['ACTIVE', 'GRACE_PERIOD'] } },
    });

    if (!subscription) {
      throw new NotFoundException('Нет активной подписки');
    }

    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: reason,
        autoRenew: false,
      },
      include: { plan: true },
    });
  }

  async changePlan(userId: string, newPlanId: string, couponCode?: string) {
    const currentSubscription = await this.prisma.subscription.findFirst({
      where: { userId, status: { in: ['ACTIVE', 'GRACE_PERIOD'] } },
    });

    if (!currentSubscription) {
      throw new NotFoundException('Нет активной подписки');
    }

    const newPlan = await this.prisma.plan.findUnique({ where: { id: newPlanId } });
    if (!newPlan || !newPlan.isActive) {
      throw new NotFoundException('Новый тариф не найден или неактивен');
    }

    if (currentSubscription.planId === newPlanId) {
      throw new BadRequestException('Нельзя сменить на тот же тариф');
    }

    const checkout = await this.paymentsService.createYooKassaPayment(userId, newPlanId, couponCode);

    return {
      subscription: { id: checkout.subscription.id, status: 'PENDING' },
      payment: { id: checkout.paymentId, amount: checkout.amount, currency: checkout.currency },
      confirmationUrl: checkout.confirmationUrl,
    };
  }

  async renew(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: { in: ['ACTIVE', 'EXPIRED'] } },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      throw new NotFoundException('Подписка не найдена');
    }

    const checkout = await this.paymentsService.createYooKassaPayment(userId, subscription.planId);

    return {
      subscription: { id: checkout.subscription.id, status: 'PENDING' },
      payment: { id: checkout.paymentId, amount: checkout.amount, currency: checkout.currency },
      confirmationUrl: checkout.confirmationUrl,
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiration() {
    try {
      const expiredSubscriptions = await this.prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          expiresAt: { lt: new Date() },
        },
      });

      for (const subscription of expiredSubscriptions) {
        const graceEnd = new Date(subscription.expiresAt.getTime() + 7 * 24 * 60 * 60 * 1000);

        if (new Date() < graceEnd) {
          await this.prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'GRACE_PERIOD' },
          });
          this.logger.log(`Subscription ${subscription.id} moved to GRACE_PERIOD`);
        } else {
          await this.prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'EXPIRED' },
          });
          this.logger.log(`Subscription ${subscription.id} expired`);
        }
      }

      const gracePeriodExpired = await this.prisma.subscription.findMany({
        where: {
          status: 'GRACE_PERIOD',
        },
      });

      for (const subscription of gracePeriodExpired) {
        const graceEnd = new Date(subscription.expiresAt.getTime() + 7 * 24 * 60 * 60 * 1000);
        if (new Date() >= graceEnd) {
          await this.prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'EXPIRED' },
          });
          this.logger.log(`Grace period ended for subscription ${subscription.id}`);
        }
      }

      return { expired: expiredSubscriptions.length, graceExpired: gracePeriodExpired.length };
    } catch (error: any) {
      this.logger.error(`checkExpiration failed: ${error?.message || error}`);
      return { expired: 0, graceExpired: 0, error: error?.message || 'unknown error' };
    }
  }

  async getAll(userId?: string) {
    const where = userId ? { userId } : {};
    return this.prisma.subscription.findMany({
      where,
      include: { plan: true, user: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

}
