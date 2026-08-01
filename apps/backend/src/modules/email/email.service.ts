import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private fromEmail: string;
  private frontendUrl: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY', '');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
    this.fromEmail = this.configService.get<string>('EMAIL_FROM', 'APPI VPN <noreply@appivpn.com>');
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'https://appi-frontend.vercel.app');
  }

  private isConfigured(): boolean {
    return !!this.resend;
  }

  async sendVerificationEmail(email: string, token: string) {
    if (!this.isConfigured()) {
      this.logger.warn('Email not configured, skipping verification email');
      return;
    }

    const url = `${this.frontendUrl}/verify-email?token=${token}`;

    try {
      await this.resend!.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Verify your APPI VPN account',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin:0;padding:0;background:#0d0d0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            <div style="max-width:480px;margin:40px auto;background:#141414;border-radius:16px;border:1px solid rgba(255,255,255,0.05);overflow:hidden;">
              <div style="padding:40px 32px;text-align:center;">
                <img src="${this.frontendUrl}/logo.png" alt="APPI VPN" width="48" height="48" style="margin-bottom:16px;">
                <h1 style="color:#fff;font-size:24px;margin:0 0 8px;">Verify your email</h1>
                <p style="color:#888;font-size:14px;margin:0 0 32px;">Click the button below to verify your email address and activate your account.</p>
                <a href="${url}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:14px;">Verify Email</a>
                <p style="color:#555;font-size:12px;margin:32px 0 0;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error: any) {
      this.logger.error(`Failed to send verification email: ${error.message || error}`);
    }
  }

  async sendPasswordResetEmail(email: string, token: string) {
    if (!this.isConfigured()) {
      this.logger.warn('Email not configured, skipping password reset email');
      return;
    }

    const url = `${this.frontendUrl}/reset-password?token=${token}`;

    try {
      await this.resend!.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Reset your APPI VPN password',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin:0;padding:0;background:#0d0d0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            <div style="max-width:480px;margin:40px auto;background:#141414;border-radius:16px;border:1px solid rgba(255,255,255,0.05);overflow:hidden;">
              <div style="padding:40px 32px;text-align:center;">
                <img src="${this.frontendUrl}/logo.png" alt="APPI VPN" width="48" height="48" style="margin-bottom:16px;">
                <h1 style="color:#fff;font-size:24px;margin:0 0 8px;">Reset your password</h1>
                <p style="color:#888;font-size:14px;margin:0 0 32px;">Click the button below to set a new password for your account.</p>
                <a href="${url}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:14px;">Reset Password</a>
                <p style="color:#555;font-size:12px;margin:32px 0 0;">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error: any) {
      this.logger.error(`Failed to send password reset email: ${error.message || error}`);
    }
  }

  async sendPaymentConfirmationEmail(email: string, planName: string, amount: number, currency: string) {
    if (!this.isConfigured()) {
      this.logger.warn('Email not configured, skipping payment confirmation email');
      return;
    }

    try {
      await this.resend!.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Payment confirmed — APPI VPN',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin:0;padding:0;background:#0d0d0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
            <div style="max-width:480px;margin:40px auto;background:#141414;border-radius:16px;border:1px solid rgba(255,255,255,0.05);overflow:hidden;">
              <div style="padding:40px 32px;text-align:center;">
                <img src="${this.frontendUrl}/logo.png" alt="APPI VPN" width="48" height="48" style="margin-bottom:16px;">
                <h1 style="color:#fff;font-size:24px;margin:0 0 8px;">Payment confirmed!</h1>
                <p style="color:#888;font-size:14px;margin:0 0 24px;">Your <strong style="color:#c4b5fd;">${planName}</strong> subscription is now active.</p>
                <div style="background:#1a1a1a;border-radius:12px;padding:16px;margin:0 0 24px;">
                  <p style="color:#888;font-size:12px;margin:0 0 4px;">Amount paid</p>
                  <p style="color:#fff;font-size:20px;font-weight:700;margin:0;">${amount} ${currency}</p>
                </div>
                <a href="${this.frontendUrl}/vpn" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:14px;">Open APPI VPN</a>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      this.logger.log(`Payment confirmation email sent to ${email}`);
    } catch (error: any) {
      this.logger.error(`Failed to send payment confirmation email: ${error.message || error}`);
    }
  }
}
