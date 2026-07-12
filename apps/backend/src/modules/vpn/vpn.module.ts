import { Module, forwardRef } from '@nestjs/common';
import { VpnService } from './vpn.service';
import { VpnConfigService } from './vpn-config.service';
import { VpnController } from './vpn.controller';
import { ConnectionsService } from './connections.service';
import { ConnectionsController } from './connections.controller';
import { ServersModule } from '../servers/servers.module';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [forwardRef(() => ServersModule), PrismaModule],
  controllers: [VpnController, ConnectionsController],
  providers: [VpnService, VpnConfigService, ConnectionsService],
  exports: [VpnService, VpnConfigService, ConnectionsService],
})
export class VpnModule {}
