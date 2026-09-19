import {
  Injectable,
  ForbiddenException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { lockUser } from '../../database/lock-user';
import { MarzbanService } from './marzban.service';

@Injectable()
export class VpnService {
  private running = false;
  private logger = new Logger(VpnService.name);
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private marzban: MarzbanService,
  ) {}

  private seal(value: unknown) {
    const iv = randomBytes(12);
    const cipher = createCipheriv(
      'aes-256-gcm',
      Buffer.from(this.config.get<string>('VPN_ENCRYPTION_KEY')!, 'base64'),
      iv,
    );
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
    return [iv, cipher.getAuthTag(), encrypted].map((v) => v.toString('base64')).join('.');
  }
  private open(value: string) {
    const [iv, tag, encrypted] = value.split('.').map((v) => Buffer.from(v, 'base64'));
    const cipher = createDecipheriv(
      'aes-256-gcm',
      Buffer.from(this.config.get<string>('VPN_ENCRYPTION_KEY')!, 'base64'),
      iv,
    );
    cipher.setAuthTag(tag);
    return JSON.parse(Buffer.concat([cipher.update(encrypted), cipher.final()]).toString('utf8'));
  }
  async entitlement(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        user: { status: 'ACTIVE' },
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
      include: { plan: true },
      orderBy: { expiresAt: 'desc' },
    });
    if (!subscription) throw new ForbiddenException('Нужна действующая подписка');
    return subscription;
  }
  async getUserConfigs(userId: string) {
    await this.entitlement(userId);
    const access = await this.prisma.vpnAccess.findUnique({ where: { userId } });
    if (access?.revoked || !access?.enabled) throw new ForbiddenException('VPN-доступ отозван');
    if (
      access.status !== 'ACTIVE' ||
      access.syncedRevision !== access.revision ||
      !access.encryptedConfig ||
      access.expiresAt <= new Date()
    ) {
      throw new ServiceUnavailableException('VPN настраивается. Обновите статус через минуту');
    }
    return {
      ...this.open(access.encryptedConfig),
      expiresAt: access.expiresAt,
      protocol: 'VLESS Reality',
    };
  }
  async getStatus(userId: string) {
    const access = await this.prisma.vpnAccess.findUnique({ where: { userId } });
    if (!access) return { status: 'NOT_PROVISIONED', configured: this.marzban.configured() };
    const entitled = !!(await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
        user: { status: 'ACTIVE' },
      },
    }));
    return {
      status: access.revoked
        ? 'REVOKED'
        : !entitled || access.expiresAt <= new Date()
          ? 'EXPIRED'
          : access.status,
      expiresAt: access.expiresAt,
      lastSyncedAt: access.lastSyncedAt,
      configured: this.marzban.configured(),
    };
  }

  async syncUser(userId: string) {
    return this.prisma.$transaction(
      async (tx) => {
        await lockUser(tx, userId);
        const access = await tx.vpnAccess.findUnique({
          where: { userId },
          include: { user: { select: { status: true } } },
        });
        if (!access) return;
        const subscription = await tx.subscription.findFirst({
          where: { userId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
        });
        const enabled =
          access.enabled &&
          !access.revoked &&
          !!subscription &&
          access.expiresAt > new Date() &&
          access.user.status === 'ACTIVE';
        try {
          const result = await this.marzban.sync(access, enabled);
          await tx.vpnAccess.update({
            where: { userId },
            data: {
              enabled,
              status: enabled ? 'ACTIVE' : 'DISABLED',
              syncedRevision: access.revision,
              encryptedConfig: result ? this.seal(result) : null,
              lastError: null,
              lastSyncedAt: new Date(),
              nextAttemptAt: new Date(Date.now() + 300000),
              attempts: 0,
            },
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'VPN synchronization failed';
          await tx.vpnAccess.update({
            where: { userId },
            data: {
              status: 'ERROR',
              lastError: message.slice(0, 200),
              attempts: { increment: 1 },
              nextAttemptAt: new Date(
                Date.now() + Math.min(300, 15 * 2 ** Math.min(access.attempts, 5)) * 1000,
              ),
            },
          });
          this.logger.warn('VPN synchronization failed; retry scheduled for account ' + userId);
        }
      },
      { timeout: 60000, maxWait: 10000 },
    );
  }
  @Cron('*/15 * * * * *')
  async reconcile() {
    if (this.running) return;
    this.running = true;
    try {
      const due = await this.prisma.vpnAccess.findMany({
        where: { nextAttemptAt: { lte: new Date() } },
        select: { userId: true },
        take: 20,
        orderBy: { nextAttemptAt: 'asc' },
      });
      for (const access of due) await this.syncUser(access.userId);
    } finally {
      this.running = false;
    }
  }
}
