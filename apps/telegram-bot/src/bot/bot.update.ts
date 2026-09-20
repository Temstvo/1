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
    // Своя SBP-ссылка (qr.nspk.ru/...) задаётся через SBP_QR_URL, иначе кнопка не показывается
    const sbpUrl = this.config.get<string>('SBP_QR_URL') || '';
    const rows: any[][] = [[{ text: 'Открыть личный кабинет', url: website + '/dashboard' }]];
    if (sbpUrl) rows.push([{ text: '📱 Оплатить по СБП', url: sbpUrl }]);
    const reply = (ctx: any) =>
      ctx.reply(
        'APPI VPN\nТарифы, оплата и персональная конфигурация — в вашем личном кабинете. Войдите в аккаунт на сайте.',
        { reply_markup: { inline_keyboard: rows } },
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
