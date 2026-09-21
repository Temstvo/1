import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { lockUser } from '../../database/lock-user';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private payments: PaymentsService,
  ) {}
  async getCurrentUserSubscription(userId: string) {
    const current = await this.prisma.subscription.findFirst({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
    if (current && ['ACTIVE', 'TRIAL'].includes(current.status) && current.expiresAt <= new Date())
      return { ...current, status: 'EXPIRED' };
    return current;
  }
  create(userId: string, dto: { planId: string; couponCode?: string }) {
    return this.payments.createCheckoutSession(userId, dto.planId, dto.couponCode);
  }
  async cancel(userId: string, reason?: string) {
    return this.prisma.$transaction(async (tx) => {
      await lockUser(tx, userId);
      const sub = await tx.subscription.findFirst({
        where: { userId, status: { in: ['ACTIVE', 'TRIAL'] } },
      });
      if (!sub) throw new NotFoundException('Нет активной подписки');
      await tx.vpnAccess.updateMany({
        where: { userId },
        data: {
          enabled: false,
          status: 'PENDING',
          revision: { increment: 1 },
          nextAttemptAt: new Date(),
        },
      });
      return tx.subscription.update({
        where: { id: sub.id },
        data: {
          status: 'CANCELLED',
          autoRenew: false,
          cancelledAt: new Date(),
          cancelReason: reason,
        },
        include: { plan: true },
      });
    });
  }
  changePlan(userId: string, planId: string, couponCode?: string) {
    return this.payments.createCheckoutSession(userId, planId, couponCode);
  }
  async renew(userId: string) {
    const sub = await this.getCurrentUserSubscription(userId);
    if (!sub) throw new NotFoundException('Подписка не найдена');
    return this.payments.createCheckoutSession(userId, sub.planId);
  }
  @Cron('0 * * * * *')
  async checkExpiration() {
    return this.prisma.subscription.updateMany({
      where: {
        status: { in: ['ACTIVE', 'TRIAL', 'GRACE_PERIOD'] },
        expiresAt: { lte: new Date() },
      },
      data: { status: 'EXPIRED' },
    });
  }
  getAll(userId?: string) {
    return this.prisma.subscription.findMany({
      where: userId ? { userId } : {},
      include: { plan: true, user: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
