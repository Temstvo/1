import { Module } from '@nestjs/common';
import { SubService } from './sub.service';
import { SubController } from './sub.controller';
import { VpnModule } from '../vpn/vpn.module';

@Module({
  imports: [VpnModule],
  controllers: [SubController],
  providers: [SubService],
  exports: [SubService],
})
export class SubModule {}
