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
    const cardUrl =
      this.config.get<string>('KASSA_CARD_URL') ||
      'https://paymentt.kassa.ai/?id=332943747&hash=b19d8a97fe5774287761c61501fe9506';
    const sbpUrl =
      this.config.get<string>('KASSA_SBP_URL') ||
      'https://paymentt.kassa.ai/qr/?id=332943802&hash=77b383dbddbc1c54bab31bf81e4ab9d1&';
    const reply = (ctx: any) =>
      ctx.reply(
        'APPI VPN\nТарифы, оплата и персональная конфигурация — в вашем личном кабинете. Войдите в аккаунт на сайте.\n\nБыстрая оплата 219 ₽:',
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Открыть личный кабинет', url: website + '/dashboard' }],
              [{ text: '💳 Оплатить картой 219 ₽', url: cardUrl }],
              [{ text: '📱 Оплатить по СБП 219 ₽', url: sbpUrl }],
            ],
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
