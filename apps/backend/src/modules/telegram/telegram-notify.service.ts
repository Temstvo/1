import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import https from 'node:https';

const FALLBACK_IPS = ['149.154.167.220', '149.154.167.99', '149.154.166.110'];

@Injectable()
export class TelegramNotifyService {
  private readonly logger = new Logger(TelegramNotifyService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendAdmin(text: string): Promise<void> {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.configService.get<string>('ADMIN_CHAT_ID');

    if (!token || !chatId) {
      return;
    }

    const body = JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    });

    try {
      const ok = await this.post(token, body);
      if (!ok) {
        for (const ip of FALLBACK_IPS) {
          if (await this.postViaIp(ip, token, body)) return;
        }
        this.logger.warn('Telegram notify failed: all endpoints unreachable');
      }
    } catch (error) {
      this.logger.warn(`Telegram notify error: ${(error as Error).message}`);
    }
  }

  private async post(token: string, body: string): Promise<boolean> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: controller.signal,
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      clearTimeout(timeout);
    }
  }

  private postViaIp(ip: string, token: string, body: string): Promise<boolean> {
    return new Promise((resolve) => {
      const req = https.request(
        {
          host: ip,
          port: 443,
          servername: 'api.telegram.org',
          method: 'POST',
          path: `/bot${token}/sendMessage`,
          headers: {
            Host: 'api.telegram.org',
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
          },
          timeout: 5000,
          checkServerIdentity: () => undefined,
        },
        (res) => {
          res.resume();
          resolve(res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 300);
        },
      );
      req.on('timeout', () => req.destroy());
      req.on('error', () => resolve(false));
      req.write(body);
      req.end();
    });
  }
}
