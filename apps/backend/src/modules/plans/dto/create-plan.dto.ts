import { IsString, IsNumber, IsBoolean, IsOptional, Min, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlanDto {
  @ApiProperty({ example: 'Premium VPN' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Best plan for streaming' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 9.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({ example: 10737418240 })
  @IsNumber()
  @Min(0)
  trafficLimit: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  deviceLimit: number;

  @ApiPropertyOptional({ example: ['wireguard', 'openvpn'] })
  @IsArray()
  @IsOptional()
  protocols?: string[];

  @ApiPropertyOptional({ example: ['US', 'EU'] })
  @IsArray()
  @IsOptional()
  regions?: string[];

  @ApiPropertyOptional({ example: ['streaming', 'p2p'] })
  @IsArray()
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
