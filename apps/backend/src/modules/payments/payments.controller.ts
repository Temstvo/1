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
  @Post('bot-checkout')
  @HttpCode(200)
  botCheckout(@Body() body: { telegramId: string; planId: string }) {
    if (!body?.telegramId || !body?.planId)
      throw new BadRequestException('telegramId and planId required');
    return this.payments.createBotCheckout(String(body.telegramId), String(body.planId));
  }

  @Post('webhook/yookassa')
  @HttpCode(200)
  webhook(@Body() body: unknown) {
    return this.payments.handleYooKassaWebhook(body);
  }

  @Post('bot-crypto')
  @HttpCode(200)
  botCrypto(@Body() body: { telegramId: string; kind: 'premium_30' | 'donate' }) {
    if (!body?.telegramId || !['premium_30', 'donate'].includes(body.kind))
      throw new BadRequestException('telegramId and kind required');
    return this.payments.createCryptoInvoice(String(body.telegramId), body.kind);
  }

  @Post('bot-crypto/check')
  @HttpCode(200)
  botCryptoCheck(@Body() body: { telegramId: string; invoiceId: number }) {
    if (!body?.telegramId || !body?.invoiceId)
      throw new BadRequestException('telegramId and invoiceId required');
    return this.payments.checkCryptoInvoice(String(body.telegramId), Number(body.invoiceId));
  }
}
