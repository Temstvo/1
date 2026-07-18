import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BotService } from './bot.service';
import { Context } from 'telegraf';
import { mainMenuKeyboard, authKeyboard, backButton } from './keyboards';

interface UserData {
  email: string;
  token: string;
  refreshToken: string;
}

@Injectable()
export class BotUpdate implements OnModuleInit {
  private readonly logger = new Logger(BotUpdate.name);
  private userStates = new Map<number, { action: string; data?: any }>();
  private linkedUsers = new Map<number, UserData>();
  private backendUrl: string;

  constructor(
    private readonly botService: BotService,
    private readonly configService: ConfigService,
  ) {
    this.backendUrl = this.configService.get<string>('BACKEND_URL', 'https://appibackend-production.up.railway.app');
  }

  onModuleInit() {
    if (!this.botService.isReady()) {
      this.logger.warn('Bot not ready - skipping handlers');
      return;
    }
    this.registerHandlers();
  }

  private async api(path: string, options: { method?: string; token?: string; body?: any } = {}) {
    const { method = 'GET', token, body } = options;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${this.backendUrl}/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API ${method} ${path} failed (${res.status}): ${text}`);
    }

    return res.json();
  }

  private registerHandlers() {
    const bot = this.botService.getBot();

    bot.start((ctx) => this.handleStart(ctx));
    bot.help((ctx) => this.handleHelp(ctx));

    bot.action('auth:login', (ctx) => this.handleLoginStart(ctx));
    bot.action('auth:register', (ctx) => this.handleRegisterStart(ctx));

    bot.action('menu:main', (ctx) => this.handleMainMenu(ctx));
    bot.action('menu:status', (ctx) => this.handleStatus(ctx));
    bot.action('menu:subscription', (ctx) => this.handleSubscription(ctx));
    bot.action('menu:servers', (ctx) => this.handleServers(ctx));
    bot.action('menu:traffic', (ctx) => this.handleTraffic(ctx));
    bot.action('menu:devices', (ctx) => this.handleDevices(ctx));
    bot.action('menu:logout', (ctx) => this.handleLogout(ctx));

    bot.action(/^server:(.+)$/, (ctx) => this.handleServerSelect(ctx));

    bot.on('text', (ctx) => this.handleText(ctx));
  }

  private async handleStart(ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId) return;

    if (this.linkedUsers.has(userId)) {
      await ctx.reply('🔐 *APPI VPN*\n\nYou are already logged in.', {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: mainMenuKeyboard },
      });
      return;
    }

    await ctx.reply(
      '🔐 *Welcome to APPI VPN!*\n\nCreate an account or sign in to get started.',
      {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: authKeyboard },
      },
    );
  }

  private async handleHelp(ctx: Context) {
    await ctx.reply(
      '📚 *Commands*\n\n' +
      '/start - Start / re-login\n' +
      '/help - This message\n\n' +
      'Use the menu for all actions.',
      { parse_mode: 'Markdown', reply_markup: { inline_keyboard: mainMenuKeyboard } },
    );
  }

  private async handleLoginStart(ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId) return;

    this.userStates.set(userId, { action: 'login_email' });
    await ctx.editMessageText('Enter your email:', { parse_mode: 'Markdown' });
  }

  private async handleRegisterStart(ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId) return;

    this.userStates.set(userId, { action: 'register_email' });
    await ctx.editMessageText('Enter your email:', { parse_mode: 'Markdown' });
  }

  private async handleMainMenu(ctx: Context) {
    await ctx.editMessageText('🔐 *APPI VPN*\n\nSelect an option:', {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: mainMenuKeyboard },
    });
  }

  private async handleStatus(ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId || !this.linkedUsers.has(userId)) return this.requireLogin(ctx);

    const { token } = this.linkedUsers.get(userId)!;
    try {
      const [user, sub] = await Promise.all([
        this.api('/users/me', { token }),
        this.api('/subscriptions/current', { token }).catch(() => null),
      ]);

      const planName = sub?.plan?.name || 'No plan';
      const expiry = sub?.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : '—';

      await ctx.reply(
        `📊 *Account*\n\n` +
        `Email: ${user.email}\n` +
        `Plan: ${planName}\n` +
        `Expires: ${expiry}\n` +
        `Status: ${sub?.status || 'No active subscription'}`,
        { parse_mode: 'Markdown', reply_markup: { inline_keyboard: mainMenuKeyboard } },
      );
    } catch (e: any) {
      await ctx.reply(`Error: ${e.message}`, { reply_markup: { inline_keyboard: mainMenuKeyboard } });
    }
  }

  private async handleSubscription(ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId || !this.linkedUsers.has(userId)) return this.requireLogin(ctx);

    const { token } = this.linkedUsers.get(userId)!;
    try {
      const sub = await this.api('/subscriptions/current', { token }).catch(() => null);

      if (!sub) {
        await ctx.reply('You have no active subscription.', {
          reply_markup: { inline_keyboard: mainMenuKeyboard },
        });
        return;
      }

      const plan = sub.plan || {};
      await ctx.reply(
        `🔑 *Subscription*\n\n` +
        `Plan: ${plan.name || '—'}\n` +
        `Price: ${plan.price ? `₽${plan.price}` : '—'}\n` +
        `Traffic: ${plan.traffic || '—'}\n` +
        `Devices: ${plan.maxDevices || '—'}\n` +
        `Status: ${sub.status}\n` +
        `Expires: ${sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : '—'}`,
        { parse_mode: 'Markdown', reply_markup: { inline_keyboard: mainMenuKeyboard } },
      );
    } catch (e: any) {
      await ctx.reply(`Error: ${e.message}`, { reply_markup: { inline_keyboard: mainMenuKeyboard } });
    }
  }

  private async handleServers(ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId || !this.linkedUsers.has(userId)) return this.requireLogin(ctx);

    const { token } = this.linkedUsers.get(userId)!;
    try {
      const data = await this.api('/servers', { token });
      const servers = data.servers || data || [];

      if (!Array.isArray(servers) || servers.length === 0) {
        await ctx.reply('No servers available.', {
          reply_markup: { inline_keyboard: mainMenuKeyboard },
        });
        return;
      }

      const keyboard = servers.slice(0, 10).map((s: any) => [{
        text: `${s.name || s.city || 'Server'} (${s.country || s.code || ''})`,
        callback_data: `server:${s.id}`,
      }]);
      keyboard.push([backButton]);

      await ctx.reply('🌐 *Servers*\n\nSelect a server:', {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard },
      });
    } catch (e: any) {
      await ctx.reply(`Error: ${e.message}`, { reply_markup: { inline_keyboard: mainMenuKeyboard } });
    }
  }

  private async handleServerSelect(ctx: any) {
    const userId = ctx.from?.id;
    if (!userId || !this.linkedUsers.has(userId)) return;

    const serverId = ctx.match?.[1];
    const { token } = this.linkedUsers.get(userId)!;

    try {
      const server = await this.api(`/servers/${serverId}`, { token });
      await ctx.reply(
        `🖥️ *${server.name || server.city}*\n\n` +
        `Country: ${server.country || server.code}\n` +
        `Protocol: ${server.protocol || 'VLESS'}\n` +
        `Status: ${server.status || 'online'}`,
        { parse_mode: 'Markdown', reply_markup: { inline_keyboard: mainMenuKeyboard } },
      );
    } catch (e: any) {
      await ctx.reply(`Error: ${e.message}`, { reply_markup: { inline_keyboard: mainMenuKeyboard } });
    }
  }

  private async handleTraffic(ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId || !this.linkedUsers.has(userId)) return this.requireLogin(ctx);

    const { token } = this.linkedUsers.get(userId)!;
    try {
      const traffic = await this.api('/traffic/current', { token });

      await ctx.reply(
        `📊 *Traffic*\n\n` +
        `Download: ${traffic.download || '—'}\n` +
        `Upload: ${traffic.upload || '—'}\n` +
        `Total: ${traffic.total || '—'}`,
        { parse_mode: 'Markdown', reply_markup: { inline_keyboard: mainMenuKeyboard } },
      );
    } catch (e: any) {
      await ctx.reply(`Error: ${e.message}`, { reply_markup: { inline_keyboard: mainMenuKeyboard } });
    }
  }

  private async handleDevices(ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId || !this.linkedUsers.has(userId)) return this.requireLogin(ctx);

    const { token } = this.linkedUsers.get(userId)!;
    try {
      const data = await this.api('/users/devices', { token });
      const devices = data.devices || data || [];

      if (!Array.isArray(devices) || devices.length === 0) {
        await ctx.reply('No devices registered.', {
          reply_markup: { inline_keyboard: mainMenuKeyboard },
        });
        return;
      }

      const list = devices.map((d: any, i: number) =>
        `${i + 1}. ${d.name || d.deviceName || 'Device'} - ${d.lastSeen ? 'Last: ' + new Date(d.lastSeen).toLocaleDateString() : 'Unknown'}`
      ).join('\n');

      await ctx.reply(`📱 *Devices*\n\n${list}`, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: mainMenuKeyboard },
      });
    } catch (e: any) {
      await ctx.reply(`Error: ${e.message}`, { reply_markup: { inline_keyboard: mainMenuKeyboard } });
    }
  }

  private async handleLogout(ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId) return;

    this.linkedUsers.delete(userId);
    this.userStates.delete(userId);

    await ctx.reply('Logged out.', {
      reply_markup: { inline_keyboard: authKeyboard },
    });
  }

  private async requireLogin(ctx: Context) {
    await ctx.reply('Please log in first.', {
      reply_markup: { inline_keyboard: authKeyboard },
    });
  }

  private async handleText(ctx: Context) {
    const userId = ctx.from?.id;
    const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
    if (!userId || !text) return;

    const state = this.userStates.get(userId);
    if (!state) return;

    switch (state.action) {
      case 'register_email': {
        const email = text.trim();
        if (!email.includes('@')) {
          await ctx.reply('Invalid email. Try again:');
          return;
        }
        this.userStates.set(userId, { action: 'register_password', data: { email } });
        await ctx.reply('Create a password (min 8 characters):');
        return;
      }

      case 'register_password': {
        const password = text.trim();
        if (password.length < 8) {
          await ctx.reply('Password must be at least 8 characters. Try again:');
          return;
        }
        this.userStates.set(userId, { action: 'register_confirm', data: { ...state.data, password } });
        await ctx.reply('Confirm your password:');
        return;
      }

      case 'register_confirm': {
        const { email, password } = state.data;
        this.userStates.delete(userId);

        if (text.trim() !== password) {
          await ctx.reply('Passwords do not match. Send /start to try again.', {
            reply_markup: { inline_keyboard: authKeyboard },
          });
          return;
        }

        try {
          const data = await this.api('/auth/register', {
            method: 'POST',
            body: { email, password },
          });

          this.linkedUsers.set(userId, {
            email,
            token: data.accessToken,
            refreshToken: data.refreshToken,
          });

          await ctx.reply(
            `✅ *Account created!*\n\nEmail: ${email}`,
            { parse_mode: 'Markdown', reply_markup: { inline_keyboard: mainMenuKeyboard } },
          );
        } catch (e: any) {
          await ctx.reply('Registration failed. Send /start to try again.', {
            reply_markup: { inline_keyboard: authKeyboard },
          });
        }
        return;
      }

      case 'login_email': {
        const email = text.trim();
        if (!email.includes('@')) {
          await ctx.reply('Invalid email. Try again:');
          return;
        }
        this.userStates.set(userId, { action: 'login_password', data: { email } });
        await ctx.reply('Enter your password:');
        return;
      }

      case 'login_password': {
        const { email } = state.data;
        this.userStates.delete(userId);

        try {
          const data = await this.api('/auth/login', {
            method: 'POST',
            body: { email, password: text.trim() },
          });

          this.linkedUsers.set(userId, {
            email,
            token: data.accessToken,
            refreshToken: data.refreshToken,
          });

          await ctx.reply(
            `✅ *Logged in!*\n\nEmail: ${email}`,
            { parse_mode: 'Markdown', reply_markup: { inline_keyboard: mainMenuKeyboard } },
          );
        } catch (e: any) {
          await ctx.reply('Login failed. Send /start to try again.', {
            reply_markup: { inline_keyboard: authKeyboard },
          });
        }
        return;
      }
    }

    if (text.startsWith('/')) return;

    await ctx.reply('Use the menu or /help.', {
      reply_markup: { inline_keyboard: mainMenuKeyboard },
    });
  }
}
