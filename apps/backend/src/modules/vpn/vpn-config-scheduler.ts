import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VpnConfigSyncService } from './vpn-config-sync.service';
import { HealthCheckService } from './health-check.service';
import { MigrationService } from './migration.service';

@Injectable()
export class VpnConfigScheduler implements OnModuleInit {
  private readonly logger = new Logger(VpnConfigScheduler.name);

  constructor(
    private readonly syncService: VpnConfigSyncService,
    private readonly healthCheckService: HealthCheckService,
    private readonly migrationService: MigrationService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initial VPN config sync on startup (waiting 5s for migration)...');
    setTimeout(async () => {
      try {
        const result = await this.syncService.syncAll();
        this.logger.log(`Startup sync completed: ${JSON.stringify(result)}`);
      } catch (error: any) {
        this.logger.error(`Startup sync failed: ${error.message}`);
      }
    }, 5000);
  }

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

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleHealthCheck() {
    this.logger.log('Running health check...');
    try {
      await this.healthCheckService.forceCheck();
    } catch (error: any) {
      this.logger.error(`Health check failed: ${error.message}`);
    }
  }
}
