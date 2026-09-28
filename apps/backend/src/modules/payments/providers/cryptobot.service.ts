import { Injectable, ServiceUnavailableException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const API = 'https://pay.crypt.bot/api';

/**
 * CryptoBot (Crypto Pay API): USDT/TON/BTC внутри Telegram.
 * Без публичного URL вебхук не долетит — статус проверяем опросом getInvoices.
 */
@Injectable()
export class CryptoBotService {
  private readonly logger = new Logger(CryptoBotService.name);

  constructor(private config: ConfigService) {}

  isConfigured(): boolean {
    return !!this.config.get<string>('CRYPTOBOT_TOKEN');
  }

  private async call(method: string, body?: any): Promise<any> {
    const token = this.config.get<string>('CRYPTOBOT_TOKEN');
    if (!token) throw new ServiceUnavailableException('CryptoBot не настроен');
    const res = await fetch(`${API}/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Crypto-Pay-API-Token': token,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
    const data: any = await res.json().catch(() => ({}));
    if (!res.ok || data?.ok !== true) {
      this.logger.warn(`CryptoBot ${method}: ${JSON.stringify(data).slice(0, 200)}`);
      throw new ServiceUnavailableException('CryptoBot временно недоступен');
    }
    return data.result;
  }

  async createInvoice(opts: {
    asset: string;
    amount: string;
    description: string;
    payload: string;
  }): Promise<{ invoice_id: number; bot_invoice_url: string; amount: string; asset: string }> {
    return this.call('createInvoice', {
      asset: opts.asset,
      amount: opts.amount,
      description: opts.description.slice(0, 100),
      payload: opts.payload.slice(0, 255),
      allow_anonymous: true,
    });
  }

  async getInvoiceStatus(invoiceId: number): Promise<'paid' | 'pending'> {
    const res: any = await this.call('getInvoices', { invoice_ids: invoiceId });
    const items = Array.isArray(res?.items) ? res.items : [];
    return items[0]?.status === 'paid' ? 'paid' : 'pending';
  }
}
