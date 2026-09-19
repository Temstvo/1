import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  IsString,
  Min,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PrismaService } from '../../database/prisma.service';
import { lockUser } from '../../database/lock-user';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { queueAccess } from '../vpn/access-state';

class AdminAction {
  @IsIn(['block', 'unblock', 'extend', 'revoke', 'restore']) action: string;
  @IsString() @MinLength(3) @MaxLength(300) reason: string;
  @IsOptional() @IsInt() @Min(1) @Max(366) days?: number;
  @IsOptional() @IsUUID() planId?: string;
}
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('overview')
  async overview(@Query('page') page = '1') {
    const n = Math.max(1, Math.min(Number(page) || 1, 10000));
    const [users, payments, subscriptions, vpn, errors, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: (Math.floor(n) - 1) * 50,
        take: 50,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, role: true, status: true, createdAt: true },
      }),
      this.prisma.payment.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          createdAt: true,
          user: { select: { email: true } },
        },
      }),
      this.prisma.subscription.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: { plan: true, user: { select: { email: true } } },
      }),
      this.prisma.vpnAccess.findMany({
        take: 50,
        orderBy: { nextAttemptAt: 'asc' },
        select: {
          userId: true,
          username: true,
          status: true,
          enabled: true,
          revoked: true,
          expiresAt: true,
          lastError: true,
          lastSyncedAt: true,
        },
      }),
      this.prisma.auditLog.findMany({
        where: { result: 'failure' },
        take: 50,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { users, payments, subscriptions, vpn, errors, total, page: Math.floor(n) };
  }

  @Post('users/:id/action')
  async action(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') actorId: string,
    @Body() dto: AdminAction,
  ) {
    if (actorId === id) throw new BadRequestException('Нельзя изменять собственный доступ');
    return this.prisma.$transaction(async (tx) => {
      await lockUser(tx, id);
      const user = await tx.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('Пользователь не найден');
      if (['ADMIN', 'SUPER_ADMIN'].includes(user.role))
        throw new BadRequestException('Управление администраторами выполняется через CLI');
      if (dto.action === 'block' || dto.action === 'unblock') {
        await tx.user.update({
          where: { id },
          data: { status: dto.action === 'block' ? 'BANNED' : 'ACTIVE' },
        });
        if (dto.action === 'block') {
          await tx.session.updateMany({ where: { userId: id }, data: { isActive: false } });
          await tx.vpnAccess.updateMany({
            where: { userId: id },
            data: {
              enabled: false,
              status: 'PENDING',
              revision: { increment: 1 },
              nextAttemptAt: new Date(),
            },
          });
        }
      }
      if (dto.action === 'revoke' || dto.action === 'restore') {
        await tx.vpnAccess.updateMany({
          where: { userId: id },
          data: {
            revoked: dto.action === 'revoke',
            enabled: false,
            status: 'PENDING',
            revision: { increment: 1 },
            nextAttemptAt: new Date(),
          },
        });
      }
      let sub = await tx.subscription.findFirst({
        where: { userId: id, status: 'ACTIVE' },
        include: { plan: true },
        orderBy: { expiresAt: 'desc' },
      });
      if (dto.action === 'extend') {
        if (!dto.days) throw new BadRequestException('Укажите количество дней');
        const plan = dto.planId
          ? await tx.plan.findUnique({ where: { id: dto.planId } })
          : sub?.plan;
        if (!plan) throw new BadRequestException('Укажите тариф');
        const expiresAt = new Date(
          Math.max(Date.now(), sub?.expiresAt.getTime() || 0) + dto.days * 86400000,
        );
        await tx.subscription.updateMany({
          where: { userId: id, status: 'ACTIVE' },
          data: { status: 'CANCELLED' },
        });
        sub = await tx.subscription.create({
          data: { userId: id, planId: plan.id, expiresAt, status: 'ACTIVE', autoRenew: false },
          include: { plan: true },
        });
      }
      if (['extend', 'restore', 'unblock'].includes(dto.action) && sub)
        await queueAccess(tx, id, sub.expiresAt, sub.plan.trafficLimit);
      await tx.auditLog.create({
        data: {
          actorId,
          action: 'ADMIN_' + dto.action.toUpperCase(),
          resource: 'USER',
          resourceId: id,
          metadata: { reason: dto.reason, days: dto.days || null },
          result: 'success',
        },
      });
      return { success: true };
    });
  }
}
