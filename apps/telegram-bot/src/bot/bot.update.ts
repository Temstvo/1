import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BotService } from './bot.service';
import { Context } from 'telegraf';
import {
  mainMenuKeyboard,
  backButton,
  protocolKeyboard,
  settingsKeyboard,
  confirmButton,
} from './keyboards';

@Injectable()
export class BotUpdate implements OnModuleInit {
  private readonly logger = new Logger(BotUpdate.name);
  private userStates = new Map<number, { action: string; data?: any }>();

  constructor(private readonly botService: BotService) {}

  onModuleInit() {
    this.registerHandlers();
  }

  private registerHandlers() {
    const bot = this.botService.getBot();

    bot.start((ctx) => this.handleStart(ctx));
    bot.help((ctx) => this.handleHelp(ctx));
    bot.command('status', (ctx) => this.handleStatus(ctx));
    bot.command('subscription', (ctx) => this.handleSubscription(ctx));
    bot.command('connect', (ctx) => this.handleQuickConnect(ctx));
    bot.command('servers', (ctx) => this.handleServers(ctx));
    bot.command('traffic', (ctx) => this.handleTraffic(ctx));
    bot.command('settings', (ctx) => this.handleSettings(ctx));
    bot.command('support', (ctx) => this.handleSupport(ctx));

    bot.action('menu:main', (ctx) => this.handleMainMenu(ctx));
    bot.action('menu:subscription', (ctx) => this.handleSubscription(ctx));
    bot.action('menu:servers', (ctx) => this.handleServers(ctx));
    bot.action('menu:devices', (ctx) => this.handleDevices(ctx));
    bot.action('menu:traffic', (ctx) => this.handleTraffic(ctx));
    bot.action('menu:payments', (ctx) => this.handlePayments(ctx));
    bot.action('menu:referral', (ctx) => this.handleReferral(ctx));
    bot.action('menu:quick_connect', (ctx) => this.handleQuickConnect(ctx));
    bot.action('menu:support', (ctx) => this.handleSupport(ctx));
    bot.action('menu:settings', (ctx) => this.handleSettings(ctx));

    bot.action(/^protocol:(.+)$/, (ctx) => this.handleProtocolSelect(ctx));
    bot.action(/^server:(.+)$/, (ctx) => this.handleServerSelect(ctx));
    bot.action(/^connect:(.+)$/, (ctx) => this.handleConnect(ctx));
    bot.action(/^disconnect:(.+)$/, (ctx) => this.handleDisconnect(ctx));
    bot.action(/^confirm:(.+)$/, (ctx) => this.handleConfirm(ctx));

    bot.on('text', (ctx) => this.handleText(ctx));
  }

  private async handleStart(ctx: Context) {
    const user = ctx.from;
    const name = user?.first_name || 'User';

    const welcomeMessage = `
🔐 *Welcome to APPI VPN!*

Hello ${name}! I'm your VPN assistant.

I can help you:
• Connect to VPN servers
• Manage your subscription
• Check traffic usage
• Get support

Use the menu below to get started!
    `.trim();

    await ctx.reply(welcomeMessage, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: mainMenuKeyboard },
    });
  }

  private async handleHelp(ctx: Context) {
    const helpMessage = `
📚 *APPI VPN Bot Commands*

/start - Start the bot
/help - Show this help message
/status - Check your account status
/subscription - Manage subscription
/connect - Quick connect to VPN
/servers - View available servers
/traffic - Check traffic usage
/settings - Bot settings
/support - Get help

💡 You can also use the inline keyboard menu for quick access!
    `.trim();

    await ctx.reply(helpMessage, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: mainMenuKeyboard },
    });
  }

  private async handleMainMenu(ctx: Context) {
    await ctx.editMessageText(
      '🔐 *APPI VPN Main Menu*\n\nSelect an option:',
      {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: mainMenuKeyboard },
      },
    );
  }

  private async handleStatus(ctx: Context) {
    const statusMessage = `
📊 *Account Status*

✅ Account: Active
🔑 Subscription: Pro Plan
📅 Expires: Aug 15, 2026
📱 Devices: 3/10
🌐 Traffic Used: 45.2 GB / Unlimited

Last connected: 2 hours ago from Frankfurt, Germany
    `.trim();

    await ctx.reply(statusMessage, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: mainMenuKeyboard },
    });
  }

  private async handleSubscription(ctx: Context) {
    const subMessage = `
🔑 *My Subscription*

*Plan:* Pro
*Price:* $9.99/month
*Status:* ✅ Active
*Expires:* Aug 15, 2026
*Auto-renew:* Enabled

*Features:*
• 10 devices
• All countries
• All protocols
• Priority support
    `.trim();

    const keyboard = [
      [{ text: '🔄 Change Plan', callback_data: 'sub:change' }],
      [{ text: '📅 Extend', callback_data: 'sub:extend' }],
      [{ text: '❌ Cancel', callback_data: 'sub:cancel' }],
      [backButton],
    ];

    await ctx.reply(subMessage, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard },
    });
  }

  private async handleServers(ctx: Context) {
    const serversMessage = `
🌐 *Available Servers*

Select a server to connect:
    `.trim();

    const mockServers = [
      { id: '1', name: 'Frankfurt', country: '🇩🇪 Germany', load: 45 },
      { id: '2', name: 'Amsterdam', country: '🇳🇱 Netherlands', load: 62 },
      { id: '3', name: 'New York', country: '🇺🇸 USA', load: 78 },
      { id: '4', name: 'Tokyo', country: '🇯🇵 Japan', load: 33 },
      { id: '5', name: 'London', country: '🇬🇧 UK', load: 28 },
      { id: '6', name: 'Singapore', country: '🇸🇬 Singapore', load: 55 },
    ];

    const keyboard = mockServers.map((s) => [
      {
        text: `${s.name}, ${s.country} (${s.load}%)`,
        callback_data: `server:${s.id}`,
      },
    ]);
    keyboard.push([backButton]);

    await ctx.reply(serversMessage, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard },
    });
  }

  private async handleDevices(ctx: Context) {
    const devicesMessage = `
📱 *My Devices*

1. iPhone 15 Pro - 🟢 Active
   Last seen: Now
   
2. MacBook Pro - 🟢 Active
   Last seen: 5 min ago
   
3. Windows PC - 🔴 Offline
   Last seen: 2 days ago

*Devices used:* 3/10
    `.trim();

    const keyboard = [
      [{ text: '🔄 Refresh', callback_data: 'menu:devices' }],
      [backButton],
    ];

    await ctx.reply(devicesMessage, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard },
    });
  }

  private async handleTraffic(ctx: Context) {
    const trafficMessage = `
📊 *Traffic Usage*

*Today:*
Download: 2.4 GB
Upload: 856 MB

*This Month:*
Download: 45.2 GB
Upload: 12.8 GB

*Plan Limit:* Unlimited ✅
    `.trim();

    const keyboard = [
      [{ text: '📈 Detailed Stats', callback_data: 'traffic:detailed' }],
      [backButton],
    ];

    await ctx.reply(trafficMessage, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard },
    });
  }

  private async handlePayments(ctx: Context) {
    const paymentsMessage = `
💳 *Payment History*

• Jan 15, 2026 - $9.99 - Pro Plan ✅
• Dec 15, 2025 - $9.99 - Pro Plan ✅
• Nov 15, 2025 - $4.99 - Basic Plan ✅
    `.trim();

    const keyboard = [
      [{ text: '📄 View All', callback_data: 'payments:all' }],
      [backButton],
    ];

    await ctx.reply(paymentsMessage, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard },
    });
  }

  private async handleReferral(ctx: Context) {
    const referralMessage = `
🎁 *Referral Program*

Share your referral link and earn 20% commission!

*Your Referral Code:* ABC123
*Your Link:* https://appi-vpn.com/register?ref=ABC123

*Stats:*
Total Referrals: 5
Paid Referrals: 3
Total Commission: $29.97
Pending: $9.98
    `.trim();

    const keyboard = [
      [{ text: '📋 Copy Link', callback_data: 'referral:copy' }],
      [{ text: '💸 Request Payout', callback_data: 'referral:payout' }],
      [backButton],
    ];

    await ctx.reply(referralMessage, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard },
    });
  }

  private async handleQuickConnect(ctx: Context) {
    const connectMessage = `
⚡ *Quick Connect*

Select a protocol:
    `.trim();

    await ctx.reply(connectMessage, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: protocolKeyboard },
    });
  }

  private async handleProtocolSelect(ctx: any) {
    const protocol = ctx.match?.[1];
    const protocolNames: Record<string, string> = {
      WIREGUARD: 'WireGuard',
      OPENVPN: 'OpenVPN',
      XRAY_REALITY: 'Xray Reality',
      VLESS: 'VLESS',
    };

    const message = `
⚡ *Connecting via ${protocolNames[protocol || 'WIREGUARD']}...*

Finding best server...
    `.trim();

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const connectedMessage = `
✅ *Connected!*

*Server:* Frankfurt, Germany
*Protocol:* ${protocolNames[protocol || 'WIREGUARD']}
*IP:* 185.234.xx.xx

🔒 Your connection is secure!
    `.trim();

    const keyboard = [
      [{ text: '🔴 Disconnect', callback_data: 'disconnect:1' }],
      [backButton],
    ];

    await ctx.editMessageText(connectedMessage, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard },
    });
  }

  private async handleServerSelect(ctx: any) {
    const serverId = ctx.match?.[1];
    const serverNames: Record<string, string> = {
      '1': 'Frankfurt, Germany',
      '2': 'Amsterdam, Netherlands',
      '3': 'New York, USA',
      '4': 'Tokyo, Japan',
      '5': 'London, UK',
      '6': 'Singapore',
    };

    const message = `
🖥️ *${serverNames[serverId || '1']}*

Select protocol:
    `.trim();

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: protocolKeyboard },
    });
  }

  private async handleConnect(ctx: any) {
    const serverId = ctx.match?.[1];
    await ctx.answerCbQuery('Connecting...');
  }

  private async handleDisconnect(ctx: Context) {
    const message = `
🔴 *Disconnected*

You have been disconnected from the VPN.
    `.trim();

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: mainMenuKeyboard },
    });
  }

  private async handleConfirm(ctx: any) {
    const action = ctx.match?.[1];
    await ctx.answerCbQuery('Confirmed!');
  }

  private async handleSupport(ctx: Context) {
    const supportMessage = `
💬 *Support*

How can we help you?

*FAQ:*
1. How to connect?
2. Payment issues
3. Account problems
4. Other

Type your message or select an option:
    `.trim();

    const keyboard = [
      [{ text: '❓ FAQ', callback_data: 'support:faq' }],
      [{ text: '🎫 Open Ticket', callback_data: 'support:ticket' }],
      [backButton],
    ];

    await ctx.reply(supportMessage, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard },
    });
  }

  private async handleSettings(ctx: Context) {
    const settingsMessage = `
⚙️ *Settings*

Customize your bot experience:
    `.trim();

    await ctx.reply(settingsMessage, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: settingsKeyboard },
    });
  }

  private async handleText(ctx: Context) {
    const text = ctx.message && 'text' in ctx.message ? ctx.message.text : '';
    const chatId = ctx.chat?.id;

    if (!chatId) return;

    const state = this.userStates.get(chatId);

    if (state) {
      this.userStates.delete(chatId);

      switch (state.action) {
        case 'support:message':
          await ctx.reply('✅ Your message has been sent to our support team. We\'ll respond shortly.', {
            reply_markup: { inline_keyboard: mainMenuKeyboard },
          });
          break;
      }
      return;
    }

    if (text.startsWith('/')) return;

    await ctx.reply(
      'I didn\'t understand that. Use the menu or /help for available commands.',
      {
        reply_markup: { inline_keyboard: mainMenuKeyboard },
      },
    );
  }
}
