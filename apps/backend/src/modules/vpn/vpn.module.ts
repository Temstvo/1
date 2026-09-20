import { Module } from '@nestjs/common';
import { VpnService } from './vpn.service';
import { VpnController } from './vpn.controller';
import { MarzbanService } from './marzban.service';
import { ImportedProfilesService } from './imported-profiles.service';
import { ImportedProfilesController } from './imported-profiles.controller';
@Module({
  controllers: [VpnController, ImportedProfilesController],
  providers: [VpnService, MarzbanService, ImportedProfilesService],
  exports: [VpnService],
})
export class VpnModule {}
