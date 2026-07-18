import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

class CreateCheckoutDto {
  @IsString()
  planId: string;

  @IsOptional()
  @IsString()
  couponCode?: string;
}

class RefundDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create checkout session' })
  @ApiResponse({ status: 200, description: 'Checkout session created' })
  async createCheckout(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.paymentsService.createCheckoutSession(userId, dto.planId, dto.couponCode);
  }

  @Post('checkout/yookassa')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create YooKassa checkout' })
  @ApiResponse({ status: 200, description: 'YooKassa checkout created' })
  async createYooKassaCheckout(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.paymentsService.createYooKassaPayment(userId, dto.planId, dto.couponCode);
  }

  @Post('checkout/cryptomus')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create Cryptomus checkout' })
  @ApiResponse({ status: 200, description: 'Cryptomus checkout created' })
  async createCryptomusCheckout(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.paymentsService.createCryptomusPayment(userId, dto.planId, dto.couponCode);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user payment history' })
  @ApiResponse({ status: 200, description: 'Payment history' })
  async getPayments(@CurrentUser('id') userId: string) {
    return this.paymentsService.findByUserId(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment details' })
  async getPayment(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refund a payment (admin)' })
  @ApiResponse({ status: 200, description: 'Payment refunded' })
  async refund(@Param('id') id: string, @Body() dto: RefundDto) {
    return this.paymentsService.refund(id, dto.amount);
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment stats (admin)' })
  @ApiResponse({ status: 200, description: 'Payment statistics' })
  async getStats() {
    return this.paymentsService.getPaymentStats();
  }

  @Post('webhook/stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async stripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Body() body: any,
  ) {
    await this.paymentsService.handleStripeWebhook(body);
    return { received: true };
  }

  @Post('webhook/yookassa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'YooKassa webhook handler' })
  async yookassaWebhook(@Body() body: any) {
    return this.paymentsService.handleYooKassaWebhook(body);
  }

  @Post('webhook/cryptomus')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cryptomus webhook handler' })
  async cryptomusWebhook(
    @Headers('sign') signature: string,
    @Body() body: any,
  ) {
    return this.paymentsService.handleCryptomusWebhook(body, signature);
  }
}
