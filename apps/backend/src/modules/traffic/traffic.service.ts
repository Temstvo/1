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
    currentPeriodStart.setDate(currentPeriodStart.getDate() - subscription.plan.durationDays);

    const usage = await this.prisma.traffic.aggregate({
      where: {
        userId,
        createdAt: {
          gte: currentPeriodStart,
        },
      },
      _sum: {
        bytesUsed: true,
      },
    });

    const totalBytesUsed = usage._sum.bytesUsed || 0;
    const totalBytesLimit = subscription.plan.trafficLimitGb * 1024 * 1024 * 1024;

    return {
      bytesUsed: totalBytesUsed,
      bytesLimit: totalBytesLimit,
      percentage: (totalBytesUsed / totalBytesLimit) * 100,
      planName: subscription.plan.name,
    };
  }

  async getHistory(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    return this.prisma.traffic.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getStatistics(userId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalUsage, dailyUsage, weeklyUsage] = await Promise.all([
      this.prisma.traffic.aggregate({
        where: {
          userId,
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        _sum: {
          bytesUsed: true,
        },
        _count: true,
      }),
      this.prisma.traffic.aggregate({
        where: {
          userId,
          createdAt: {
            gte: twentyFourHoursAgo,
          },
        },
        _sum: {
          bytesUsed: true,
        },
      }),
      this.prisma.traffic.aggregate({
        where: {
          userId,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        _sum: {
          bytesUsed: true,
        },
      }),
    ]);

    return {
      last30Days: {
        totalBytes: totalUsage._sum.bytesUsed || 0,
        sessions: totalUsage._count,
      },
      last7Days: {
        totalBytes: weeklyUsage._sum.bytesUsed || 0,
      },
      last24Hours: {
        totalBytes: dailyUsage._sum.bytesUsed || 0,
      },
    };
  }

  async recordUsage(userId: string, bytesUsed: number, serverLocation?: string) {
    return this.prisma.traffic.create({
      data: {
        userId,
        bytesUsed,
        serverLocation,
      },
    });
  }
}
