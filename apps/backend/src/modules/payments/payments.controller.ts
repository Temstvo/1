import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UseGuards,
  HttpCode,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { IsUUID, IsOptional, IsString, MaxLength, IsIn } from 'class-validator';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class CheckoutDto {
  @IsUUID() planId: string;
  @IsOptional() @IsString() @MaxLength(50) couponCode?: string;
  @IsOptional() @IsIn(['YOOKASSA']) provider?: string;
}
@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}
  @Post(['checkout', 'checkout/yookassa'])
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  checkout(
    @CurrentUser('id') userId: string,
    @Body() dto: CheckoutDto,
    @Headers('idempotency-key') key?: string,
  ) {
    if (!key || !/^[a-zA-Z0-9_-]{16,64}$/.test(key))
      throw new BadRequestException('Нужен Idempotency-Key (16–64 символа)');
    return this.payments.createCheckoutSession(
      userId,
      dto.planId,
      dto.couponCode,
      dto.provider,
      key,
    );
  }
  @Get()
  @UseGuards(JwtAuthGuard)
  history(@CurrentUser('id') userId: string) {
    return this.payments.findByUserId(userId);
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  one(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.payments.findById(id, userId);
  }
  @Post('webhook/yookassa')
  @HttpCode(200)
  webhook(@Body() body: unknown) {
    return this.payments.handleYooKassaWebhook(body);
  }
}
