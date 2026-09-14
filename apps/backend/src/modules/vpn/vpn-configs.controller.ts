import { Controller, Get, Query, Param, Post, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { VpnConfigSyncService } from './vpn-config-sync.service';

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

  @Get('subscription')
  @ApiOperation({ summary: 'Get all active configs as JSON' })
  async getSubscription() {
    return this.syncService.getActiveSubscription();
  }

  @Get('subscription.txt')
  @ApiOperation({ summary: 'Get all active configs as plain text (for VPN clients like Happ)' })
  async getSubscriptionTxt(@Res() res: Response) {
    const lines = await this.syncService.getSubscriptionLines();
    this.sendSubscription(res, lines);
  }

  @Get('sub/:token')
  @ApiOperation({ summary: 'Short subscription link (for VPN clients like Happ)' })
  async getSubscriptionByToken(@Param('token') token: string, @Res() res: Response) {
    const expected = process.env.SUBSCRIPTION_TOKEN || 'appi-vpn';
    if (token !== expected) {
      res.status(404).send('Not found');
      return;
    }
    const lines = await this.syncService.getSubscriptionLines();
    this.sendSubscription(res, lines);
  }

  private sendSubscription(res: Response, lines: string[]) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Profile-Title', 'APPI VPN');
    res.setHeader('Profile-Update-Interval', '24');
    res.setHeader('Subscription-User-Info', '0/Infinity/1756896000/1/1');
    res.setHeader('Profile-Web-Url', 'https://t.me/appi_vpn_bot');
    res.send(lines.join('\n'));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full config URI by ID' })
  async getConfig(@Param('id') id: string) {
    return this.syncService.getConfigById(id);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Trigger config sync (GitHub)' })
  async sync() {
    return this.syncService.syncAll();
  }

  @Post('sync-local')
  @ApiOperation({ summary: 'Trigger sync from local serv-configs/*.json (desktop)' })
  async syncLocal() {
    return this.syncService.syncFromLocal();
  }
}
