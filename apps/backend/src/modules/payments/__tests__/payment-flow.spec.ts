import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from '../payments.service';
import { PrismaService } from '../../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import { YooKassaService } from '../providers/yookassa.service';
import { CryptomusService } from '../providers/cryptomus.service';
import { InvoicesService } from '../../invoices/invoices.service';
import { EmailService } from '../../email/email.service';
import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

jest.setTimeout(180000);

const E2E_DB_URL = process.env.DATABASE_URL;

function e2eDescribe(name: string, fn: () => void) {
  return E2E_DB_URL ? describe(name, fn) : describe.skip(name, fn);
}

const YOOKASSA_TEST_SECRET = 'test-secret-key';

function signYooKassa(rawBody: string): string {
  const hmac = crypto.createHmac('sha256', YOOKASSA_TEST_SECRET);
  hmac.update(rawBody, 'utf8');
  return hmac.digest('base64');
}

e2eDescribe('Payment flow e2e (real Supabase DB, mock provider)', () => {
  let service: PaymentsService;
  let prisma: PrismaService;
  let userId: string | null = null;
  let planId: string | null = null;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        PrismaService,
        { provide: ConfigService, useValue: { get: jest.fn(() => 'http://localhost:3000') } },
        {
          provide: YooKassaService,
          useValue: {
            createPayment: jest.fn(async () => ({
              id: 'yookassa-test-0001',
              status: 'pending',
              confirmationUrl: 'https://yookassa.ru/confirmation-test',
              paymentMethod: 'bank_card',
            })),
            verifyWebhook: (rawBody: string, signature: string) => {
              if (!rawBody || !signature) return false;
              const hmac = crypto.createHmac('sha256', YOOKASSA_TEST_SECRET);
              hmac.update(rawBody, 'utf8');
              return hmac.digest('base64') === signature;
            },
            isConfigured: () => true,
          },
        },
        {
          provide: CryptomusService,
          useValue: { createPayment: jest.fn(), isConfigured: () => false },
        },
        { provide: InvoicesService, useValue: { create: jest.fn() } },
        { provide: EmailService, useValue: { sendPaymentConfirmationEmail: jest.fn() } },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it('full flow: checkout -> webhook -> subscription activated', async () => {
    const plan = await prisma.plan.findFirst({ where: { isActive: true } });
    expect(plan).toBeTruthy();
    planId = plan!.id;

    const user = await prisma.user.create({
      data: {
        email: `e2e-payment-${Date.now()}@appi-test.local`,
        passwordHash: 'x',
        referralCode: `E2E${Date.now().toString(36).toUpperCase()}`,
      },
    });
    userId = user.id;

    const checkout = await service.createYooKassaPayment(user.id, planId);
    expect(checkout.confirmationUrl).toBeTruthy();
    expect(checkout.paymentId).toBeTruthy();
    expect(checkout.subscription.status).toBe('PENDING');

    const pendingSub = await prisma.subscription.findUnique({
      where: { id: checkout.subscription.id },
    });
    expect(pendingSub?.status).toBe('PENDING');
    expect(pendingSub?.planId).toBe(planId);

    const payload = {
      event: 'payment.succeeded',
      object: {
        id: 'yookassa-test-0001',
        status: 'succeeded',
        amount: { value: '99.00', currency: 'RUB' },
      },
    };
    const rawBody = JSON.stringify(payload);
    const signature = signYooKassa(rawBody);

    const result = await service.handleYooKassaWebhook(payload, signature, rawBody);
    expect(result.event).toBe('payment.succeeded');

    const payment = await prisma.payment.findUnique({ where: { id: checkout.paymentId } });
    expect(payment?.status).toBe('COMPLETED');
    expect(payment?.webhookVerified).toBe(true);

    const sub = await prisma.subscription.findUnique({
      where: { id: checkout.subscription.id },
      include: { plan: true },
    });
    expect(sub?.status).toBe('ACTIVE');
    expect(sub?.startedAt).toBeTruthy();
    expect(sub?.autoRenew).toBe(true);

    const durationDays = sub!.plan.duration;
    const expected = new Date(sub!.startedAt!);
    expected.setDate(expected.getDate() + durationDays);
    const diffMs = Math.abs(sub!.expiresAt.getTime() - expected.getTime());
    expect(diffMs).toBeLessThan(60 * 1000);

    const duplicate = await service.handleYooKassaWebhook(payload, signature, rawBody);
    expect(duplicate.event).toBe('duplicate');
  });

  it('rejects webhook with invalid signature', async () => {
    const payload = { event: 'payment.succeeded', object: { id: 'yookassa-test-0001' } };
    const rawBody = JSON.stringify(payload);
    await expect(
      service.handleYooKassaWebhook(payload, 'wrong-signature', rawBody),
    ).rejects.toThrow(BadRequestException);
  });
});
