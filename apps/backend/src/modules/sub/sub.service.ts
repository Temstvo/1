import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class SubService {
  constructor(private prisma: PrismaService) {}

  private genToken(): string {
    const raw = crypto.randomBytes(12).toString('base64url'); // 16 chars
    return `${raw.slice(0, 3)}-${raw.slice(3)}`;
  }

  private genLabel(telegramId: string): string {
    const rnd = Math.floor(100000 + Math.random() * 900000);
    return `${telegramId}__${rnd}`; // как у AllCrash: 1262369931__285252 (двойное подчёркивание)
  }

  async getOrCreate(telegramId: string) {
    const existing = await (this.prisma as any).subLink.findFirst({
      where: { telegramId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) return existing;

    const token = this.genToken();
    const label = this.genLabel(telegramId);
    const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 дня как на скрине AllCrash
    return (this.prisma as any).subLink.create({
      data: { token, telegramId, label, expiresAt, trafficUsed: BigInt(0) },
    });
  }

  async findByToken(token: string) {
    return (this.prisma as any).subLink.findUnique({ where: { token } });
  }

  async getByTelegramId(telegramId: string) {
    return (this.prisma as any).subLink.findFirst({
      where: { telegramId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Активные конфиги из free_vpn_configs для Happ-подписки (без sync-стека). Лимит 50 — ТСПУ режет >10 КБ. */
  async getActiveConfigLines(limit = 50): Promise<string[]> {
    const rows: any[] = await (this.prisma as any).$queryRawUnsafe(
      `SELECT uri FROM free_vpn_configs WHERE is_active = true AND uri IS NOT NULL AND uri <> ''
       ORDER BY latency NULLS LAST LIMIT $1`,
      Math.max(1, Math.min(1000, limit)),
    );
    return rows.map((r) => String(r.uri)).filter(Boolean);
  }
}
