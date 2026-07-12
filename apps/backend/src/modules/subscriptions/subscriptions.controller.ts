import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString, IsOptional } from 'class-validator';

class CreateSubscriptionDto {
  @IsString()
  planId: string;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

class ChangePlanDto {
  @IsString()
  planId: string;

  @IsOptional()
  @IsString()
  couponCode?: string;
}

class CancelDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user subscription' })
  @ApiResponse({ status: 200, description: 'Current subscription' })
  async getCurrent(@CurrentUser('id') userId: string) {
    return this.subscriptionsService.getCurrentUserSubscription(userId);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.create(userId, dto);
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled' })
  async cancel(
    @CurrentUser('id') userId: string,
    @Body() dto: CancelDto,
  ) {
    return this.subscriptionsService.cancel(userId, dto.reason);
  }

  @Post('change-plan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change plan' })
  @ApiResponse({ status: 200, description: 'Plan changed' })
  async changePlan(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePlanDto,
  ) {
    return this.subscriptionsService.changePlan(userId, dto.planId, dto.couponCode);
  }

  @Post('renew')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renew subscription' })
  @ApiResponse({ status: 200, description: 'Subscription renewed' })
  async renew(@CurrentUser('id') userId: string) {
    return this.subscriptionsService.renew(userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all subscriptions (admin)' })
  @ApiResponse({ status: 200, description: 'List of subscriptions' })
  async getAll(@Query('userId') userId?: string) {
    return this.subscriptionsService.getAll(userId);
  }
}
