import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SubscriptionsScheduler {
  private readonly logger = new Logger(SubscriptionsScheduler.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkExpiredSubscriptions() {
    const expired = await this.prisma.subscription.updateMany({
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] },
        expiresAt: { lt: new Date() },
      },
      data: { status: 'EXPIRED' },
    });

    if (expired.count > 0) {
      this.logger.log(`Expired ${expired.count} subscriptions`);
    }
  }
}
