import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TrafficService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentUsage(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    const currentPeriodStart = new Date();
    currentPeriodStart.setDate(currentPeriodStart.getDate() - subscription.plan.duration);

    const usage = await this.prisma.trafficUsage.aggregate({
      where: {
        userId,
        date: {
          gte: currentPeriodStart,
        },
      },
      _sum: {
        download: true,
        upload: true,
      },
    });

    const totalBytesUsed = (usage._sum.download || BigInt(0)) + (usage._sum.upload || BigInt(0));
    const totalBytesLimit = subscription.plan.trafficLimit;

    return {
      bytesUsed: totalBytesUsed,
      bytesLimit: totalBytesLimit,
      percentage: totalBytesLimit > BigInt(0) ? Number((totalBytesUsed * BigInt(100)) / totalBytesLimit) : 0,
      planName: subscription.plan.name,
    };
  }

  async getHistory(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    return this.prisma.trafficUsage.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    });
  }

  async getStatistics(userId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalUsage, dailyUsage, weeklyUsage] = await Promise.all([
      this.prisma.trafficUsage.aggregate({
        where: {
          userId,
          date: {
            gte: thirtyDaysAgo,
          },
        },
        _sum: {
          download: true,
          upload: true,
        },
        _count: true,
      }),
      this.prisma.trafficUsage.aggregate({
        where: {
          userId,
          date: {
            gte: twentyFourHoursAgo,
          },
        },
        _sum: {
          download: true,
          upload: true,
        },
      }),
      this.prisma.trafficUsage.aggregate({
        where: {
          userId,
          date: {
            gte: sevenDaysAgo,
          },
        },
        _sum: {
          download: true,
          upload: true,
        },
      }),
    ]);

    return {
      last30Days: {
        totalBytes: (totalUsage._sum.download || BigInt(0)) + (totalUsage._sum.upload || BigInt(0)),
        sessions: totalUsage._count,
      },
      last7Days: {
        totalBytes: (weeklyUsage._sum.download || BigInt(0)) + (weeklyUsage._sum.upload || BigInt(0)),
      },
      last24Hours: {
        totalBytes: (dailyUsage._sum.download || BigInt(0)) + (dailyUsage._sum.upload || BigInt(0)),
      },
    };
  }

  async recordUsage(userId: string, download: number, upload: number, serverId?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hour = new Date().getHours();

    const existing = await this.prisma.trafficUsage.findFirst({
      where: {
        userId,
        serverId: serverId || null,
        date: today,
        hour,
      },
    });

    if (existing) {
      return this.prisma.trafficUsage.update({
        where: { id: existing.id },
        data: {
          download: { increment: BigInt(download) },
          upload: { increment: BigInt(upload) },
        },
      });
    }

    return this.prisma.trafficUsage.create({
      data: {
        userId,
        serverId,
        download: BigInt(download),
        upload: BigInt(upload),
        date: today,
        hour,
      },
    });
  }
}
