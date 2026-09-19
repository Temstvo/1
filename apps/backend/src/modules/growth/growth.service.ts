import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class GrowthService {
  private readonly logger = new Logger(GrowthService.name);

  constructor(private prisma: PrismaService) {}

  private q(sql: string, ...params: any[]) {
    return (this.prisma as any).$queryRawUnsafe(sql, ...params);
  }

  private exec(sql: string, ...params: any[]) {
    return (this.prisma as any).$executeRawUnsafe(sql, ...params);
  }

  /** Записать реферала: invited пришёл от inviter. Возвращает true если это первый раз. */
  async recordReferral(telegramId: string, refCode: string): Promise<{ isNew: boolean }> {
    const inviter = String(refCode || '')
      .replace(/^ref_/, '')
      .trim();
    if (!inviter || inviter === String(telegramId)) return { isNew: false };
    const rows: any[] = await this.q(
      `INSERT INTO tg_referrals (inviter_id, invited_id)
       VALUES ($1, $2) ON CONFLICT (invited_id) DO NOTHING RETURNING id`,
      inviter,
      String(telegramId),
    );
    const isNew = Array.isArray(rows) && rows.length > 0;
    if (isNew) {
      // Бонус: пригласившему +7 дней, приглашённому +5 дней
      await this.extendSub(inviter, 7).catch((e) =>
        this.logger.warn(`extend inviter: ${e.message}`),
      );
      await this.extendSub(String(telegramId), 5).catch((e) =>
        this.logger.warn(`extend invited: ${e.message}`),
      );
    }
    return { isNew };
  }

  async countReferrals(telegramId: string): Promise<number> {
    const rows: any[] = await this.q(
      `SELECT COUNT(*)::int AS c FROM tg_referrals WHERE inviter_id = $1`,
      String(telegramId),
    );
    return Number(rows?.[0]?.c || 0);
  }

  /** Продлить самую свежую подписку пользователя на N дней. */
  async extendSub(telegramId: string, days: number): Promise<string | null> {
    const rows: any[] = await this.q(
      `UPDATE sub_links SET expires_at = GREATEST(expires_at, now()) + make_interval(days => $2::int),
        updated_at = now()
       WHERE id = (SELECT id FROM sub_links WHERE telegram_id = $1 ORDER BY expires_at DESC LIMIT 1)
       RETURNING expires_at`,
      String(telegramId),
      Math.max(1, Math.floor(days)),
    );
    return rows?.[0]?.expires_at ? new Date(rows[0].expires_at).toISOString() : null;
  }

  /** Выдать Premium: запись в tg_premium + продление подписки. */
  async grantPremium(
    telegramId: string,
    days: number,
    stars = 0,
    source = 'stars',
  ): Promise<{ until: string; expiresAt: string | null }> {
    const d = Math.max(1, Math.floor(days));
    const rows: any[] = await this.q(
      `INSERT INTO tg_premium (telegram_id, until, total_stars)
       VALUES ($1, GREATEST(now(), COALESCE((SELECT until FROM tg_premium WHERE telegram_id = $1), now())) + make_interval(days => $2::int), $3::int)
       ON CONFLICT (telegram_id) DO UPDATE SET
         until = GREATEST(tg_premium.until, now()) + make_interval(days => $2::int),
         total_stars = tg_premium.total_stars + $3::int,
         updated_at = now()
       RETURNING until`,
      String(telegramId),
      d,
      Math.max(0, Math.floor(stars)),
    );
    const until = rows?.[0]?.until
      ? new Date(rows[0].until).toISOString()
      : new Date().toISOString();
    const expiresAt = await this.extendSub(String(telegramId), d).catch(() => null);
    this.logger.log(`Premium granted: ${telegramId} +${d}d via ${source}`);
    return { until, expiresAt };
  }

  async stats(telegramId: string) {
    const referrals = await this.countReferrals(telegramId).catch(() => 0);
    const rows: any[] = await this.q(
      `SELECT until, total_stars FROM tg_premium WHERE telegram_id = $1`,
      String(telegramId),
    ).catch(() => []);
    const until = rows?.[0]?.until ? new Date(rows[0].until) : null;
    const isPremium = !!until && until.getTime() > Date.now();
    return {
      telegramId: String(telegramId),
      referrals,
      isPremium,
      premiumUntil: until ? until.toISOString() : null,
      totalStars: Number(rows?.[0]?.total_stars || 0),
    };
  }
}
