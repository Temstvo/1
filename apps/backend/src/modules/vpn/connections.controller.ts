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
import { ConnectionsService } from './connections.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString, IsEnum } from 'class-validator';

class ConnectDto {
  @IsString()
  serverId: string;

  @IsString()
  deviceId: string;

  @IsEnum(['WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS'])
  protocol: string;
}

@ApiTags('vpn')
@Controller('vpn')
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Post('connect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connect to VPN server' })
  @ApiResponse({ status: 200, description: 'Connected' })
  async connect(
    @CurrentUser('id') userId: string,
    @Body() dto: ConnectDto,
  ) {
    return this.connectionsService.connect(
      userId,
      dto.serverId,
      dto.deviceId,
      dto.protocol as any,
    );
  }

  @Post('disconnect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disconnect from VPN' })
  @ApiResponse({ status: 200, description: 'Disconnected' })
  async disconnect(
    @CurrentUser('id') userId: string,
    @Body('connectionId') connectionId: string,
  ) {
    return this.connectionsService.disconnect(userId, connectionId);
  }

  @Post('disconnect-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disconnect all connections' })
  @ApiResponse({ status: 200, description: 'All disconnected' })
  async disconnectAll(@CurrentUser('id') userId: string) {
    await this.connectionsService.disconnectAll(userId);
    return { message: 'All connections disconnected' };
  }

  @Get('connections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active connections' })
  @ApiResponse({ status: 200, description: 'Active connections' })
  async getActiveConnections(@CurrentUser('id') userId: string) {
    return this.connectionsService.getActiveConnections(userId);
  }

  @Get('connections/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get connection history' })
  @ApiResponse({ status: 200, description: 'Connection history' })
  async getConnectionHistory(@CurrentUser('id') userId: string) {
    return this.connectionsService.getConnectionHistory(userId);
  }
}
