import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ChangePlanDto } from './dto/change-plan.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentUserSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    return subscription;
  }

  async create(userId: string, createSubscriptionDto: CreateSubscriptionDto) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: createSubscriptionDto.planId },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    if (!plan.isActive) {
      throw new BadRequestException('Plan is not active');
    }

    const activeSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });

    if (activeSubscription) {
      throw new ConflictException('User already has an active subscription');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.durationDays);

    return this.prisma.subscription.create({
      data: {
        userId,
        planId: createSubscriptionDto.planId,
        status: 'ACTIVE',
        expiresAt,
        paymentMethod: createSubscriptionDto.paymentMethod,
        transactionId: createSubscriptionDto.transactionId,
      },
      include: {
        plan: true,
      },
    });
  }

  async cancel(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
      include: {
        plan: true,
      },
    });
  }

  async changePlan(userId: string, changePlanDto: ChangePlanDto) {
    const currentSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });

    if (!currentSubscription) {
      throw new NotFoundException('No active subscription found');
    }

    const newPlan = await this.prisma.plan.findUnique({
      where: { id: changePlanDto.planId },
    });

    if (!newPlan) {
      throw new NotFoundException('New plan not found');
    }

    if (!newPlan.isActive) {
      throw new BadRequestException('New plan is not active');
    }

    if (currentSubscription.planId === changePlanDto.planId) {
      throw new BadRequestException('Cannot change to the same plan');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + newPlan.durationDays);

    await this.prisma.subscription.update({
      where: { id: currentSubscription.id },
      data: {
        status: 'CHANGED',
      },
    });

    return this.prisma.subscription.create({
      data: {
        userId,
        planId: changePlanDto.planId,
        status: 'ACTIVE',
        expiresAt,
        paymentMethod: currentSubscription.paymentMethod,
      },
      include: {
        plan: true,
      },
    });
  }

  async checkExpiration() {
    const expiredSubscriptions = await this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    for (const subscription of expiredSubscriptions) {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'EXPIRED',
        },
      });
    }

    return { updated: expiredSubscriptions.length };
  }
}
