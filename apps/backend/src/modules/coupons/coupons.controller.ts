import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString, IsNumber, IsOptional, IsEnum, IsArray, IsDateString, Min } from 'class-validator';
import { CouponType } from '@prisma/client';

class CreateCouponDto {
  @IsString()
  code: string;

  @IsEnum(CouponType)
  type: CouponType;

  @IsNumber()
  @Min(0)
  value: number;

  @IsOptional()
  @IsNumber()
  maxUses?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsNumber()
  minAmount?: number;

  @IsOptional()
  @IsArray()
  planIds?: string[];
}

class UpdateCouponDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsEnum(CouponType)
  type?: CouponType;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsNumber()
  maxUses?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsNumber()
  minAmount?: number;

  @IsOptional()
  @IsArray()
  planIds?: string[];

  @IsOptional()
  isActive?: boolean;
}

class ValidateCouponDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  planId?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;
}

@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all coupons (admin)' })
  @ApiResponse({ status: 200, description: 'List of coupons' })
  async findAll() {
    return this.couponsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get coupon by ID (admin)' })
  @ApiResponse({ status: 200, description: 'Coupon details' })
  async findById(@Param('id') id: string) {
    return this.couponsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create coupon (admin)' })
  @ApiResponse({ status: 201, description: 'Coupon created' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateCouponDto) {
    return this.couponsService.create({
      ...dto,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      createdBy: userId,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update coupon (admin)' })
  @ApiResponse({ status: 200, description: 'Coupon updated' })
  async update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(id, {
      ...dto,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete coupon (admin)' })
  @ApiResponse({ status: 200, description: 'Coupon deleted' })
  async delete(@Param('id') id: string) {
    await this.couponsService.delete(id);
    return { message: 'Coupon deleted successfully' };
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate coupon code' })
  @ApiResponse({ status: 200, description: 'Coupon validation result' })
  async validate(@Body() dto: ValidateCouponDto) {
    return this.couponsService.validate(dto.code, dto.planId, dto.amount);
  }

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply coupon (increment usage)' })
  @ApiResponse({ status: 200, description: 'Coupon applied' })
  async apply(@Body('code') code: string) {
    return this.couponsService.apply(code);
  }
}
