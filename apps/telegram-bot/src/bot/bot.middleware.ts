import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BotService } from './bot.service';

@Injectable()
export class BotMiddleware implements OnModuleInit {
  private readonly logger = new Logger(BotMiddleware.name);
  private readonly rateLimits = new Map<number, { count: number; resetAt: number }>();

  constructor(private readonly botService: BotService) {}

  onModuleInit() {
    if (!this.botService.isReady()) {
      this.logger.warn('Bot not ready - skipping middleware');
      return;
    }
    this.registerMiddleware();
  }

  private isRateLimited(userId: number): boolean {
    const now = Date.now();
    const windowMs = 60_000;
    const maxRequests = 30;
    const entry = this.rateLimits.get(userId);

    if (!entry || now > entry.resetAt) {
      this.rateLimits.set(userId, { count: 1, resetAt: now + windowMs });
      return false;
    }

    entry.count++;
    return entry.count > maxRequests;
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

        if (this.isRateLimited(ctx.from.id)) {
          this.logger.warn(`Rate limited user ${ctx.from.id}`);
          await ctx.reply('Please slow down. Try again in a minute.');
          return;
        }
      }
      await next();
    });
  }
}
