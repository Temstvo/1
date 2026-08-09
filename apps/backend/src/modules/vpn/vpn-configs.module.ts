import { Module } from '@nestjs/common';
import { VpnConfigsController } from './vpn-configs.controller';
import { VpnModule } from './vpn.module';

@Module({
  imports: [VpnModule],
  controllers: [VpnConfigsController],
})
export class VpnConfigsModule {}
