import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class YooKassaService {
  private readonly logger = new Logger(YooKassaService.name);
  private shopId: string;
  private secretKey: string;
  private baseUrl = 'https://api.yookassa.ru/v3';

  constructor(private configService: ConfigService) {
    this.shopId = this.configService.get<string>('YOOKASSA_SHOP_ID', '');
    this.secretKey = this.configService.get<string>('YOOKASSA_SECRET_KEY', '');
  }

  private getAuth(): string {
    return 'Basic ' + Buffer.from(`${this.shopId}:${this.secretKey}`).toString('base64');
  }

  private async request(method: string, path: string, body?: any): Promise<any> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'Authorization': this.getAuth(),
        'Content-Type': 'application/json',
        'Idempotence-Key': crypto.randomUUID(),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();
    if (!res.ok) {
      this.logger.error(`YooKassa error: ${res.status} ${JSON.stringify(data)}`);
      throw new Error(data.description || `YooKassa error ${res.status}`);
    }
    return data;
  }

  async createPayment(data: {
    amount: number;
    currency: string;
    description: string;
    metadata?: Record<string, string>;
    capture?: boolean;
    returnReturnUrl?: string;
  }): Promise<{
    id: string;
    status: string;
    confirmationUrl: string;
    paymentMethod: string;
  }> {
    const body: any = {
      amount: {
        value: data.amount.toFixed(2),
        currency: data.currency,
      },
      description: data.description,
      metadata: data.metadata || {},
      capture: data.capture !== false,
      confirmation: {
        type: 'redirect',
        return_url: data.returnReturnUrl || 'https://appi-frontend.vercel.app/checkout/success',
      },
    };

    const result = await this.request('POST', '/payments', body);

    return {
      id: result.id,
      status: result.status,
      confirmationUrl: result.confirmation?.confirmation_url || '',
      paymentMethod: result.payment_method?.type || '',
    };
  }

  async getPayment(paymentId: string): Promise<any> {
    return this.request('GET', `/payments/${paymentId}`);
  }

  verifyWebhook(body: any, signatureHeader: string): boolean {
    if (!signatureHeader) return false;
    
    const sortedKeys = Object.keys(body).sort();
    const signData = sortedKeys.map(k => `${k}=${JSON.stringify(body[k])}`).join('&');
    const hmac = crypto.createHmac('sha256', this.secretKey);
    hmac.update(signData);
    const expectedSignature = hmac.digest('hex');
    
    return signatureHeader === expectedSignature;
  }

  isConfigured(): boolean {
    return !!(this.shopId && this.secretKey);
  }
}
