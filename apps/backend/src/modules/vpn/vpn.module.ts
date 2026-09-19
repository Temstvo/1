import { Module } from '@nestjs/common';
import { VpnService } from './vpn.service';
import { VpnController } from './vpn.controller';
import { MarzbanService } from './marzban.service';
@Module({
  controllers: [VpnController],
  providers: [VpnService, MarzbanService],
  exports: [VpnService],
})
export class VpnModule {}
