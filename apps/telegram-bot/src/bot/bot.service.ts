import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import * as https from 'https';

@Injectable()
export class BotService implements OnModuleDestroy {
  private readonly logger = new Logger(BotService.name);
  private readonly bot: Telegraf;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN is not set - bot will not start');
      this.bot = null as any;
      return;
    }

    // Обход блокировки api.telegram.org через прямой IP 149.154.167.220 (проверено curl -k)
    const agent = new https.Agent({
      rejectUnauthorized: false,
      // @ts-ignore — кастомный lookup, чтобы api.telegram.org резолвился в 149.154.167.220
      lookup: (hostname: string, opts: any, cb: any) => {
        if (typeof opts === 'function') {
          cb = opts;
          opts = {};
        }
        if (hostname === 'api.telegram.org') {
          if (opts?.all) return cb(null, [{ address: '149.154.167.220', family: 4 }]);
          return cb(null, '149.154.167.220', 4);
        }
        return (require('dns') as any).lookup(hostname, opts, cb);
      },
    } as any);
    this.bot = new Telegraf(token, {
      telegram: {
        apiRoot: 'https://api.telegram.org',
        agent,
      } as any,
    });

    this.bot.catch((err, ctx) => {
      this.logger.error(`Bot error for ${ctx.updateType}:`, err);
    });

    this.logger.log('Bot initialized (direct IP)');
  }

  async onModuleDestroy() {
    if (this.bot) {
      this.bot.stop('SIGTERM');
      this.logger.log('Bot stopped');
    }
  }

  getBot(): Telegraf {
    return this.bot;
  }

  isReady(): boolean {
    return !!this.bot;
  }

  async sendMessage(chatId: number, text: string, extra?: any): Promise<any> {
    return this.bot.telegram.sendMessage(chatId, text, extra);
  }

  async sendPhoto(chatId: number, photo: string, extra?: any): Promise<any> {
    return this.bot.telegram.sendPhoto(chatId, photo, extra);
  }

  async answerCbQuery(queryId: string, text?: string, showAlert = false): Promise<any> {
    return this.bot.telegram.answerCbQuery(queryId, text, { show_alert: showAlert });
  }

  async editMessageText(
    chatId: number,
    messageId: number,
    text: string,
    extra?: any,
  ): Promise<any> {
    return this.bot.telegram.editMessageText(chatId, messageId, undefined, text, extra);
  }

  async deleteMessage(chatId: number, messageId: number): Promise<any> {
    return this.bot.telegram.deleteMessage(chatId, messageId);
  }

  launch() {
    if (!this.bot) {
      this.logger.warn('Bot not initialized - skipping launch');
      return;
    }
    this.bot.launch();
    this.logger.log('Bot launched');
  }
}
