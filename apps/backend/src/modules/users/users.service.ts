import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { User } from '@prisma/client';
import { lockUser } from '../../database/lock-user';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return this.sanitizeUser(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true },
    });
  }

  async update(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      country?: string;
      language?: string;
      timezone?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        profile: {
          upsert: {
            create: {
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone,
              country: data.country,
              language: data.language || 'en',
              timezone: data.timezone || 'UTC',
            },
            update: {
              ...(data.firstName !== undefined && { firstName: data.firstName }),
              ...(data.lastName !== undefined && { lastName: data.lastName }),
              ...(data.phone !== undefined && { phone: data.phone }),
              ...(data.country !== undefined && { country: data.country }),
              ...(data.language !== undefined && { language: data.language }),
              ...(data.timezone !== undefined && { timezone: data.timezone }),
            },
          },
        },
      },
      include: { profile: true },
    });

    return this.sanitizeUser(updatedUser);
  }

  async delete(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.prisma.$transaction(async (tx) => {
      await lockUser(tx, id);
      await tx.session.updateMany({ where: { userId: id }, data: { isActive: false } });
      await tx.subscription.updateMany({
        where: { userId: id, status: 'ACTIVE' },
        data: { status: 'CANCELLED', cancelledAt: new Date(), autoRenew: false },
      });
      await tx.vpnAccess.updateMany({
        where: { userId: id },
        data: {
          revoked: true,
          enabled: false,
          status: 'PENDING',
          revision: { increment: 1 },
          nextAttemptAt: new Date(),
        },
      });
      await tx.profile.deleteMany({ where: { userId: id } });
      // Keep billing/audit records, anonymize the account and revoke credentials.
      await tx.user.update({
        where: { id },
        data: {
          email: `deleted-${id}@invalid.local`,
          passwordHash: null,
          status: 'INACTIVE',
          emailVerificationTokenHash: null,
          passwordResetTokenHash: null,
          twoFactorSecret: null,
        },
      });
    });
  }

  async getDevices(userId: string) {
    return this.prisma.device.findMany({
      where: { userId },
      orderBy: { lastSeen: 'desc' },
    });
  }

  async removeDevice(userId: string, deviceId: string) {
    const device = await this.prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device || device.userId !== userId) {
      throw new NotFoundException('Устройство не найдено');
    }

    await this.prisma.device.delete({ where: { id: deviceId } });
  }

  async getSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        ip: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
        lastActiveAt: true,
        deviceName: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Сессия не найдена');
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
  }

  private sanitizeUser(user: User & { profile?: any }) {
    const {
      passwordHash,
      twoFactorSecret,
      emailVerificationTokenHash,
      passwordResetTokenHash,
      ...sanitized
    } = user as any;
    return sanitized;
  }
}
