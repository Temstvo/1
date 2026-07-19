import { Module } from '@nestjs/common';
import { VpnConfigsController } from './vpn-configs.controller';
import { VpnConfigSyncService } from './vpn-config-sync.service';
import { VpnConfigScheduler } from './vpn-config-scheduler';
import { MigrationService } from './migration.service';

@Module({
  controllers: [VpnConfigsController],
  providers: [VpnConfigSyncService, VpnConfigScheduler, MigrationService],
  exports: [VpnConfigSyncService],
})
export class VpnConfigsModule {}
