import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';
import { BotMiddleware } from './bot.middleware';

@Module({
  providers: [BotService, BotMiddleware, BotUpdate],
  exports: [BotService],
})
export class BotModule {}
