import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export class CreateNotificationDto {
  @ApiProperty({ example: 'Subscription Expiring' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Your subscription will expire in 3 days' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ enum: NotificationType, example: NotificationType.WARNING })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;
}
