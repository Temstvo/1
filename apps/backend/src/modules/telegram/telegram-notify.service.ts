import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          disable_web_page_preview: true,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.warn(`Telegram notify failed: ${response.status} ${await response.text()}`);
      }
    } catch (error) {
      this.logger.warn(`Telegram notify error: ${(error as Error).message}`);
    } finally {
      clearTimeout(timeout);
    }
  }
}
