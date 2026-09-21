import { Test } from '@nestjs/testing';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { mkdtemp, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { PrismaService } from '../../../database/prisma.service';
import { BigIntInterceptor } from '../../../common/interceptors/bigint.interceptor';
import { GlobalExceptionFilter } from '../../../common/filters/global-exception.filter';
import { AuthService } from '../../auth/auth.service';
import { TokenService } from '../../auth/token.service';
import { EmailService } from '../../email/email.service';
import { TelegramNotifyService } from '../../telegram/telegram-notify.service';
import { YooKassaService } from '../providers/yookassa.service';
import { PaymentsService } from '../payments.service';
import { MarzbanService } from '../../vpn/marzban.service';
import { VpnService } from '../../vpn/vpn.service';
import { TrialService } from '../../subscriptions/trial.service';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';

const enabled = process.env.RUN_DATABASE_TESTS === 'true';
const integration = enabled ? describe : describe.skip;
integration('Real PostgreSQL: guest, session, billing and VPN lifecycle (provider doubles)', () => {
  let app: INestApplication,
    db: PrismaService,
    auth: AuthService,
    payments: PaymentsService,
    vpn: VpnService,
    config: ConfigService;
  const users: string[] = [];
  let planId: string;
  let profileDirectory: string;
  const profileUuid = randomUUID();
  const remote = new Map<string, any>();
  const refunds = new Map<string, any>();
  const provider = {
    getRefund: jest.fn(async (id: string) => structuredClone(refunds.get(id))),
    isConfigured: () => true,
    createPayment: jest.fn(async (order: any) => {
      let value = [...remote.values()].find((v) => v.metadata.paymentId === order.id);
      if (!value) {
        value = {
          id: randomUUID(),
          status: 'pending',
          paid: false,
          test: true,
          amount: { value: order.amount, currency: order.currency },
          metadata: { paymentId: order.id, userId: order.userId, planId: order.planId },
          recipient: { account_id: 'contract-shop' },
          confirmation: { confirmation_url: 'https://yookassa.example.test/checkout' },
        };
        remote.set(value.id, value);
      }
      return structuredClone(value);
    }),
    getPayment: jest.fn(async (id: string) => structuredClone(remote.get(id))),
  };
  const marzban = {
    configured: () => true,
    sync: jest.fn(async (_access: any, on: boolean) =>
      on
        ? { links: ['test-provider-link'], subscriptionUrl: 'https://vpn.example.test/sub/test' }
        : null,
    ),
  };
  beforeAll(async () => {
    if (
      process.env.NODE_ENV !== 'test' ||
      !process.env.DATABASE_URL ||
      !new URL(process.env.DATABASE_URL).pathname.endsWith('_test')
    )
      throw new Error('Use a dedicated DATABASE_URL ending in _test with NODE_ENV=test');
    process.env.ENABLE_GUEST_ACCESS = 'true';
    profileDirectory = await mkdtemp(join(tmpdir(), 'appi-integration-profiles-'));
    await writeFile(
      join(profileDirectory, 'profile.json'),
      JSON.stringify({
        name: 'Test UK',
        country: 'United Kingdom',
        host: 'vpn.example.test',
        port: 443,
        uuid: profileUuid,
        type: 'xhttp',
        security: 'tls',
        sni: 'example.test',
        path: '/tunnel',
      }),
    );
    process.env.SERV_CONFIGS_DIR = profileDirectory;
    const { AppModule } = await import('../../../app.module');
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(YooKassaService)
      .useValue(provider)
      .overrideProvider(MarzbanService)
      .useValue(marzban)
      .overrideProvider(EmailService)
      .useValue({
        sendVerificationEmail: jest.fn(),
        sendPasswordResetEmail: jest.fn(),
        sendSecurityAlertEmail: jest.fn(),
      })
      .overrideProvider(TelegramNotifyService)
      .useValue({ sendAdmin: jest.fn().mockResolvedValue(undefined) })
      .compile();
    app = module.createNestApplication();
    app.useLogger(false);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalInterceptors(new BigIntInterceptor());
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
    for (const job of app.get(SchedulerRegistry).getCronJobs().values()) job.stop();
    db = app.get(PrismaService);
    auth = app.get(AuthService);
    payments = app.get(PaymentsService);
    vpn = app.get(VpnService);
    config = app.get(ConfigService);
    config.set('ENABLE_CHECKOUT', 'true');
    config.set('MARZBAN_URL', 'https://vpn.example.test');
    config.set('YOOKASSA_SHOP_ID', 'contract-shop');
    config.set('YOOKASSA_TEST_MODE', 'true');
    const plan = await db.plan.create({
      data: {
        name: 'Integration ' + randomUUID(),
        price: 499,
        currency: 'RUB',
        duration: 30,
        trafficLimit: 50000000n,
        deviceLimit: 3,
        features: [],
        protocols: ['VLESS'],
        isActive: true,
      },
    });
    planId = plan.id;
  }, 30000);
  afterAll(async () => {
    if (db) {
      await db.ticket.deleteMany({ where: { userId: { in: users } } });
      await db.invoice.deleteMany({ where: { userId: { in: users } } });
      await db.payment.deleteMany({ where: { userId: { in: users } } });
      await db.vpnAccess.deleteMany({ where: { userId: { in: users } } });
      await db.subscription.deleteMany({ where: { userId: { in: users } } });
      await db.session.deleteMany({ where: { userId: { in: users } } });
      await db.securityEvent.deleteMany({ where: { userId: { in: users } } });
      await db.auditLog.deleteMany({ where: { actorId: { in: users } } });
      await db.profile.deleteMany({ where: { userId: { in: users } } });
      await db.user.deleteMany({ where: { id: { in: users } } });
      if (planId) await db.plan.delete({ where: { id: planId } });
    }
    await app?.close();
    if (
      profileDirectory &&
      profileDirectory.startsWith(join(tmpdir(), 'appi-integration-profiles-'))
    )
      await rm(profileDirectory, { recursive: true, force: true });
  }, 30000);
  it('lists imported metadata publicly but exports credentials only with a session and explicit flag', async () => {
    config.set('ENABLE_IMPORTED_VPN_ACCESS', 'false');
    const listing = await request(app.getHttpServer()).get('/api/vpn/imported/servers').expect(200);
    expect(listing.body.profiles).toHaveLength(1);
    expect(JSON.stringify(listing.body)).not.toContain(profileUuid);
    expect(JSON.stringify(listing.body)).not.toContain('vpn.example.test');
    const path = '/api/vpn/imported/servers/' + listing.body.profiles[0].id + '/config';
    await request(app.getHttpServer()).get(path).expect(401);
    const guest = await auth.guest();
    users.push(guest.user.id);
    await request(app.getHttpServer())
      .get(path)
      .set('Authorization', 'Bearer ' + guest.accessToken)
      .expect(403);
    config.set('ENABLE_IMPORTED_VPN_ACCESS', 'true');
    const exported = await request(app.getHttpServer())
      .get(path)
      .set('Authorization', 'Bearer ' + guest.accessToken)
      .expect(200);
    expect(exported.headers['cache-control']).toBe('no-store');
    expect(exported.body.config.outbounds[0].settings.vnext[0].users[0].id).toBe(profileUuid);
    config.set('ENABLE_IMPORTED_VPN_ACCESS', 'false');
  });

  it('creates an unprivileged guest, saves the same account, rotates tokens and revokes logout', async () => {
    const guest = await request(app.getHttpServer()).post('/api/auth/guest').send({}).expect(201);
    const id = guest.body.user.id;
    users.push(id);
    const access = guest.body.accessToken;
    expect(access).toBeTruthy();
    expect(guest.body.user.role).toBe('USER');
    await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', 'Bearer ' + access)
      .expect(200);
    await request(app.getHttpServer())
      .get('/api/admin/overview')
      .set('Authorization', 'Bearer ' + access)
      .expect(403);
    await request(app.getHttpServer())
      .get('/api/vpn/configs')
      .set('Authorization', 'Bearer ' + access)
      .expect(403);
    expect(await db.subscription.count({ where: { userId: id } })).toBe(0);
    await expect(payments.createCheckoutSession(id, planId)).rejects.toThrow('сохраните аккаунт');
    const email = 'integration-' + randomUUID() + '@example.test',
      password = 'TestPassword42!';
    await request(app.getHttpServer())
      .post('/api/auth/claim')
      .set('Authorization', 'Bearer ' + access)
      .send({ email, password, role: 'ADMIN' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/auth/claim')
      .set('Authorization', 'Bearer ' + access)
      .send({ email, password, firstName: 'Test' })
      .expect(201);
    expect((await db.user.findUniqueOrThrow({ where: { id } })).email).toBe(email);
    await expect(auth.claimGuest(id, { email: 'second@example.test', password })).rejects.toThrow();
    const login = await auth.login({ email, password });
    const rotated = await auth.refresh(login.refreshToken);
    await expect(auth.refresh(login.refreshToken)).rejects.toThrow();
    await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', 'Bearer ' + login.accessToken)
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Authorization', 'Bearer ' + rotated.accessToken)
      .send({})
      .expect(200);
    await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', 'Bearer ' + rotated.accessToken)
      .expect(401);
  }, 30000);
  it('accepts only verified payments, deduplicates concurrent callbacks, renews, retries and revokes VPN', async () => {
    const result = await auth.register({
      email: 'billing-' + randomUUID() + '@example.test',
      password: 'TestPassword42!',
    });
    const id = result.user.id;
    users.push(id);
    const key = randomUUID();
    const order = await payments.createCheckoutSession(id, planId, undefined, 'YOOKASSA', key);
    expect(
      (await payments.createCheckoutSession(id, planId, undefined, 'YOOKASSA', key)).paymentId,
    ).toBe(order.paymentId);
    expect(await db.payment.count({ where: { userId: id } })).toBe(1);
    const local = await db.payment.findUniqueOrThrow({ where: { id: order.paymentId } });
    const value = remote.get(local.transactionId!);
    const callback = {
      type: 'notification',
      event: 'payment.succeeded',
      object: { id: value.id, paid: true },
    };
    await expect(payments.handleYooKassaWebhook(callback)).rejects.toThrow();
    expect(await db.subscription.count({ where: { userId: id } })).toBe(0);
    value.status = 'succeeded';
    value.paid = true;
    value.amount.value = '0.01';
    await expect(payments.handleYooKassaWebhook(callback)).rejects.toThrow();
    value.amount.value = '499.00';
    await Promise.all([
      payments.handleYooKassaWebhook(callback),
      payments.handleYooKassaWebhook(callback),
      payments.handleYooKassaWebhook(callback),
    ]);
    expect(await db.subscription.count({ where: { userId: id, status: 'ACTIVE' } })).toBe(1);
    expect(await db.invoice.count({ where: { userId: id } })).toBe(1);
    await expect(vpn.getUserConfigs(id)).rejects.toThrow();
    marzban.sync.mockRejectedValueOnce(new Error('Temporary provider failure'));
    await vpn.syncUser(id);
    expect((await db.vpnAccess.findUniqueOrThrow({ where: { userId: id } })).status).toBe('ERROR');
    await vpn.syncUser(id);
    expect((await vpn.getUserConfigs(id)).subscriptionUrl).toBe(
      'https://vpn.example.test/sub/test',
    );
    const access = await db.vpnAccess.findUniqueOrThrow({ where: { userId: id } });
    expect(access.encryptedConfig).not.toContain('test-provider-link');
    const first = (
      await db.subscription.findFirstOrThrow({ where: { userId: id, status: 'ACTIVE' } })
    ).expiresAt;
    const renewal = await payments.createCheckoutSession(
      id,
      planId,
      undefined,
      'YOOKASSA',
      randomUUID(),
    );
    const second = [...remote.values()].find((v) => v.metadata.paymentId === renewal.paymentId);
    second.status = 'succeeded';
    second.paid = true;
    await payments.handleYooKassaWebhook({ ...callback, object: { id: second.id } });
    expect(
      (
        await db.subscription.findFirstOrThrow({ where: { userId: id, status: 'ACTIVE' } })
      ).expiresAt.getTime() - first.getTime(),
    ).toBe(30 * 86400000);
    const other = users[0];
    await expect(payments.findById(order.paymentId, other)).rejects.toThrow();
    await app.get(SubscriptionsService).cancel(id, 'integration');
    await vpn.syncUser(id);
    expect(marzban.sync.mock.calls.at(-1)?.[1]).toBe(false);
    await expect(vpn.getUserConfigs(id)).rejects.toThrow();
    expect(
      (await db.vpnAccess.findUniqueOrThrow({ where: { userId: id } })).encryptedConfig,
    ).toBeNull();
  }, 30000);
  it('fails closed for expired entitlement even before the scheduled sync', async () => {
    const guest = await auth.guest();
    const id = guest.user.id;
    users.push(id);
    await db.subscription.create({
      data: { userId: id, planId, status: 'ACTIVE', expiresAt: new Date(Date.now() - 1000) },
    });
    await expect(vpn.getUserConfigs(id)).rejects.toThrow();
  });
  it('issues one bounded trial per verified account under concurrent requests and expires it', async () => {
    const result = await auth.register({
      email: 'trial-' + randomUUID() + '@example.test',
      password: 'TestPassword42!',
    });
    const id = result.user.id;
    users.push(id);
    const trial = app.get(TrialService);
    config.set('ENABLE_VPN_TRIAL', 'true');
    config.set('TRIAL_HOURS', '24');
    config.set('TRIAL_TRAFFIC_GB', '1');
    config.set('TRIAL_DAILY_LIMIT', '50');
    await expect(trial.start(id)).rejects.toThrow('подтвердите');
    await db.user.update({ where: { id }, data: { emailVerified: true } });
    const attempts = await Promise.allSettled([trial.start(id), trial.start(id)]);
    expect(attempts.filter((a) => a.status === 'fulfilled')).toHaveLength(1);
    const sub = await db.subscription.findFirstOrThrow({ where: { userId: id } });
    expect(sub.status).toBe('TRIAL');
    expect(sub.expiresAt.getTime() - Date.now()).toBeGreaterThan(23 * 3600000);
    expect(sub.expiresAt.getTime() - Date.now()).toBeLessThanOrEqual(24 * 3600000);
    expect((await db.vpnAccess.findUniqueOrThrow({ where: { userId: id } })).trafficLimit).toBe(
      1073741824n,
    );
    await vpn.syncUser(id);
    expect((await vpn.getUserConfigs(id)).subscriptionUrl).toBeTruthy();
    await db.subscription.update({
      where: { id: sub.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    await vpn.syncUser(id);
    expect(marzban.sync.mock.calls.at(-1)?.[1]).toBe(false);
    await expect(trial.start(id)).rejects.toThrow('первой подписки');
    await expect(vpn.getUserConfigs(id)).rejects.toThrow();
    config.set('ENABLE_VPN_TRIAL', 'false');
  }, 30000);

  it('reconciles a missed payment callback and handles duplicate partial/full refunds exactly once', async () => {
    const result = await auth.register({
      email: 'refund-' + randomUUID() + '@example.test',
      password: 'TestPassword42!',
    });
    const id = result.user.id;
    users.push(id);
    const order = await payments.createCheckoutSession(id, planId);
    const value = [...remote.values()].find((v) => v.metadata.paymentId === order.paymentId);
    value.status = 'succeeded';
    value.paid = true;
    await payments.reconcilePending();
    const original = await db.subscription.findFirstOrThrow({
      where: { userId: id, status: 'ACTIVE' },
    });
    const refundId = randomUUID();
    refunds.set(refundId, {
      id: refundId,
      payment_id: value.id,
      status: 'pending',
      amount: { value: '249.50', currency: 'RUB' },
    });
    await expect(payments.reconcileRefund(refundId)).rejects.toThrow();
    refunds.get(refundId).status = 'succeeded';
    await Promise.all([payments.reconcileRefund(refundId), payments.reconcileRefund(refundId)]);
    expect(await db.refund.count({ where: { paymentId: order.paymentId } })).toBe(1);
    const half = await db.subscription.findUniqueOrThrow({ where: { id: original.id } });
    expect(original.expiresAt.getTime() - half.expiresAt.getTime()).toBe(15 * 86400000);
    expect((await db.vpnAccess.findUniqueOrThrow({ where: { userId: id } })).trafficLimit).toBe(
      25000000n,
    );
    const finalId = randomUUID();
    refunds.set(finalId, { ...refunds.get(refundId), id: finalId });
    await payments.handleYooKassaWebhook({
      type: 'notification',
      event: 'refund.succeeded',
      object: { id: finalId },
    });
    expect((await db.payment.findUniqueOrThrow({ where: { id: order.paymentId } })).status).toBe(
      'REFUNDED',
    );
    await vpn.syncUser(id);
    expect(marzban.sync.mock.calls.at(-1)?.[1]).toBe(false);
    await expect(vpn.getUserConfigs(id)).rejects.toThrow();
    const extraId = randomUUID();
    refunds.set(extraId, { ...refunds.get(refundId), id: extraId });
    await expect(payments.reconcileRefund(extraId)).rejects.toThrow('превышает');
  }, 30000);

  it('consumes a reset token atomically and revokes every existing session', async () => {
    const result = await auth.register({
      email: 'reset-' + randomUUID() + '@example.test',
      password: 'TestPassword42!',
    });
    const id = result.user.id;
    users.push(id);
    const token = randomUUID();
    await db.user.update({
      where: { id },
      data: {
        passwordResetTokenHash: app.get(TokenService).hashToken(token),
        passwordResetExpiresAt: new Date(Date.now() + 60000),
        loginAttempts: 6,
        lockedUntil: new Date(Date.now() + 60000),
      },
    });
    const reset = await Promise.allSettled([
      auth.resetPassword(token, 'ChangedPassword42!'),
      auth.resetPassword(token, 'OtherPassword42!'),
    ]);
    expect(reset.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(await db.session.count({ where: { userId: id, isActive: true } })).toBe(0);
    const saved = await db.user.findUniqueOrThrow({ where: { id } });
    expect(saved.passwordResetTokenHash).toBeNull();
    expect(saved.lockedUntil).toBeNull();
    await expect(auth.resetPassword(token, 'AgainPassword42!')).rejects.toThrow();
  }, 30000);

  it('keeps support tickets private and denies customer access to the staff queue', async () => {
    const account = await auth.register({
      email: 'support-' + randomUUID() + '@example.test',
      password: 'TestPassword42!',
    });
    users.push(account.user.id);
    const api = request(app.getHttpServer());
    const ticket = await api
      .post('/api/support/tickets')
      .set('Authorization', 'Bearer ' + account.accessToken)
      .send({ subject: 'Connection issue', message: 'Cannot connect on Android' })
      .expect(201);
    await api
      .get('/api/support/admin/tickets')
      .set('Authorization', 'Bearer ' + account.accessToken)
      .expect(403);
    const other = await auth.guest();
    users.push(other.user.id);
    await api
      .get('/api/support/tickets/' + ticket.body.id)
      .set('Authorization', 'Bearer ' + other.accessToken)
      .expect(404);
    await api
      .post('/api/support/tickets/' + ticket.body.id + '/messages')
      .set('Authorization', 'Bearer ' + other.accessToken)
      .send({ message: 'Unauthorized reply' })
      .expect(404);
    const detail = await api
      .get('/api/support/tickets/' + ticket.body.id)
      .set('Authorization', 'Bearer ' + account.accessToken)
      .expect(200);
    expect(detail.body.messages[0].isStaff).toBe(false);
    await api
      .post('/api/support/tickets/' + ticket.body.id + '/messages')
      .set('Authorization', 'Bearer ' + account.accessToken)
      .send({ message: 'Forged role', isStaff: true })
      .expect(400);
  }, 30000);
});
