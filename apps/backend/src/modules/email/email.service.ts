import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

@Injectable()
export class EmailService {
  private logger = new Logger(EmailService.name);
  private resend: Resend | null;
  constructor(private config: ConfigService) {
    const key = config.get<string>('RESEND_API_KEY');
    this.resend = key ? new Resend(key) : null;
  }
  private async send(
    email: string,
    subject: string,
    message: string,
    path: string,
    button: string,
  ) {
    if (!this.resend) {
      this.logger.warn('Email delivery is not configured');
      return false;
    }
    const url =
      this.config.get<string>('FRONTEND_URL', 'http://localhost:3001').replace(/\/$/, '') + path;
    try {
      const result = await this.resend.emails.send({
        from: this.config.get<string>('EMAIL_FROM', 'Appi <noreply@example.invalid>'),
        to: email,
        subject,
        text: `${subject}\n\n${message}\n\n${button}: ${url}\n\nЕсли вы не запрашивали это действие, проигнорируйте письмо.`,
        html: `<div style="background:#111815;color:#f3f5ee;padding:32px;font-family:Arial,sans-serif;max-width:520px;border-radius:20px"><p style="color:#b9f477">APPI VPN</p><h1>${escapeHtml(subject)}</h1><p>${escapeHtml(message)}</p><p style="padding:20px 0"><a style="background:#b9f477;color:#111815;padding:14px 20px;border-radius:10px;text-decoration:none" href="${escapeHtml(url)}">${escapeHtml(button)}</a></p><small>Если вы не запрашивали это действие, проигнорируйте письмо.</small></div>`,
      });
      if (result.error || !result.data?.id) throw new Error('Delivery rejected');
      return true;
    } catch {
      this.logger.error(
        'Email delivery failed; check provider configuration and delivery dashboard',
      );
      return false;
    }
  }
  sendVerificationEmail(email: string, token: string) {
    return this.send(
      email,
      'Подтвердите email в Appi',
      'Ссылка действует 24 часа. Подтверждение нужно для пробного VPN.',
      '/verify-email?token=' + encodeURIComponent(token),
      'Подтвердить email',
    );
  }
  sendPasswordResetEmail(email: string, token: string) {
    return this.send(
      email,
      'Восстановление доступа к Appi',
      'Ссылка действует один час и может быть использована только один раз.',
      '/reset-password?token=' + encodeURIComponent(token),
      'Задать новый пароль',
    );
  }
  sendPaymentConfirmationEmail(email: string, plan: string, amount: number, currency: string) {
    return this.send(
      email,
      'Оплата Appi подтверждена',
      `Тариф ${plan}, оплачено ${amount} ${currency}. Статус персонального VPN доступен в кабинете.`,
      '/dashboard',
      'Открыть кабинет',
    );
  }
}
