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
    const backendUrl = this.config.get<string>('BACKEND_URL', 'http://127.0.0.1:3000');
    const api = async (path: string, body?: any) => {
      const res = await fetch(`${backendUrl}/api${path}`, {
        method: body ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data: any = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
      return data;
    };
    const handleStart = async (ctx: any) => {
      const payload = String(ctx.startPayload || '');
      if (payload.startsWith('buy_')) {
        const planId = payload.slice(4);
        const tgId = String(ctx.from?.id || '');
        try {
          const data: any = await api('/payments/bot-checkout', { telegramId: tgId, planId });
          await ctx.reply(`💳 Оплата ${data.amount} ${data.currency}\nНажми чтобы оплатить:`, {
            reply_markup: {
              inline_keyboard: [[{ text: '💳 Оплатить', url: data.confirmationUrl }]],
            },
          });
          return;
        } catch (e: any) {
          await ctx.reply(`❌ Не удалось создать платёж: ${e.message}`);
          return;
        }
      }
      if (payload.startsWith('ref_')) {
        const ref = payload.slice(4);
        try {
          await api('/growth/referral', {
            telegramId: String(ctx.from?.id || ''),
            refCode: `ref_${ref}`,
          });
        } catch {}
      }
      await ctx.reply(
        'APPI VPN\nТарифы, оплата и персональная конфигурация — в вашем личном кабинете. Войдите в аккаунт на сайте.',
        { reply_markup: { inline_keyboard: rows } },
      );
    };
    bot.start(handleStart);
    bot.help((ctx) => handleStart(ctx));
    bot.command('vpn', (ctx) => handleStart(ctx));
    bot.action(/.*/, async (ctx) => {
      await ctx.answerCbQuery();
      await handleStart(ctx);
    });
  }
}
