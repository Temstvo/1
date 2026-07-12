import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePlanDto {
  @ApiProperty({ example: 'new-plan-uuid-here' })
  @IsString()
  planId: string;
}
