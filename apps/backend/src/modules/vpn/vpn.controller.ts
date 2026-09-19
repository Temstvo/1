import { Controller, Get, UseGuards, Header } from '@nestjs/common';
import { VpnService } from './vpn.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('vpn')
@UseGuards(JwtAuthGuard)
export class VpnController {
  constructor(private vpn: VpnService) {}
  @Get(['configs', 'config/auto'])
  @Header('Cache-Control', 'no-store')
  configs(@CurrentUser('id') id: string) {
    return this.vpn.getUserConfigs(id);
  }
  @Get('status')
  @Header('Cache-Control', 'no-store')
  status(@CurrentUser('id') id: string) {
    return this.vpn.getStatus(id);
  }
}
