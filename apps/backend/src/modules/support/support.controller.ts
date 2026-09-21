import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  ParseUUIDPipe,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { IsString, MaxLength, MinLength, IsIn } from 'class-validator';
import { Throttle } from '@nestjs/throttler';
import { PrismaService } from '../../database/prisma.service';
import { lockUser } from '../../database/lock-user';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class NewTicket {
  @IsString() @MinLength(3) @MaxLength(150) subject: string;
  @IsString() @MinLength(5) @MaxLength(4000) message: string;
}
class Reply {
  @IsString() @MinLength(1) @MaxLength(4000) message: string;
}
class TicketState {
  @IsIn(['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED']) status:
    'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';
}
const staff = (u: { role: string }) => ['ADMIN', 'SUPER_ADMIN'].includes(u.role);

@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private db: PrismaService) {}

  @Get('tickets')
  list(@CurrentUser('id') userId: string) {
    return this.db.ticket.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' }, take: 50 });
  }
  @Get('admin/tickets')
  @UseGuards(AdminGuard)
  queue() {
    return this.db.ticket.findMany({
      where: { status: { notIn: ['CLOSED', 'RESOLVED'] } },
      include: { user: { select: { email: true } } },
      orderBy: { updatedAt: 'asc' },
      take: 100,
    });
  }
  @Post('tickets')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  create(@CurrentUser() user: any, @Body() dto: NewTicket) {
    if (user.email.endsWith('@guest.invalid'))
      throw new ForbiddenException('Сохраните аккаунт, чтобы получать ответы поддержки');
    return this.db.$transaction(async (tx) => {
      await lockUser(tx, user.id);
      if (
        (await tx.ticket.count({
          where: { userId: user.id, status: { notIn: ['CLOSED', 'RESOLVED'] } },
        })) >= 5
      )
        throw new ConflictException('У вас уже пять открытых обращений. Дополните существующее.');
      return tx.ticket.create({
        data: {
          userId: user.id,
          subject: dto.subject,
          messages: { create: { senderId: user.id, message: dto.message, isStaff: false } },
        },
      });
    });
  }
  private async ticket(id: string, user: any) {
    const ticket = await this.db.ticket.findFirst({
      where: { id, ...(staff(user) ? {} : { userId: user.id }) },
    });
    if (!ticket) throw new NotFoundException('Обращение не найдено');
    return ticket;
  }
  @Get('tickets/:id')
  async detail(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    const ticket = await this.ticket(id, user);
    const messages = await this.db.ticketMessage.findMany({
      where: { ticketId: id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return { ...ticket, messages: messages.reverse() };
  }
  @Post('tickets/:id/messages')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async reply(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Body() dto: Reply,
  ) {
    await this.ticket(id, user);
    return this.db.ticket.update({
      where: { id },
      data: {
        status: staff(user) ? 'WAITING' : 'OPEN',
        messages: { create: { senderId: user.id, message: dto.message, isStaff: staff(user) } },
      },
    });
  }
  @Post('tickets/:id/status')
  @UseGuards(AdminGuard)
  async status(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
    @Body() dto: TicketState,
  ) {
    await this.ticket(id, user);
    return this.db.ticket.update({ where: { id }, data: { status: dto.status } });
  }
}
