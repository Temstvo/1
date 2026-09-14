import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramWalletService {
  private readonly logger = new Logger(TelegramWalletService.name);
  private readonly walletUsername: string;
  private readonly walletAddress: string;

  constructor(private configService: ConfigService) {
    this.walletUsername = this.configService.get<string>('TELEGRAM_WALLET_USERNAME', 'wallet');
    this.walletAddress = this.configService.get<string>('TELEGRAM_WALLET_ADDRESS', '');
  }

  isConfigured(): boolean {
    return !!this.walletUsername || !!this.walletAddress;
  }

  getWalletInfo() {
    return {
      username: this.walletUsername,
      address: this.walletAddress,
      configured: this.isConfigured(),
    };
  }

  createPaymentLink(amount: number, currency: string, payload: string): string {
    // Для @wallet / @CryptoBot — диплинк
    // Если указан адрес TON — даём TON deep link
    if (this.walletAddress && currency.toUpperCase() === 'TON') {
      return `ton://transfer/${this.walletAddress}?amount=${Math.floor(amount * 1e9)}&text=${encodeURIComponent(payload)}`;
    }
    // CryptoBot формат: https://t.me/CryptoBot?start=invoice_<id>
    // Упрощённо — ссылка на @wallet с суммой
    const text = encodeURIComponent(`APPI VPN — оплата ${amount} ${currency} (${payload})`);
    return `https://t.me/${this.walletUsername}?text=${text}`;
  }

  createInvoiceLink(
    amount: number,
    currency: string,
    orderId: string,
  ): { url: string; payload: string } {
    const payload = `appi_${orderId}`;
    const url = this.createPaymentLink(amount, currency, payload);
    this.logger.log(`Telegram wallet invoice ${orderId}: ${amount} ${currency} -> ${url}`);
    return { url, payload };
  }
}
