import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VpnConfigSyncService } from './vpn-config-sync.service';

@Injectable()
export class VpnConfigScheduler {
  private readonly logger = new Logger(VpnConfigScheduler.name);

  constructor(private readonly syncService: VpnConfigSyncService) {}

  @Cron(CronExpression.EVERY_2_HOURS)
  async handleSync() {
    this.logger.log('Auto-syncing VPN configs...');
    try {
      const result = await this.syncService.syncAll();
      this.logger.log(`Auto-sync completed: ${JSON.stringify(result)}`);
    } catch (error: any) {
      this.logger.error(`Auto-sync failed: ${error.message}`);
    }
  }
}
