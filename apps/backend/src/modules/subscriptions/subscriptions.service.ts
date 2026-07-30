import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { CouponsService } from '../coupons/coupons.service';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
    private readonly couponsService: CouponsService,
  ) {}

  async getCurrentUserSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    return subscription || null;
  }

  async create(userId: string, dto: { planId: string; couponCode?: string; paymentMethod?: string; provider?: string }) {
    const plan = await this.prisma.plan.findUnique({ where: { id: dto.planId } });
    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan not found or inactive');
    }

    const activeSubscription = await this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (activeSubscription) {
      throw new ConflictException('User already has an active subscription');
    }

    let discount = 0;
    if (dto.couponCode) {
      const validation = await this.couponsService.validate(dto.couponCode, dto.planId, Number(plan.price));
      if (validation.valid) {
        if (validation.discount.type === 'PERCENTAGE') {
          discount = Number(plan.price) * (validation.discount.value / 100);
        } else if (validation.discount.type === 'FIXED') {
          discount = validation.discount.value;
        } else if (validation.discount.type === 'FREE_DAYS') {
          discount = 0;
        }
        await this.couponsService.apply(dto.couponCode);
      }
    }

    const finalAmount = Math.max(0, Number(plan.price) - discount);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.duration);

    const payment = await this.paymentsService.createPayment({
      userId,
      amount: finalAmount,
      currency: plan.currency,
      provider: (dto.provider as any) || 'YOOKASSA',
      description: `Subscription: ${plan.name}`,
      metadata: { planId: dto.planId, couponCode: dto.couponCode },
    });

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId: dto.planId,
        status: 'ACTIVE',
        startedAt: new Date(),
        expiresAt,
        paymentMethod: dto.paymentMethod || 'card',
      },
      include: { plan: true },
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { subscriptionId: subscription.id },
    });

    this.logger.log(`Subscription created: ${subscription.id} for user ${userId}`);

    return {
      subscription,
      payment: { id: payment.id, amount: finalAmount, currency: plan.currency },
    };
  }

  async cancel(userId: string, reason?: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
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
      where: { userId, status: 'ACTIVE' },
    });

    if (!currentSubscription) {
      throw new NotFoundException('No active subscription found');
    }

    const newPlan = await this.prisma.plan.findUnique({ where: { id: newPlanId } });
    if (!newPlan || !newPlan.isActive) {
      throw new NotFoundException('New plan not found or inactive');
    }

    if (currentSubscription.planId === newPlanId) {
      throw new BadRequestException('Cannot change to the same plan');
    }

    let discount = 0;
    if (couponCode) {
      const validation = await this.couponsService.validate(couponCode, newPlanId, Number(newPlan.price));
      if (validation.valid) {
        if (validation.discount.type === 'PERCENTAGE') {
          discount = Number(newPlan.price) * (validation.discount.value / 100);
        } else if (validation.discount.type === 'FIXED') {
          discount = validation.discount.value;
        }
        await this.couponsService.apply(couponCode);
      }
    }

    const finalAmount = Math.max(0, Number(newPlan.price) - discount);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + newPlan.duration);

    await this.prisma.subscription.update({
      where: { id: currentSubscription.id },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: 'Plan changed' },
    });

    const newSubscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId: newPlanId,
        status: 'ACTIVE',
        startedAt: new Date(),
        expiresAt,
        paymentMethod: currentSubscription.paymentMethod,
      },
      include: { plan: true },
    });

    const payment = await this.paymentsService.createPayment({
      userId,
      subscriptionId: newSubscription.id,
      amount: finalAmount,
      currency: newPlan.currency,
      provider: 'YOOKASSA',
      description: `Plan change: ${newPlan.name}`,
      metadata: { previousPlanId: currentSubscription.planId, newPlanId, couponCode },
    });

    this.logger.log(`Plan changed: ${currentSubscription.planId} -> ${newPlanId} for user ${userId}`);

    return {
      subscription: newSubscription,
      payment: { id: payment.id, amount: finalAmount },
    };
  }

  async renew(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId, status: { in: ['ACTIVE', 'EXPIRED'] } },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      throw new NotFoundException('No subscription found');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + subscription.plan.duration);

    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        expiresAt,
        autoRenew: true,
      },
      include: { plan: true },
    });
  }

  async checkExpiration() {
    const expiredSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: { lt: new Date() },
      },
    });

    for (const subscription of expiredSubscriptions) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED' },
      });
    }

    return { updated: expiredSubscriptions.length };
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
