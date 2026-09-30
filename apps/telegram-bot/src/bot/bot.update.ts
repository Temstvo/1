import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';
import { BotService } from './bot.service';
import { mainMenuKeyboard, backButton } from './keyboards';

@Injectable()
export class BotUpdate implements OnModuleInit {
  private readonly logger = new Logger(BotUpdate.name);
  private backendUrl: string;
  private subToken: string;

  constructor(
    private readonly botService: BotService,
    private readonly configService: ConfigService,
  ) {
    this.backendUrl = this.configService.get<string>('BACKEND_URL', 'http://localhost:3000');
    this.subToken = this.configService.get<string>('SUBSCRIPTION_TOKEN', 'K7vQ-9pL2wX4mZ8n');
  }

  onModuleInit() {
    if (!this.botService.isReady()) {
      this.logger.warn('Bot not ready - skipping handlers');
      return;
    }
    this.registerHandlers();
  }

  private botSecret(): string {
    return this.configService.get<string>('BOT_API_SECRET', '');
  }

  private async api(
    path: string,
    options: { method?: string; body?: any; headers?: Record<string, string> } = {},
  ) {
    const { method = 'GET', body } = options;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    const res = await fetch(`${this.backendUrl}/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = data?.message || data?.error || `Error ${res.status}`;
      throw new Error(Array.isArray(msg) ? msg[0] : msg);
    }
    return data;
  }

  private async editOrReply(ctx: Context, text: string, extra?: any) {
    try {
      await ctx.editMessageText(text, extra);
    } catch {
      try {
        await ctx.reply(text, extra);
      } catch {}
    }
  }

  private registerHandlers() {
    const bot = this.botService.getBot();
    // Глушим протухшие callback'и (query is too old), чтобы не падали хендлеры
    bot.use(async (ctx, next) => {
      const orig = ctx.answerCbQuery.bind(ctx);
      (ctx as any).answerCbQuery = async (...args: any[]) => {
        try {
          return await (orig as any)(...args);
        } catch {
          return true as any;
        }
      };
      await next();
    });
    bot.start((ctx) => this.handleStart(ctx));
    bot.help((ctx) => this.handleHelp(ctx));
    bot.action('menu:main', (ctx) => this.handleMainMenu(ctx));
    bot.action('menu:subscription', (ctx) => this.handleGetSubscription(ctx));
    bot.action('menu:mysubscription', (ctx) => this.handleMySubscription(ctx));
    bot.action('menu:profile', (ctx) => this.handleProfile(ctx));
    bot.action('menu:instructions', (ctx) => this.handleInstructions(ctx));
    bot.action('menu:status', (ctx) => this.handleStatus(ctx));
    bot.action('menu:help', (ctx) => this.handleHelpAction(ctx));
    bot.action('menu:premium', (ctx) => this.handlePremium(ctx));
    bot.action('menu:extend', (ctx) => this.handleExtend(ctx));
    bot.action(/^stars:(.+)$/, (ctx) => this.handleStarsBuy(ctx));
    bot.action(/^crypto:(.+)$/, (ctx) => this.handleCryptoBuy(ctx));
    bot.action(/^check:(\d+)$/, (ctx) => this.handleCryptoCheck(ctx));
    bot.action(/^manual:(.+)$/, (ctx) => this.handleManualBuy(ctx));
    bot.action(/^done:(.+)$/, (ctx) => this.handleManualDone(ctx));
    bot.action(/^approve:(.+)$/, (ctx) => this.handleManualApprove(ctx));
    bot.action(/^getconfig:(.+)$/, (ctx) => this.handleGetConfig(ctx));
    bot.action(/^configlist:(.+)$/, (ctx) => this.handleConfigList(ctx));
    bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true));
    bot.on('successful_payment', (ctx) => this.handleSuccessPayment(ctx));
  }

  private async handleStart(ctx: Context) {
    // С лендинга: /start buy_<planId> — оплата только Stars
    try {
      const p2 = String((ctx as any).startPayload || '');
      if (p2.indexOf('buy_') === 0) {
        await this.sendPremiumOptions(ctx);
        return;
      }
    } catch {}
    const infoText =
      'Сотни рабочих серверов. Без оплат и лимитов — список обновляется сам.\n\n' +
      'Как подключиться\n\n' +
      '1️⃣ Установи Happ\n' +
      'happ.su — iPhone, Android, Windows, Mac\n' +
      '(подробнее — «📱 Инструкция / приложения»)\n\n' +
      '2️⃣ Нажми «🚀 Импорт в Happ» внизу\n' +
      'Подписка добавится в приложение.\n\n' +
      '3️⃣ В Happ нажми кнопку подключения ✅\n\n' +
      '💡 Не работает один сервер — выбери другой в списке.';
    await ctx.replyWithPhoto('https://i.imgur.com/xXdMEEG.png', {
      caption: infoText,
      reply_markup: { inline_keyboard: mainMenuKeyboard },
    });
  }

  private async handleMainMenu(ctx: Context) {
    await ctx.answerCbQuery();
    await this.editOrReply(ctx, '🎁 Бесплатный VPN APPI\n\nВыберите действие:', {
      reply_markup: { inline_keyboard: mainMenuKeyboard },
    });
  }

  private async handleGetSubscription(ctx: Context) {
    await ctx.answerCbQuery();
    try {
      const tgId = String((ctx.from as any)?.id || (ctx.chat as any)?.id || '0');
      const data: any = await this.api('/sub-links', {
        method: 'POST',
        body: { telegramId: tgId },
      });
      const subUrl: string = data.url;
      const label: string = data.label || tgId;
      const exp = data.expiresAt ? new Date(data.expiresAt).toLocaleDateString('ru-RU') : '';
      await this.editOrReply(
        ctx,
        `🌐 Импорт в Happ\n\n` +
          `Твоя ссылка для Happ:\n\n` +
          `${subUrl}\n\n` +
          `ID: ${label} • Истекает: ${exp}\n\n` +
          `Как добавить:\n` +
          `1. Скопируй ссылку\n` +
          `2. Открой Happ → «+» → «Из буфера»\n` +
          `3. Нажми подключение ✅`,
        { reply_markup: { inline_keyboard: [[backButton]] } },
      );
    } catch (e: any) {
      await this.editOrReply(ctx, `❌ Ошибка: ${e.message}`, {
        reply_markup: { inline_keyboard: [[backButton]] },
      });
    }
  }

  private async handleConfigList(ctx: any) {
    const protocol = ctx.match?.[1];
    await ctx.answerCbQuery();
    try {
      const allConfigs = await this.api('/vpn-configs/subscription');
      const configs = Array.isArray(allConfigs) ? allConfigs : [];
      const filtered =
        protocol === 'all'
          ? configs.slice(0, 30)
          : configs.filter((c: any) => c.protocol === protocol).slice(0, 30);
      if (filtered.length === 0) {
        await this.editOrReply(ctx, 'Нет конфигов для этого протокола.', {
          reply_markup: { inline_keyboard: [[backButton]] },
        });
        return;
      }
      const flag = (code: string) => {
        if (!code || code.length !== 2) return '🌐';
        return String.fromCodePoint(
          ...[...code.toUpperCase()].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)),
        );
      };
      const keyboard: any[][] = filtered.map((c: any) => [
        {
          text: `${flag(c.countryCode)} ${c.country || c.server} · ${c.protocol.toUpperCase()}`,
          callback_data: `getconfig:${c.id}`,
        },
      ]);
      keyboard.push([backButton]);
      const title = protocol === 'all' ? 'Все конфиги' : protocol.toUpperCase();
      await this.editOrReply(ctx, `🌐 ${title}\n\nВыберите сервер:`, {
        reply_markup: { inline_keyboard: keyboard },
      });
    } catch (e: any) {
      await this.editOrReply(ctx, `❌ Ошибка: ${e.message}`, {
        reply_markup: { inline_keyboard: [[backButton]] },
      });
    }
  }

  private async handleGetConfig(ctx: any) {
    const configId = ctx.match?.[1];
    await ctx.answerCbQuery();
    try {
      const config = await this.api(`/vpn-configs/${configId}`);
      if (!config || !config.uri) {
        await this.editOrReply(ctx, 'Конфиг не найден.', {
          reply_markup: { inline_keyboard: [[backButton]] },
        });
        return;
      }
      const flag = (code: string) => {
        if (!code || code.length !== 2) return '🌐';
        return String.fromCodePoint(
          ...[...code.toUpperCase()].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)),
        );
      };
      const f = flag(config.countryCode);
      await this.editOrReply(
        ctx,
        `${f} ${config.country || config.server}\n\n` +
          `Протокол: ${(config.protocol || '').toUpperCase()}\n` +
          `Сервер: ${config.server || '—'}\n\n` +
          `Ссылка:\n${config.uri}\n\n` +
          `💡 Скопируйте ссылку выше и вставьте в Happ или другой VPN-клиент.`,
        { reply_markup: { inline_keyboard: [[backButton]] } },
      );
    } catch (e: any) {
      await this.editOrReply(ctx, `❌ Ошибка: ${e.message}`, {
        reply_markup: { inline_keyboard: [[backButton]] },
      });
    }
  }

  private async handleMySubscription(ctx: Context) {
    await ctx.answerCbQuery();
    try {
      const tgId = String((ctx.from as any)?.id || '0');
      // Параллельно: ссылка + статистика (было последовательно — тормозило)
      const [data, stats]: any[] = await Promise.all([
        this.api('/sub-links', { method: 'POST', body: { telegramId: tgId } }),
        this.growthStats(tgId),
      ]);
      const exp = new Date(data.expiresAt);
      const daysLeft = Math.max(0, Math.ceil((exp.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
      const traffic = (Number(data.trafficUsed) / 1024 / 1024 / 1024).toFixed(2);
      const premLine = stats?.isPremium
        ? `⭐ Premium до ${new Date(stats.premiumUntil).toLocaleDateString('ru-RU')}\n`
        : '';
      await this.editOrReply(
        ctx,
        `🔗 Моя подписка\n\n` +
          premLine +
          `ID: ${data.label}\n` +
          `Статус: Активна\n` +
          `Истекает: ${exp.toLocaleDateString('ru-RU')} (через ${daysLeft} дн.)\n` +
          `Трафик: ${traffic} GiB / ∞\n` +
          `Ссылка:\n${data.url}\n\n` +
          `Нажми «🚀 Импорт в Happ» чтобы скопировать.`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🚀 Импорт в Happ', callback_data: 'menu:subscription' }],
              [{ text: '🌐 Открыть в браузере', url: data.url }],
              [
                { text: '🔄 Продлить +2 дня', callback_data: 'menu:extend' },
                { text: '⭐ Premium', callback_data: 'menu:premium' },
              ],
              [backButton],
            ],
          },
        },
      );
    } catch (e: any) {
      await this.editOrReply(ctx, `❌ Ошибка: ${e.message}`, {
        reply_markup: { inline_keyboard: [[backButton]] },
      });
    }
  }

  private async handleProfile(ctx: Context) {
    await ctx.answerCbQuery();
    try {
      const tgId = String((ctx.from as any)?.id || '0');
      const username = (ctx.from as any)?.username ? `@${(ctx.from as any).username}` : '—';
      // Параллельно: ссылка + статистика (было последовательно — тормозило)
      const [data, stats]: any[] = await Promise.all([
        this.api('/sub-links', { method: 'POST', body: { telegramId: tgId } }),
        this.growthStats(tgId),
      ]);
      const exp = new Date(data.expiresAt).toLocaleDateString('ru-RU');
      const premLine = stats?.isPremium
        ? `⭐ Premium до ${new Date(stats.premiumUntil).toLocaleDateString('ru-RU')}\n`
        : `Premium: нет (кнопка ⭐ в меню)\n`;
      await this.editOrReply(
        ctx,
        `👤 Профиль\n\n` +
          `Telegram ID: ${tgId}\n` +
          `Username: ${username}\n` +
          premLine +
          `Подписка: ${data.label}\n` +
          `Истекает: ${exp}\n\n` +
          `Бесплатный VPN без регистрации.`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔗 Моя подписка', callback_data: 'menu:mysubscription' }],
              [backButton],
            ],
          },
        },
      );
    } catch (e: any) {
      await this.editOrReply(ctx, `❌ Ошибка: ${e.message}`, {
        reply_markup: { inline_keyboard: [[backButton]] },
      });
    }
  }

  private async handleInstructions(ctx: Context) {
    await ctx.answerCbQuery();
    await this.editOrReply(
      ctx,
      '📱 Инструкция / приложения\n\n' +
        'Happ — VPN-клиент для всех платформ.\n\n' +
        'Скачать:\n' +
        '• iPhone — https://apps.apple.com/us/app/happ-proxy-utility/id6504287215\n' +
        '• Android — https://play.google.com/store/apps/details?id=com.happproxy\n' +
        '• Windows/Mac/Linux — https://www.happ.su/main\n\n' +
        'Как подключить:\n' +
        '1. Установи Happ\n' +
        '2. Нажми «🚀 Импорт в Happ» в главном меню\n' +
        '3. В Happ нажми кнопку подключения ✅\n\n' +
        '💡 Не работает один сервер — выбери другой из списка.',
      { reply_markup: { inline_keyboard: [[backButton]] } },
    );
  }

  private async handleStatus(ctx: Context) {
    await ctx.answerCbQuery();
    try {
      const tgId = String((ctx.from as any)?.id || '0');
      const [health, link, configs] = await Promise.all([
        this.api('/health').catch(() => ({ status: 'unknown' })),
        this.api('/sub-links', { method: 'POST', body: { telegramId: tgId } }).catch(() => null),
        this.api('/vpn-configs/subscription').catch(() => []),
      ]);
      const count = Array.isArray(configs) ? configs.length : 0;
      const label = (link as any)?.label || '—';
      const exp = (link as any)?.expiresAt
        ? new Date((link as any).expiresAt).toLocaleDateString('ru-RU')
        : '—';
      await this.editOrReply(
        ctx,
        `📊 Статус аккаунта\n\n` +
          `• Telegram ID: ${tgId}\n` +
          `• Подписка: ${label}\n` +
          `• Истекает: ${exp}\n` +
          `• Серверов: ${count}\n` +
          `• Устройств: безлимит\n\n` +
          `🔧 Система\n` +
          `• API: ${(health as any).status || 'unknown'}\n` +
          `• БД: ${(health as any).database || 'unknown'}\n` +
          `• Аптайм: ${Math.floor(((health as any).uptime || 0) / 60)} мин`,
        { reply_markup: { inline_keyboard: [[backButton]] } },
      );
    } catch (e: any) {
      await this.editOrReply(ctx, `❌ Ошибка: ${e.message}`, {
        reply_markup: { inline_keyboard: [[backButton]] },
      });
    }
  }

  private async handleHelpAction(ctx: Context) {
    await ctx.answerCbQuery();
    await this.editOrReply(
      ctx,
      '❓ Помощь\n\n' +
        'Команды:\n' +
        '/start — Главное меню\n' +
        '/help — Эта справка\n\n' +
        'Проблемы:\n' +
        '• VPN не подключается → выберите другой сервер\n' +
        '• Медленная скорость → смените протокол на Hysteria2\n' +
        '• Нет интернета через VPN → отключите и подключитесь снова',
      { reply_markup: { inline_keyboard: [[backButton]] } },
    );
  }

  private async handleHelp(ctx: Context) {
    await ctx.reply(
      '❓ Помощь\n\n' +
        'Команды:\n' +
        '/start — Главное меню\n' +
        '/help — Эта справка\n\n' +
        'Проблемы:\n' +
        '• VPN не подключается → выберите другой сервер\n' +
        '• Медленная скорость → смените протокол на Hysteria2\n' +
        '• Нет интернета через VPN → отключите и подключитесь снова',
      { reply_markup: { inline_keyboard: [[backButton]] } },
    );
  }

  private async growthStats(tgId: string): Promise<any> {
    return this.api(`/growth/stats/${tgId}`).catch(() => null);
  }

  private async handlePremium(ctx: Context) {
    await ctx.answerCbQuery();
    await this.sendPremiumOptions(ctx, true);
  }

  private async sendPremiumOptions(ctx: Context, edit = false) {
    const manualDetails = this.manualDetails();
    const text =
      `⭐ Premium\n\n` +
      `1️⃣ Telegram Stars — оплата в 1 тап прямо здесь.\n` +
      `Звёзды дешевле всего брать через @PremiumBot или Fragment (оплата СБП/картой), а не через App Store (+30%).\n\n` +
      `2️⃣ Крипта (USDT) — через @CryptoBot, без Stars.\n\n` +
      (manualDetails ? `3️⃣ Перевод напрямую — карта/СБП, подтверждаю вручную.\n\n` : ``) +
      `Каждый платёж продлевает твою подписку и поддерживает проект.`;
    const extra = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '⭐ Premium 30 дней — 99 ⭐', callback_data: 'stars:premium_30' }],
          [{ text: '💛 Донат 25 ⭐', callback_data: 'stars:donate_25' }],
          [
            { text: '💎 Premium 2 USDT', callback_data: 'crypto:premium_30' },
            { text: '💎 Донат 0.5 USDT', callback_data: 'crypto:donate' },
          ],
          ...(manualDetails
            ? [
                [{ text: '💳 Premium переводом 219 ₽', callback_data: 'manual:premium_30' }],
                [{ text: '💳 Донат переводом', callback_data: 'manual:donate' }],
              ]
            : []),
          ...(edit ? [[backButton]] : []),
        ],
      },
    };
    if (edit) {
      await this.editOrReply(ctx, text, extra);
    } else {
      await ctx.reply(text, extra);
    }
  }

  private async handleStarsBuy(ctx: any) {
    const kind = String(ctx.match?.[1] || '');
    await ctx.answerCbQuery();
    const tgId = String((ctx.from as any)?.id || '0');
    const offers: Record<string, { title: string; desc: string; amount: number; payload: string }> =
      {
        premium_30: {
          title: 'APPI VPN Premium — 30 дней',
          desc: 'Подписка 30 дней + приоритетные серверы',
          amount: 99,
          payload: `premium_30_${tgId}`,
        },
        donate_25: {
          title: 'Донат APPI VPN',
          desc: 'Поддержка проекта +1 день подписки',
          amount: 25,
          payload: `donate_25_${tgId}`,
        },
      };
    const offer = offers[kind];
    if (!offer) return;
    try {
      await ctx.replyWithInvoice({
        title: offer.title,
        description: offer.desc,
        payload: offer.payload,
        provider_token: '',
        currency: 'XTR',
        prices: [{ label: offer.title, amount: offer.amount }],
      });
    } catch (e: any) {
      await this.editOrReply(ctx, `❌ Не удалось создать счёт: ${e.message}`, {
        reply_markup: { inline_keyboard: [[backButton]] },
      });
    }
  }

  private async handleSuccessPayment(ctx: any) {
    try {
      const pay = ctx.message?.successful_payment as any;
      if (!pay) return;
      const payload = String(pay.payload || '');
      const tgId = String((ctx.from as any)?.id || '0');
      const stars = Number(pay.total_amount || 0);
      if (payload.startsWith('premium_30_')) {
        await this.api('/sub-links/extend', {
          method: 'POST',
          headers: { 'x-bot-secret': this.botSecret() },
          body: { telegramId: tgId, days: 30 },
        });
        await ctx.reply(
          '⭐ Premium активирован на 30 дней! Спасибо за поддержку.\nПроверь «🔗 Моя подписка» — срок продлён.',
        );
      } else if (payload.startsWith('donate_')) {
        await this.api('/sub-links/extend', {
          method: 'POST',
          headers: { 'x-bot-secret': this.botSecret() },
          body: { telegramId: tgId, days: 1 },
        });
        await ctx.reply('💛 Спасибо за донат! Тебе начислен +1 день подписки.');
      }
    } catch (e: any) {
      this.logger.error(`successPayment: ${e.message}`);
    }
  }

  private async handleCryptoBuy(ctx: any) {
    const kind = String(ctx.match?.[1] || '');
    if (kind !== 'premium_30' && kind !== 'donate') return;
    await ctx.answerCbQuery();
    const tgId = String((ctx.from as any)?.id || '0');
    try {
      const inv: any = await this.api('/payments/bot-crypto', {
        method: 'POST',
        body: { telegramId: tgId, kind },
      });
      await ctx.reply(
        `💎 ${inv.title}\n${inv.amount} ${inv.asset}\n\nОплати в @CryptoBot, затем нажми проверку:`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: `💎 Оплатить ${inv.amount} ${inv.asset}`, url: inv.invoiceUrl }],
              [{ text: '✅ Я оплатил — проверить', callback_data: `check:${inv.invoiceId}` }],
              [backButton],
            ],
          },
        },
      );
    } catch (e: any) {
      await this.editOrReply(ctx, `❌ Крипто-оплата пока недоступна: ${e.message}`, {
        reply_markup: { inline_keyboard: [[backButton]] },
      });
    }
  }

  private async handleCryptoCheck(ctx: any) {
    const invoiceId = Number(ctx.match?.[1] || 0);
    await ctx.answerCbQuery();
    const tgId = String((ctx.from as any)?.id || '0');
    try {
      const res: any = await this.api('/payments/bot-crypto/check', {
        method: 'POST',
        body: { telegramId: tgId, invoiceId },
      });
      if (res?.paid) {
        await this.editOrReply(
          ctx,
          '✅ Оплата подтверждена! Подписка продлена на 30 дней. Проверь «🔗 Моя подписка».',
          { reply_markup: { inline_keyboard: [[backButton]] } },
        );
      } else {
        await ctx
          .answerCbQuery('⏳ Платёж пока не найден. Оплати и попробуй ещё раз.', {
            show_alert: false,
          })
          .catch(() => {});
        await this.editOrReply(
          ctx,
          '⏳ Оплата ещё не пришла. Нажми проверку ещё раз через минуту.',
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🔄 Проверить снова', callback_data: `check:${invoiceId}` }],
                [backButton],
              ],
            },
          },
        );
      }
    } catch (e: any) {
      await this.editOrReply(ctx, `❌ Ошибка проверки: ${e.message}`, {
        reply_markup: { inline_keyboard: [[backButton]] },
      });
    }
  }

  private manualDetails(): string {
    return this.configService.get<string>('MANUAL_PAY_DETAILS', '');
  }

  private adminId(): string {
    return this.configService.get<string>('ADMIN_TELEGRAM_ID', '1262369931');
  }

  private async handleManualBuy(ctx: any) {
    const kind = String(ctx.match?.[1] || '');
    if (kind !== 'premium_30' && kind !== 'donate') return;
    await ctx.answerCbQuery();
    const tgId = String((ctx.from as any)?.id || '0');
    try {
      const claim: any = await this.api('/payments/bot-manual', {
        method: 'POST',
        body: { telegramId: tgId, kind },
      });
      await ctx.reply(
        '💳 Переведи ' +
          (kind === 'premium_30' ? '219 ₽' : 'любую сумму') +
          ' сюда:' +
          '\n\n' +
          this.manualDetails() +
          '\n\nПотом нажми кнопку ниже:',

        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '✅ Я оплатил', callback_data: 'done:' + claim.claimId }],
              [backButton],
            ],
          },
        },
      );
    } catch (e: any) {
      await this.editOrReply(ctx, '❌ Ошибка: ' + e.message, {
        reply_markup: { inline_keyboard: [[backButton]] },
      });
    }
  }

  private async handleManualDone(ctx: any) {
    const claimId = String(ctx.match?.[1] || '');
    await ctx.answerCbQuery();
    const tgId = String((ctx.from as any)?.id || '0');
    const uname = (ctx.from as any)?.username ? '@' + (ctx.from as any).username : tgId;
    try {
      await this.botService
        .getBot()
        .telegram.sendMessage(
          Number(this.adminId()),
          '💰 Новая оплата переводом' +
            '\nОт: ' +
            uname +
            ' (' +
            tgId +
            ')' +
            '\nЗаявка: ' +
            claimId +
            '\nПроверь поступление и подтверди:',
          {
            reply_markup: {
              inline_keyboard: [[{ text: '✅ Подтвердить', callback_data: 'approve:' + claimId }]],
            },
          },
        );
      await this.editOrReply(ctx, '⏳ Заявка отправлена! Подтвердим в течение пары часов.', {
        reply_markup: { inline_keyboard: [[backButton]] },
      });
    } catch (e: any) {
      await this.editOrReply(ctx, '❌ Ошибка: ' + e.message, {
        reply_markup: { inline_keyboard: [[backButton]] },
      });
    }
  }

  private async handleManualApprove(ctx: any) {
    const claimId = String(ctx.match?.[1] || '');
    await ctx.answerCbQuery();
    if (String((ctx.from as any)?.id || '') !== String(this.adminId())) {
      await this.editOrReply(ctx, '⛔ Только для администратора.', {
        reply_markup: { inline_keyboard: [[backButton]] },
      });
      return;
    }
    try {
      const res: any = await this.api('/payments/bot-manual/approve', {
        method: 'POST',
        body: { claimId, secret: this.botSecret() },
      });
      await this.editOrReply(ctx, '✅ Подтверждено: ' + res.telegramId + ' +' + res.days + ' дн.', {
        reply_markup: { inline_keyboard: [[backButton]] },
      });
      try {
        await this.botService
          .getBot()
          .telegram.sendMessage(
            Number(res.telegramId),
            '✅ Оплата подтверждена! Подписка продлена на ' +
              res.days +
              ' дн. Проверь «🔗 Моя подписка».',
          );
      } catch {}
    } catch (e: any) {
      await this.editOrReply(ctx, '❌ Ошибка: ' + e.message, {
        reply_markup: { inline_keyboard: [[backButton]] },
      });
    }
  }

  private async handleExtend(ctx: Context) {
    await ctx.answerCbQuery();
    const tgId = String((ctx.from as any)?.id || '0');
    try {
      const link: any = await this.api('/sub-links', {
        method: 'POST',
        body: { telegramId: tgId },
      });
      const daysLeft = Math.ceil((new Date(link.expiresAt).getTime() - Date.now()) / 86400000);
      if (daysLeft > 7) {
        await this.editOrReply(
          ctx,
          `🔄 Продление не нужно — подписка активна ещё ${daysLeft} дн.\nВозвращайся, когда останется меньше 7 дней.`,
          { reply_markup: { inline_keyboard: [[backButton]] } },
        );
        return;
      }
      const res: any = await this.api('/sub-links/extend', {
        method: 'POST',
        headers: { 'x-bot-secret': this.botSecret() },
        body: { telegramId: tgId, days: 2 },
      });
      const exp = res?.expiresAt ? new Date(res.expiresAt).toLocaleDateString('ru-RU') : '';
      await this.editOrReply(ctx, `🔄 Подписка продлена на 2 дня — до ${exp}.`, {
        reply_markup: { inline_keyboard: [[backButton]] },
      });
    } catch (e: any) {
      await this.editOrReply(ctx, `❌ Ошибка: ${e.message}`, {
        reply_markup: { inline_keyboard: [[backButton]] },
      });
    }
  }
}
