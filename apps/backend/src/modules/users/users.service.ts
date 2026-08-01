import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true },
    });
  }

  async update(id: string, data: { firstName?: string; lastName?: string; phone?: string; country?: string; language?: string; timezone?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
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
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({ where: { id } });
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
      throw new NotFoundException('Device not found');
    }

    await this.prisma.device.delete({ where: { id: deviceId } });
  }

  async getSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundException('Session not found');
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
  }

  private sanitizeUser(user: User & { profile?: any }) {
    const { passwordHash, twoFactorSecret, emailVerificationTokenHash, passwordResetTokenHash, ...sanitized } = user as any;
    return sanitized;
  }
}
