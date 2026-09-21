import {
  Injectable,
  ForbiddenException,
  ConflictException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { lockUser } from '../../database/lock-user';
import { queueAccess } from '../vpn/access-state';

const TRIAL_PLAN = '00000000-0000-4000-8000-000000000001';

@Injectable()
export class TrialService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  options() {
    return {
      enabled: this.config.get('ENABLE_VPN_TRIAL') === 'true',
      hours: Number(this.config.get('TRIAL_HOURS', '24')),
      trafficGb: Number(this.config.get('TRIAL_TRAFFIC_GB', '1')),
    };
  }

  async start(userId: string) {
    const options = this.options();
    if (!options.enabled || !this.config.get('MARZBAN_URL'))
      throw new ServiceUnavailableException('Пробный VPN пока недоступен');
    return this.prisma.$transaction(async (tx) => {
      await lockUser(tx, userId);
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (
        !user ||
        user.status !== 'ACTIVE' ||
        !user.emailVerified ||
        user.email.endsWith('@guest.invalid')
      )
        throw new ForbiddenException('Сохраните аккаунт и подтвердите email для пробного VPN');
      // Historical trial rows are retained after expiry and account anonymization.
      if (await tx.subscription.findFirst({ where: { userId } }))
        throw new ConflictException('Пробный период доступен только до первой подписки');
      // One database-wide budget across processes; a session/IP limit alone is insufficient.
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(771234567)::text`;
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const issued = await tx.subscription.count({
        where: { trialEndsAt: { not: null }, createdAt: { gte: today } },
      });
      if (issued >= Number(this.config.get('TRIAL_DAILY_LIMIT', '50')))
        throw new ServiceUnavailableException('Лимит пробных подключений на сегодня исчерпан');
      const trafficLimit = BigInt(Math.floor(options.trafficGb * 1024 ** 3));
      await tx.plan.upsert({
        where: { id: TRIAL_PLAN },
        update: {},
        create: {
          id: TRIAL_PLAN,
          name: 'Пробный VPN',
          price: 0,
          currency: 'RUB',
          duration: 1,
          trafficLimit,
          deviceLimit: 1,
          protocols: ['VLESS'],
          regions: [],
          features: [],
          isActive: false,
        },
      });
      const expiresAt = new Date(Date.now() + options.hours * 3600000);
      const subscription = await tx.subscription.create({
        data: {
          userId,
          planId: TRIAL_PLAN,
          status: 'TRIAL',
          expiresAt,
          trialEndsAt: expiresAt,
          autoRenew: false,
        },
      });
      await queueAccess(tx, userId, expiresAt, trafficLimit);
      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: 'TRIAL_STARTED',
          resource: 'SUBSCRIPTION',
          resourceId: subscription.id,
          result: 'success',
        },
      });
      return subscription;
    });
  }
}
