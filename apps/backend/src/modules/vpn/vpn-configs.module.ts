import { Module } from '@nestjs/common';
import { VpnConfigsController } from './vpn-configs.controller';
import { VpnConfigSyncService } from './vpn-config-sync.service';
import { VpnConfigScheduler } from './vpn-config-scheduler';
import { HealthCheckService } from './health-check.service';
import { MigrationService } from './migration.service';

@Module({
  controllers: [VpnConfigsController],
  providers: [VpnConfigSyncService, VpnConfigScheduler, HealthCheckService, MigrationService],
  exports: [VpnConfigSyncService],
})
export class VpnConfigsModule {}
