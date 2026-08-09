import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    return this.prisma.device.findMany({
      where: { userId },
      orderBy: { lastSeen: 'desc' },
    });
  }

  async findById(id: string, userId: string) {
    const device = await this.prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException('Устройство не найдено');
    }

    if (device.userId !== userId) {
      throw new ForbiddenException('Доступ запрещён');
    }

    return device;
  }

  async remove(id: string, userId: string) {
    const device = await this.findById(id, userId);

    return this.prisma.device.delete({
      where: { id: device.id },
    });
  }

  async updateLastSeen(id: string) {
    const device = await this.prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException('Устройство не найдено');
    }

    return this.prisma.device.update({
      where: { id },
      data: {
        lastSeen: new Date(),
      },
    });
  }
}
