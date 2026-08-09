import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationType as PrismaNotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Уведомление не найдено');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Уведомление не найдено');
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        read: true,
      },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  }

  async delete(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Уведомление не найдено');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Уведомление не найдено');
    }

    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async create(userId: string, createNotificationDto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId,
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        type: (createNotificationDto.type as unknown as PrismaNotificationType) || PrismaNotificationType.GENERAL,
      },
    });
  }
}
