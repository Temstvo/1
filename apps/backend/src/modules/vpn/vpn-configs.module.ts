import { Module } from '@nestjs/common';
import { VpnConfigsController } from './vpn-configs.controller';
import { VpnConfigSyncService } from './vpn-config-sync.service';
import { VpnConfigScheduler } from './vpn-config-scheduler';

@Module({
  controllers: [VpnConfigsController],
  providers: [VpnConfigSyncService, VpnConfigScheduler],
  exports: [VpnConfigSyncService],
})
export class VpnConfigsModule {}
