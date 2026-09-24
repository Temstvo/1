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

  private cache: { lines: string[]; at: number } | null = null;

  /** Только живые (is_active). Свежие агрегатора — в топе, быстро. Кэш 60с — Happ часто дергает подписку. */
  async getActiveConfigLines(limit = 50): Promise<string[]> {
    const now = Date.now();
    if (this.cache && now - this.cache.at < 60_000 && this.cache.lines.length === limit)
      return this.cache.lines;
    const rows: any[] = await (this.prisma as any).$queryRawUnsafe(
      `SELECT uri, country, country_code, server FROM free_vpn_configs
       WHERE is_active = true AND uri LIKE 'vless://%'
       ORDER BY updated_at DESC LIMIT $1`,
      Math.max(1, Math.min(1000, limit)),
    );
    const lines = rows
      .map((r) => {
        let uri = String(r.uri);
        if (!uri.includes('#')) {
          const flag = this.flag(r.country_code || 'XX');
          const name = r.country && r.country !== 'Unknown' ? r.country : r.server || 'VPN';
          uri = `${uri}#${encodeURIComponent(`${flag} ${name}`)}`;
        }
        return uri;
      })
      .filter(Boolean);
    this.cache = { lines, at: now };
    return lines;
  }

  private flag(code: string): string {
    if (!code || code.length !== 2) return '🌐';
    try {
      return String.fromCodePoint(
        ...[...code.toUpperCase()].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)),
      );
    } catch {
      return '🌐';
    }
  }
}
