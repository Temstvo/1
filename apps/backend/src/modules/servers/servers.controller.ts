import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ServersService } from './servers.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString, IsNumber, IsArray, IsOptional, IsEnum, Min, Max } from 'class-validator';

class CreateServerDto {
  @IsString()
  name: string;

  @IsString()
  country: string;

  @IsString()
  city: string;

  @IsString()
  ip: string;

  @IsArray()
  protocols: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100000)
  maxUsers?: number;
}

class UpdateServerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsArray()
  protocols?: string[];

  @IsOptional()
  @IsNumber()
  maxUsers?: number;

  @IsOptional()
  @IsEnum(['ONLINE', 'OFFLINE', 'MAINTENANCE', 'DISABLED'])
  status?: string;
}

class UpdateHealthDto {
  @IsNumber()
  cpu: number;

  @IsNumber()
  ram: number;

  @IsNumber()
  disk: number;

  @IsNumber()
  load: number;

  @IsNumber()
  latency: number;

  @IsNumber()
  packetLoss: number;

  @IsNumber()
  bandwidth: number;
}

@ApiTags('servers')
@Controller('servers')
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all servers' })
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({ name: 'protocol', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'List of servers' })
  async findAll(
    @Query('country') country?: string,
    @Query('protocol') protocol?: string,
    @Query('status') status?: string,
  ) {
    return this.serversService.findAll({
      country,
      protocol,
      status: status as any,
    });
  }

  @Get('countries')
  @ApiOperation({ summary: 'Get server countries' })
  @ApiResponse({ status: 200, description: 'List of countries' })
  async getCountries() {
    return this.serversService.getCountries();
  }

  @Get('recommended')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recommended server' })
  @ApiResponse({ status: 200, description: 'Recommended server' })
  async getRecommended(@CurrentUser('id') userId: string) {
    return this.serversService.findRecommended(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get server by ID' })
  @ApiResponse({ status: 200, description: 'Server details' })
  @ApiResponse({ status: 404, description: 'Server not found' })
  async findById(@Param('id') id: string) {
    return this.serversService.findById(id);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get server statistics' })
  @ApiResponse({ status: 200, description: 'Server statistics' })
  async getStats(@Param('id') id: string) {
    return this.serversService.getServerStats(id);
  }

  @Get(':id/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get server connected users (admin)' })
  @ApiResponse({ status: 200, description: 'Connected users' })
  async getUsers(@Param('id') id: string) {
    return this.serversService.getServerUsers(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a server (admin)' })
  @ApiResponse({ status: 201, description: 'Server created' })
  async create(@Body() dto: CreateServerDto) {
    return this.serversService.create(dto as any);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a server (admin)' })
  @ApiResponse({ status: 200, description: 'Server updated' })
  async update(@Param('id') id: string, @Body() dto: UpdateServerDto) {
    return this.serversService.update(id, dto as any);
  }

  @Patch(':id/health')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update server health (admin)' })
  @ApiResponse({ status: 200, description: 'Health updated' })
  async updateHealth(@Param('id') id: string, @Body() dto: UpdateHealthDto) {
    return this.serversService.updateHealth(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a server (admin)' })
  @ApiResponse({ status: 200, description: 'Server deleted' })
  async delete(@Param('id') id: string) {
    await this.serversService.delete(id);
    return { message: 'Server deleted successfully' };
  }
}
