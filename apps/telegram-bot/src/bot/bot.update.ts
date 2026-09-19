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

  private async api(path: string, options: { method?: string; body?: any } = {}) {
    const { method = 'GET', body } = options;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
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
    bot.action('menu:info', (ctx) => this.handleInfo(ctx));
    bot.action('menu:referral', (ctx) => this.handleReferral(ctx));
    bot.action('menu:premium', (ctx) => this.handlePremium(ctx));
    bot.action('menu:extend', (ctx) => this.handleExtend(ctx));
    bot.action(/^stars:(.+)$/, (ctx) => this.handleStarsBuy(ctx));
    bot.action(/^getconfig:(.+)$/, (ctx) => this.handleGetConfig(ctx));
    bot.action(/^configlist:(.+)$/, (ctx) => this.handleConfigList(ctx));
    bot.action('menu:mtproto', (ctx) => this.handleMtproto(ctx));
    bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true));
    bot.on('successful_payment', (ctx) => this.handleSuccessPayment(ctx));
  }

  private async handleStart(ctx: Context) {
    // Реферальный deep-link: /start ref_<tgId>
    try {
      const payload = String((ctx as any).startPayload || '');
      const me = String((ctx.from as any)?.id || '0');
      if (payload.startsWith('ref_')) {
        const res: any = await this.api('/growth/referral', {
          method: 'POST',
          body: { telegramId: me, refCode: payload },
        }).catch(() => null);
        if (res?.isNew) {
          await ctx.reply(
            '🎁 Ты пришёл по приглашению — тебе начислено +5 дней подписки!\nПригласившему тоже +7 дней.',
          );
        }
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
      const data: any = await this.api('/sub-links', {
        method: 'POST',
        body: { telegramId: tgId },
      });
      const exp = new Date(data.expiresAt);
      const daysLeft = Math.max(0, Math.ceil((exp.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
      const traffic = (Number(data.trafficUsed) / 1024 / 1024 / 1024).toFixed(2);
      const stats = await this.growthStats(tgId);
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
      const data: any = await this.api('/sub-links', {
        method: 'POST',
        body: { telegramId: tgId },
      });
      const exp = new Date(data.expiresAt).toLocaleDateString('ru-RU');
      const stats = await this.growthStats(tgId);
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
          `Истекает: ${exp}\n` +
          `Приглашено друзей: ${stats?.referrals ?? 0}\n\n` +
          `Бесплатный VPN без регистрации.`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔗 Моя подписка', callback_data: 'menu:mysubscription' }],
              [{ text: '🎁 Пригласи друга', callback_data: 'menu:referral' }],
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

  private async handleInfo(ctx: Context) {
    await ctx.answerCbQuery();
    await this.editOrReply(
      ctx,
      'ℹ️ APPI VPN\n\n' +
        'Бесплатный VPN-сервис для доступа к заблокированным ресурсам.\n\n' +
        '• Сотни серверов по всему миру\n' +
        '• Без лимитов и оплат\n' +
        '• Автоматическое обновление конфигов\n' +
        '• Поддержка VLESS, Hysteria2, Trojan, Shadowsocks\n\n' +
        '🤖 Бот: @AppiVPNBot',
      { reply_markup: { inline_keyboard: [[backButton]] } },
    );
  }

  private async handleMtproto(ctx: Context) {
    await ctx.answerCbQuery();
    try {
      const res = await fetch(
        'https://raw.githubusercontent.com/dubblebyte/free-mtproto-proxies/main/all_proxies.txt',
      );
      const text = await res.text();
      const lines = text.split('\n').filter((l) => l.startsWith('https://t.me/proxy?'));
      if (lines.length === 0) {
        await this.editOrReply(ctx, '⏳ Прокси обновляются. Попробуйте позже.', {
          reply_markup: { inline_keyboard: [[backButton]] },
        });
        return;
      }
      const pick = lines[0];
      const url = new URL(pick);
      const server = url.searchParams.get('server');
      const port = url.searchParams.get('port');
      await this.editOrReply(
        ctx,
        `🛡 Прокси MTProto\n\n` +
          `Быстрый способ открыть Telegram, если он заблокирован.\n` +
          `Это не VPN — работает только внутри Telegram.\n\n` +
          `Сервер: ${server}\n` +
          `Порт: ${port}\n\n` +
          `Нажми «Подключить прокси» — Telegram сам предложит его включить.`,
        {
          reply_markup: {
            inline_keyboard: [[{ text: '🛡 Подключить прокси', url: pick }], [backButton]],
          },
        },
      );
    } catch (e: any) {
      await this.editOrReply(ctx, `❌ Ошибка: ${e.message}`, {
        reply_markup: { inline_keyboard: [[backButton]] },
      });
    }
  }

  private async growthStats(tgId: string): Promise<any> {
    return this.api(`/growth/stats/${tgId}`).catch(() => null);
  }

  private async handleReferral(ctx: Context) {
    await ctx.answerCbQuery();
    const tgId = String((ctx.from as any)?.id || '0');
    const stats = await this.growthStats(tgId);
    const count = stats?.referrals ?? 0;
    const link = `https://t.me/AppiVPNBot?start=ref_${tgId}`;
    await this.editOrReply(
      ctx,
      `🎁 Пригласи друга\n\n` +
        `Твоя ссылка:\n${link}\n\n` +
        `Приглашено: ${count}\n\n` +
        `За каждого друга:\n` +
        `• тебе +7 дней подписки\n` +
        `• другу +5 дней подписки\n\n` +
        `Поделись ссылкой — бонусы начисляются автоматически.`,
      { reply_markup: { inline_keyboard: [[backButton]] } },
    );
  }

  private async handlePremium(ctx: Context) {
    await ctx.answerCbQuery();
    const tgId = String((ctx.from as any)?.id || '0');
    const stats = await this.growthStats(tgId);
    const premLine = stats?.isPremium
      ? `⭐ Premium активен до ${new Date(stats.premiumUntil).toLocaleDateString('ru-RU')}\n\n`
      : '';
    await this.editOrReply(
      ctx,
      `⭐ Premium\n\n` +
        premLine +
        `Что даёт:\n` +
        `• подписка 30 дней вместо 2\n` +
        `• приоритетные серверы\n` +
        `• поддержка проекта\n\n` +
        `Оплата — Telegram Stars (встроенная валюта Telegram):`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '⭐ Premium 30 дней — 149 ⭐', callback_data: 'stars:premium_30' }],
            [
              { text: '💛 Донат 15 ⭐', callback_data: 'stars:donate_15' },
              { text: '💛 Донат 50 ⭐', callback_data: 'stars:donate_50' },
            ],
            [{ text: '💛 Донат 150 ⭐', callback_data: 'stars:donate_150' }],
            [backButton],
          ],
        },
      },
    );
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
          amount: 149,
          payload: `premium_30_${tgId}`,
        },
        donate_15: {
          title: 'Донат APPI VPN',
          desc: 'Поддержка проекта +1 день подписки',
          amount: 15,
          payload: `donate_15_${tgId}`,
        },
        donate_50: {
          title: 'Донат APPI VPN',
          desc: 'Поддержка проекта +1 день подписки',
          amount: 50,
          payload: `donate_50_${tgId}`,
        },
        donate_150: {
          title: 'Донат APPI VPN',
          desc: 'Поддержка проекта +1 день подписки',
          amount: 150,
          payload: `donate_150_${tgId}`,
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
        await this.api('/growth/premium/grant', {
          method: 'POST',
          body: { telegramId: tgId, days: 30, stars, source: 'stars' },
        }).catch(() => null);
        await ctx.reply(
          '⭐ Premium активирован на 30 дней! Спасибо за поддержку.\nПроверь «🔗 Моя подписка» — срок продлён.',
        );
      } else if (payload.startsWith('donate_')) {
        await this.api('/growth/premium/grant', {
          method: 'POST',
          body: { telegramId: tgId, days: 1, stars, source: 'donate' },
        }).catch(() => null);
        await ctx.reply('💛 Спасибо за донат! Тебе начислен +1 день подписки.');
      }
    } catch (e: any) {
      this.logger.error(`successPayment: ${e.message}`);
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
      const res: any = await this.api('/growth/extend', {
        method: 'POST',
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
