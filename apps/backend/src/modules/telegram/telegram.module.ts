import { Module } from '@nestjs/common';
import { TelegramNotifyService } from './telegram-notify.service';

@Module({
  imports: [],
  controllers: [],
  providers: [TelegramNotifyService],
  exports: [TelegramNotifyService],
})
export class TelegramModule {}
