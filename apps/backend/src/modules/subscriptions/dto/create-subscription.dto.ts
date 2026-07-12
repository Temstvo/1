import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'plan-uuid-here' })
  @IsString()
  planId: string;

  @ApiPropertyOptional({ example: 'stripe' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'txn-123456' })
  @IsString()
  @IsOptional()
  transactionId?: string;
}
