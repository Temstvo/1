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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { DevicesService } from './devices.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class CreateDeviceDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  platform?: string;
}

@ApiTags('Devices')
@Controller('devices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user devices' })
  @ApiResponse({ status: 200, description: 'Devices retrieved successfully' })
  async findAll(@CurrentUser('id') userId: string) {
    return this.devicesService.findByUserId(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new device' })
  @ApiResponse({ status: 201, description: 'Device created successfully' })
  async create(
    @Body() dto: CreateDeviceDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.devicesService.create(userId, dto.name || 'Веб-клиент', dto.platform || 'WEB');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a device' })
  @ApiResponse({ status: 200, description: 'Device removed successfully' })
  @ApiResponse({ status: 404, description: 'Device not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.devicesService.remove(id, userId);
  }
}
