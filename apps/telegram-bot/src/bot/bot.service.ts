import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';

@Injectable()
export class BotService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BotService.name);
  private bot!: Telegraf;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set');
    }

    this.bot = new Telegraf(token);

    this.bot.catch((err, ctx) => {
      this.logger.error(`Bot error for ${ctx.updateType}:`, err);
    });

    this.logger.log('Bot initialized');
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
    this.bot.launch();
    this.logger.log('Bot launched');
  }
}
