import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BotService } from './bot.service';
@Injectable()
export class BotUpdate implements OnModuleInit {
  constructor(
    private bot: BotService,
    private config: ConfigService,
  ) {}
  onModuleInit() {
    if (!this.bot.isReady()) return;
    const website = this.config.get<string>('FRONTEND_URL');
    if (!website || !website.startsWith('https://'))
      throw new Error('Set FRONTEND_URL to your HTTPS website');
    const bot = this.bot.getBot();
    const reply = (ctx: any) =>
      ctx.reply(
        'APPI VPN\nТарифы, оплата и персональная конфигурация — в вашем личном кабинете. Войдите в аккаунт на сайте.',
        {
          reply_markup: {
            inline_keyboard: [[{ text: 'Открыть личный кабинет', url: website + '/dashboard' }]],
          },
        },
      );
    bot.start(reply);
    bot.help(reply);
    bot.command('vpn', reply);
    bot.action(/.*/, async (ctx) => {
      await ctx.answerCbQuery();
      await reply(ctx);
    });
  }
}
