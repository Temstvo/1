import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptomusService {
  private readonly logger = new Logger(CryptomusService.name);
  private apiKey: string;
  private merchantId: string;
  private baseUrl = 'https://api.cryptomus.com/v1';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('CRYPTOMUS_API_KEY', '');
    this.merchantId = this.configService.get<string>('CRYPTOMUS_MERCHANT_ID', '');
  }

  private getSign(body: any): string {
    const base64Body = Buffer.from(JSON.stringify(body)).toString('base64');
    return crypto.createHash('md5').update(base64Body + this.apiKey).digest('hex');
  }

  private async request(method: string, path: string, body?: any): Promise<any> {
    const headers: Record<string, string> = {
      'merchant-id': this.merchantId,
      'Content-Type': 'application/json',
    };

    if (body) {
      headers['sign'] = this.getSign(body);
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();
    if (data.status !== 'success') {
      this.logger.error(`Cryptomus error: ${JSON.stringify(data)}`);
      throw new Error(data.message || 'Cryptomus payment error');
    }
    return data.result;
  }

  async createPayment(data: {
    amount: string;
    currency: string;
    order_id: string;
    url_success: string;
    url_callback: string;
    currencies?: string[];
  }): Promise<{
    uuid: string;
    status: string;
    payment_url: string;
  }> {
    const body: any = {
      amount: data.amount,
      currency: data.currency,
      order_id: data.order_id,
      url_success: data.url_success,
      url_callback: data.url_callback,
    };

    if (data.currencies) {
      body.currencies = data.currencies;
    }

    const result = await this.request('POST', '/payment', body);

    return {
      uuid: result.uuid,
      status: result.status,
      payment_url: result.payment_url,
    };
  }

  async getPaymentStatus(uuid: string): Promise<any> {
    return this.request('POST', '/payment/status', { uuid });
  }

  verifyWebhook(body: any, sign: string): boolean {
    const base64Body = Buffer.from(JSON.stringify(body)).toString('base64');
    const expectedSign = crypto.createHash('md5').update(base64Body + this.apiKey).digest('hex');
    return sign === expectedSign;
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.merchantId);
  }
}
