import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VpnService } from './vpn.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString, IsEnum } from 'class-validator';

class GenerateConfigDto {
  @IsString()
  serverId: string;

  @IsEnum(['WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS'])
  protocol: string;
}

@ApiTags('vpn')
@Controller('vpn')
export class VpnController {
  constructor(private readonly vpnService: VpnService) {}

  @Post('config/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate VPN configuration' })
  @ApiResponse({ status: 201, description: 'Config generated' })
  async generateConfig(
    @CurrentUser('id') userId: string,
    @Body() dto: GenerateConfigDto,
  ) {
    return this.vpnService.generateConfig(userId, dto.serverId, dto.protocol as any);
  }

  @Get('configs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user VPN configurations' })
  @ApiResponse({ status: 200, description: 'List of configs' })
  async getConfigs(@CurrentUser('id') userId: string) {
    return this.vpnService.getUserConfigs(userId);
  }

  @Get('config/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get config QR code data' })
  @ApiResponse({ status: 200, description: 'Config QR data' })
  async getConfigQr(@Param('id') configId: string) {
    return this.vpnService.getConfigQrCode(configId);
  }

  @Delete('config/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete VPN configuration' })
  @ApiResponse({ status: 200, description: 'Config deleted' })
  async deleteConfig(
    @CurrentUser('id') userId: string,
    @Param('id') configId: string,
  ) {
    await this.vpnService.deleteConfig(userId, configId);
    return { message: 'Config deleted successfully' };
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get VPN status' })
  @ApiResponse({ status: 200, description: 'VPN status' })
  async getStatus(@CurrentUser('id') userId: string) {
    return this.vpnService.getStatus(userId);
  }
}
