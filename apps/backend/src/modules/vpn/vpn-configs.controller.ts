import { Controller, Get, Query, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { VpnConfigSyncService } from './vpn-config-sync.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('vpn-configs')
@Controller('vpn-configs')
export class VpnConfigsController {
  constructor(private readonly syncService: VpnConfigSyncService) {}

  @Get()
  @ApiOperation({ summary: 'Get available VPN configs' })
  @ApiQuery({ name: 'protocol', required: false })
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({ name: 'listType', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getConfigs(
    @Query('protocol') protocol?: string,
    @Query('country') country?: string,
    @Query('listType') listType?: string,
    @Query('search') search?: string,
  ) {
    return this.syncService.getConfigs({ protocol, country, listType, search });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get config statistics' })
  async getStats() {
    return this.syncService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full config URI by ID' })
  async getConfig(@Param('id') id: string) {
    return this.syncService.getConfigById(id);
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger config sync (admin only)' })
  async sync() {
    return this.syncService.syncAll();
  }
}
