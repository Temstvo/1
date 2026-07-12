import { Injectable, Logger } from '@nestjs/common';
import { BotService } from './bot.service';
import { Telegraf } from 'telegraf';

@Injectable()
export class BotMiddleware {
  private readonly logger = new Logger(BotMiddleware.name);

  constructor(private readonly botService: BotService) {
    this.registerMiddleware();
  }

  private registerMiddleware() {
    const bot = this.botService.getBot();

    bot.use(async (ctx, next) => {
      const start = Date.now();
      await next();
      const ms = Date.now() - start;
      this.logger.log(`Response time: ${ms}ms`);
    });

    bot.use(async (ctx, next) => {
      if (ctx.from) {
        this.logger.log(
          `User ${ctx.from.id} (${ctx.from.username || ctx.from.first_name}) - ${ctx.updateType}`,
        );
      }
      await next();
    });
  }
}
