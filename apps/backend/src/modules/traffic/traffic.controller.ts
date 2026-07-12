import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TrafficService } from './traffic.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Traffic')
@Controller('traffic')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrafficController {
  constructor(private readonly trafficService: TrafficService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current usage statistics' })
  @ApiResponse({ status: 200, description: 'Current usage retrieved successfully' })
  @ApiResponse({ status: 404, description: 'No active subscription found' })
  async getCurrentUsage(@CurrentUser('id') userId: string) {
    return this.trafficService.getCurrentUsage(userId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get traffic history' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Traffic history retrieved successfully' })
  async getHistory(
    @CurrentUser('id') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.trafficService.getHistory(userId, startDate, endDate);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get traffic statistics' })
  @ApiResponse({ status: 200, description: 'Traffic statistics retrieved successfully' })
  async getStatistics(@CurrentUser('id') userId: string) {
    return this.trafficService.getStatistics(userId);
  }
}
