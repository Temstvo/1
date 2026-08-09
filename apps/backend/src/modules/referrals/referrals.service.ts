import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReferralsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByOwnerId(ownerId: string) {
    return this.prisma.referral.findMany({
      where: { ownerId },
      include: {
        referred: {
          select: { id: true, email: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats(ownerId: string) {
    const referrals = await this.prisma.referral.findMany({
      where: { ownerId },
    });

    const totalReferrals = referrals.length;
    const paidReferrals = referrals.filter((r) => r.paid).length;
    const totalCommission = referrals.reduce(
      (sum, r) => sum + Number(r.commission),
      0,
    );
    const pendingCommission = referrals
      .filter((r) => !r.paid)
      .reduce((sum, r) => sum + Number(r.commission), 0);

    return {
      totalReferrals,
      paidReferrals,
      totalCommission,
      pendingCommission,
    };
  }

  async getReferralLink(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return {
      referralCode: user.referralCode,
      referralLink: `https://appi-vpn.com/register?ref=${user.referralCode}`,
    };
  }

  async registerReferral(ownerCode: string, newUserId: string) {
    const owner = await this.prisma.user.findFirst({
      where: { referralCode: ownerCode },
    });

    if (!owner) {
      throw new NotFoundException('Недействительный реферальный код');
    }

    if (owner.id === newUserId) {
      throw new BadRequestException('Нельзя пригласить самого себя');
    }

    const existing = await this.prisma.referral.findUnique({
      where: { userId: newUserId },
    });

    if (existing) {
      throw new BadRequestException('Пользователь уже приглашён');
    }

    return this.prisma.referral.create({
      data: {
        ownerId: owner.id,
        userId: newUserId,
        commission: 0,
      },
    });
  }

  async addCommission(referralId: string, amount: number) {
    return this.prisma.referral.update({
      where: { id: referralId },
      data: {
        commission: { increment: amount },
      },
    });
  }

  async markAsPaid(referralId: string) {
    return this.prisma.referral.update({
      where: { id: referralId },
      data: { paid: true },
    });
  }

  async payoutPending(ownerId: string) {
    const pending = await this.prisma.referral.findMany({
      where: { ownerId, paid: false, commission: { gt: 0 } },
    });

    const totalAmount = pending.reduce(
      (sum, r) => sum + Number(r.commission),
      0,
    );

    if (totalAmount <= 0) {
      throw new BadRequestException('Нет начислений для выплаты');
    }

    await this.prisma.referral.updateMany({
      where: { ownerId, paid: false, commission: { gt: 0 } },
      data: { paid: true },
    });

    return {
      amount: totalAmount,
      referralsPaid: pending.length,
    };
  }
}
