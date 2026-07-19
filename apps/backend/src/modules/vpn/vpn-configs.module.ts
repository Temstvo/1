import { Module } from '@nestjs/common';
import { VpnConfigsController } from './vpn-configs.controller';
import { VpnConfigSyncService } from './vpn-config-sync.service';
import { VpnConfigScheduler } from './vpn-config-scheduler';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [VpnConfigsController],
  providers: [VpnConfigSyncService, VpnConfigScheduler, PrismaService],
  exports: [VpnConfigSyncService],
})
export class VpnConfigsModule {}
