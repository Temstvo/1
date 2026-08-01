import { Module, forwardRef } from '@nestjs/common';
import { VpnService } from './vpn.service';
import { VpnConfigService } from './vpn-config.service';
import { VpnConfigSyncService } from './vpn-config-sync.service';
import { VpnConfigScheduler } from './vpn-config-scheduler';
import { HealthCheckService } from './health-check.service';
import { MigrationService } from './migration.service';
import { VpnController } from './vpn.controller';
import { ConnectionsService } from './connections.service';
import { ConnectionsController } from './connections.controller';
import { ServersModule } from '../servers/servers.module';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [
    forwardRef(() => ServersModule),
    PrismaModule,
  ],
  controllers: [VpnController, ConnectionsController],
  providers: [
    VpnService,
    VpnConfigService,
    VpnConfigSyncService,
    VpnConfigScheduler,
    HealthCheckService,
    MigrationService,
    ConnectionsService,
  ],
  exports: [
    VpnService,
    VpnConfigService,
    VpnConfigSyncService,
    HealthCheckService,
    ConnectionsService,
  ],
})
export class VpnModule {}
