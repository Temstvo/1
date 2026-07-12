import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString } from 'class-validator';

class RegisterReferralDto {
  @IsString()
  referralCode: string;
}

@ApiTags('referrals')
@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user referrals' })
  @ApiResponse({ status: 200, description: 'List of referrals' })
  async getReferrals(@CurrentUser('id') userId: string) {
    return this.referralsService.findByOwnerId(userId);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get referral stats' })
  @ApiResponse({ status: 200, description: 'Referral statistics' })
  async getStats(@CurrentUser('id') userId: string) {
    return this.referralsService.getStats(userId);
  }

  @Get('link')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get referral link' })
  @ApiResponse({ status: 200, description: 'Referral link' })
  async getLink(@CurrentUser('id') userId: string) {
    return this.referralsService.getReferralLink(userId);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register referral' })
  @ApiResponse({ status: 200, description: 'Referral registered' })
  async register(
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterReferralDto,
  ) {
    return this.referralsService.registerReferral(dto.referralCode, userId);
  }

  @Post('payout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request referral payout' })
  @ApiResponse({ status: 200, description: 'Payout processed' })
  async payout(@CurrentUser('id') userId: string) {
    return this.referralsService.payoutPending(userId);
  }
}
