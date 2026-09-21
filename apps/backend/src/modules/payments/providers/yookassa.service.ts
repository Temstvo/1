import { Injectable, BadGatewayException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class YooKassaService {
  constructor(private config: ConfigService) {}
  isConfigured() {
    return !!(this.config.get('YOOKASSA_SHOP_ID') && this.config.get('YOOKASSA_SECRET_KEY'));
  }

  private async request(method: string, path: string, body?: unknown, idempotencyKey?: string) {
    if (!this.isConfigured()) throw new ServiceUnavailableException('Оплата пока не настроена');
    // Deliberately fixed origin: a webhook cannot turn a payment lookup into SSRF.
    const response = await fetch('https://api.yookassa.ru/v3' + path, {
      method,
      redirect: 'error',
      signal: AbortSignal.timeout(15000),
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(
            this.config.get('YOOKASSA_SHOP_ID') + ':' + this.config.get('YOOKASSA_SECRET_KEY'),
          ).toString('base64'),
        'Content-Type': 'application/json',
        ...(idempotencyKey ? { 'Idempotence-Key': idempotencyKey } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) throw new BadGatewayException('Провайдер оплаты временно недоступен');
    return response.json();
  }

  createPayment(data: {
    id: string;
    amount: string;
    currency: string;
    description: string;
    userId: string;
    planId: string;
    email: string;
  }) {
    const vat = this.config.get<string>('YOOKASSA_VAT_CODE');
    const body = {
      amount: { value: data.amount, currency: data.currency },
      capture: true,
      description: data.description,
      metadata: { paymentId: data.id, userId: data.userId, planId: data.planId },
      confirmation: {
        type: 'redirect',
        return_url:
          this.config.get('FRONTEND_URL', 'http://localhost:3001') +
          '/checkout/success?paymentId=' +
          data.id,
      },
      ...(vat
        ? {
            receipt: {
              customer: { email: data.email },
              items: [
                {
                  description: data.description,
                  quantity: '1.00',
                  amount: { value: data.amount, currency: data.currency },
                  vat_code: Number(vat),
                  payment_mode: 'full_payment',
                  payment_subject: 'service',
                },
              ],
            },
          }
        : {}),
    };
    return this.request('POST', '/payments', body, data.id);
  }

  getPayment(id: string) {
    if (!/^[a-zA-Z0-9-]{1,64}$/.test(id))
      throw new BadGatewayException('Некорректный ID провайдера');
    return this.request('GET', '/payments/' + encodeURIComponent(id));
  }

  getRefund(id: string) {
    if (!/^[a-zA-Z0-9-]{1,64}$/.test(id)) throw new BadGatewayException('Некорректный ID возврата');
    return this.request('GET', '/refunds/' + encodeURIComponent(id));
  }
}
