import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Client } from 'pg';
import { PrismaService } from '../../database/prisma.service';
import { parseConfigUri, validateSecurity, ParsedConfig } from './config-parser';

const GITHUB_RAW = 'https://raw.githubusercontent.com/igareck/vpn-configs-for-russia/main';
const GITLAB_RAW = 'https://gitlab.com/igareck/vpn-configs-for-russia/-/raw/main';
const CODEBERG_RAW = 'https://codeberg.org/igareck/vpn-configs-for-russia/raw/branch/main';
const GITHACK_RAW = 'https://raw.githack.com/igareck/vpn-configs-for-russia/main';

const CHUNK_INSERT = 10;
const CHUNK_UPDATE = 100;
const CHUNK_DELETE = 50;

const CONFIG_SOURCES = [
  {
    url: `${GITHUB_RAW}/BLACK_VLESS_RUS_mobile.txt`,
    mirrors: [
      `${GITLAB_RAW}/BLACK_VLESS_RUS_mobile.txt`,
      `${CODEBERG_RAW}/BLACK_VLESS_RUS_mobile.txt`,
      `${GITHACK_RAW}/BLACK_VLESS_RUS_mobile.txt`,
    ],
    listType: 'black',
    name: 'Black List VLESS Mobile',
  },
  {
    url: `${GITHUB_RAW}/BLACK_SS+All_RUS.txt`,
    mirrors: [
      `${GITLAB_RAW}/BLACK_SS%2BAll_RUS.txt`,
      `${CODEBERG_RAW}/BLACK_SS%2BAll_RUS.txt`,
      `${GITHACK_RAW}/BLACK_SS%2BAll_RUS.txt`,
    ],
    listType: 'black',
    name: 'Black List SS+Hysteria2+VMess+Trojan',
  },
  {
    url: `${GITHUB_RAW}/BLACK_VLESS_RUS.txt`,
    mirrors: [
      `${GITLAB_RAW}/BLACK_VLESS_RUS.txt`,
      `${CODEBERG_RAW}/BLACK_VLESS_RUS.txt`,
      `${GITHACK_RAW}/BLACK_VLESS_RUS.txt`,
    ],
    listType: 'black',
    name: 'Black List VLESS Full',
  },
  {
    url: `${GITHUB_RAW}/Vless-Reality-White-Lists-Rus-Mobile.txt`,
    mirrors: [
      `${GITLAB_RAW}/Vless-Reality-White-Lists-Rus-Mobile.txt`,
      `${CODEBERG_RAW}/Vless-Reality-White-Lists-Rus-Mobile.txt`,
      `${GITHACK_RAW}/Vless-Reality-White-Lists-Rus-Mobile.txt`,
    ],
    listType: 'white',
    name: 'White List CIDR Mobile',
  },
  {
    url: `${GITHUB_RAW}/WHITE-CIDR-RU-checked.txt`,
    mirrors: [
      `${GITLAB_RAW}/WHITE-CIDR-RU-checked.txt`,
      `${CODEBERG_RAW}/WHITE-CIDR-RU-checked.txt`,
      `${GITHACK_RAW}/WHITE-CIDR-RU-checked.txt`,
    ],
    listType: 'white',
    name: 'White List CIDR Checked',
  },
  {
    url: `${GITHUB_RAW}/WHITE-CIDR-RU-all.txt`,
    mirrors: [
      `${GITLAB_RAW}/WHITE-CIDR-RU-all.txt`,
      `${CODEBERG_RAW}/WHITE-CIDR-RU-all.txt`,
      `${GITHACK_RAW}/WHITE-CIDR-RU-all.txt`,
    ],
    listType: 'white',
    name: 'White List CIDR Full',
  },
  {
    url: `${GITHUB_RAW}/WHITE-SNI-RU-all.txt`,
    mirrors: [
      `${GITLAB_RAW}/WHITE-SNI-RU-all.txt`,
      `${CODEBERG_RAW}/WHITE-SNI-RU-all.txt`,
      `${GITHACK_RAW}/WHITE-SNI-RU-all.txt`,
    ],
    listType: 'white',
    name: 'White List SNI',
  },
];

export interface SyncResults {
  fetched: number;
  parsed: number;
  rejected: number;
  created: number;
  updated: number;
  duplicates: number;
  errors: number;
  sources: number;
}

@Injectable()
export class VpnConfigSyncService {
  private readonly logger = new Logger(VpnConfigSyncService.name);

  constructor(private prisma: PrismaService) {}

  private createDbClient(): Client {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
      query_timeout: 30000,
    });
    client.on('error', () => {});
    return client;
  }

  private async runQuery(holder: { client: Client }, text: string, params?: any[]): Promise<any> {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await holder.client.query(text, params);
      } catch (error: any) {
        if (attempt >= 3) throw error;
        this.logger.warn(
          `DB query failed (${error.message.slice(0, 80)}), reconnecting (attempt ${attempt + 1})...`,
        );
        try {
          await holder.client.end();
        } catch {}
        await new Promise((r) => setTimeout(r, 3000));
        const fresh = this.createDbClient();
        await fresh.connect();
        holder.client = fresh;
      }
    }
    throw new Error('DB query failed after retries');
  }

  async countActiveConfigs(): Promise<number> {
    return this.prisma.vpnConfig.count({ where: { isActive: true } });
  }

  async syncAll(): Promise<SyncResults> {
    this.logger.log('Starting VPN config sync...');
    const results: SyncResults = {
      fetched: 0,
      parsed: 0,
      rejected: 0,
      created: 0,
      updated: 0,
      duplicates: 0,
      errors: 0,
      sources: 0,
    };
    const syncStart = new Date();
    let okSources = 0;

    for (const source of CONFIG_SOURCES) {
      const db = { client: this.createDbClient() };
      try {
        await db.client.connect();
        const urls = [source.url, ...(source.mirrors ?? [])];
        let text: string | null = null;
        for (const url of urls) {
          try {
            this.logger.log(`Fetching ${source.name}... (${url})`);
            const response = await fetch(url, {
              signal: AbortSignal.timeout(30000),
            });
            if (!response.ok) {
              this.logger.warn(`Failed to fetch ${url}: ${response.status} — trying next`);
              continue;
            }
            text = await response.text();
            break;
          } catch (error: any) {
            this.logger.warn(`Fetch error for ${url}: ${error.message} — trying next`);
          }
        }

        if (text === null) {
          this.logger.error(`All mirrors failed for ${source.name}`);
          results.errors++;
          continue;
        }

        const lines = text.split('\n').filter((l) => l.trim() && !l.startsWith('#'));
        results.fetched += lines.length;
        results.sources++;
        okSources++;
        this.logger.log(`${source.name}: ${lines.length} configs found`);

        const rows: ParsedConfig[] = [];
        for (const line of lines) {
          const config = parseConfigUri(line.trim(), source.listType);
          if (!config) {
            results.errors++;
            continue;
          }
          const verdict = validateSecurity(config);
          if (!verdict.ok) {
            results.rejected++;
            this.logger.debug(`Rejected config (${verdict.reason}): ${config.host}`);
            continue;
          }
          rows.push(config);
        }

        results.parsed += rows.length;

        if (rows.length === 0) continue;

        for (let i = 0; i < rows.length; i += CHUNK_INSERT) {
          const chunk = rows.slice(i, i + CHUNK_INSERT);
          if (i > 0) await new Promise((r) => setTimeout(r, 1000));

          const values = chunk
            .map(
              (r, idx) =>
                `($${idx * 8 + 1}, $${idx * 8 + 2}, $${idx * 8 + 3}, $${idx * 8 + 4}, $${idx * 8 + 5}, $${idx * 8 + 6}, $${idx * 8 + 7}, $${idx * 8 + 8}, true, now(), now(), now())`,
            )
            .join(',');
          const params: any[] = [];
          for (const r of chunk) {
            params.push(
              r.id,
              r.protocol,
              r.uri,
              r.label,
              r.country,
              r.countryCode,
              r.server,
              r.listType,
            );
          }

          const created = await this.runQuery(
            db,
            `INSERT INTO free_vpn_configs (id, protocol, uri, label, country, country_code, server, list_type, is_active, last_checked, created_at, updated_at)
             VALUES ${values} ON CONFLICT (id) DO NOTHING`,
            params,
          );
          results.created += created.rowCount ?? 0;

          const updated = await this.runQuery(
            db,
            'UPDATE free_vpn_configs SET is_active = true, last_checked = now() WHERE id = ANY($1)',
            [chunk.map((r) => r.id)],
          );
          results.updated += updated.rowCount ?? 0;
          results.duplicates += Math.max(
            0,
            chunk.length - (created.rowCount ?? 0) - (updated.rowCount ?? 0),
          );
        }
      } catch (error: any) {
        this.logger.error(`Error syncing ${source.name}: ${error.message}`);
        results.errors++;
      } finally {
        try {
          await db.client.end();
        } catch {}
      }
      await new Promise((r) => setTimeout(r, 2000));
    }

    if (okSources === CONFIG_SOURCES.length) {
      const db = { client: this.createDbClient() };
      await db.client.connect();
      try {
        const deactivated = await this.runQuery(
          db,
          'UPDATE free_vpn_configs SET is_active = false WHERE is_active = true AND last_checked < $1',
          [syncStart],
        );
        this.logger.log(`Deactivated ${deactivated.rowCount ?? 0} configs not present in sources`);

        let cleanedTotal = 0;
        for (let i = 0; i < 20; i++) {
          const cleaned = await this.runQuery(
            db,
            'DELETE FROM free_vpn_configs WHERE ctid IN (SELECT ctid FROM free_vpn_configs WHERE is_active = false AND last_checked < $1 LIMIT 500)',
            [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)],
          );
          cleanedTotal += cleaned.rowCount ?? 0;
          if ((cleaned.rowCount ?? 0) < 500) break;
          await new Promise((r) => setTimeout(r, 1000));
        }
        if (cleanedTotal > 0) this.logger.log(`Cleaned up ${cleanedTotal} stale inactive configs`);
      } finally {
        try {
          await db.client.end();
        } catch {}
      }
    } else if (okSources > 0) {
      this.logger.warn(
        `Sync partially failed (${okSources}/${CONFIG_SOURCES.length} sources OK) — skipping deactivation to avoid losing configs from failed sources`,
      );
    } else {
      this.logger.error('All sources failed — skipping deactivation');
    }

    this.logger.log(`Sync complete: ${JSON.stringify(results)}`);
    return results;
  }

  async getConfigs(filters?: {
    protocol?: string;
    country?: string;
    listType?: string;
    search?: string;
  }) {
    const where: any = { isActive: true };

    if (filters?.protocol) where.protocol = filters.protocol;
    if (filters?.country) where.country = filters.country;
    if (filters?.listType) where.listType = filters.listType;
    if (filters?.search) {
      where.OR = [
        { label: { contains: filters.search, mode: 'insensitive' } },
        { country: { contains: filters.search, mode: 'insensitive' } },
        { server: { contains: filters.search } },
      ];
    }

    return this.prisma.vpnConfig.findMany({
      where,
      orderBy: [{ country: 'asc' }, { protocol: 'asc' }],
      select: {
        id: true,
        protocol: true,
        label: true,
        country: true,
        countryCode: true,
        server: true,
        listType: true,
        latency: true,
        lastChecked: true,
      },
    });
  }

  async getConfigById(id: string) {
    const config = await this.prisma.vpnConfig.findUnique({ where: { id } });
    if (!config) throw new NotFoundException('Конфиг не найден');
    return {
      id: config.id,
      protocol: config.protocol,
      uri: config.uri,
      label: config.label,
      country: config.country,
      countryCode: config.countryCode,
      server: config.server,
      listType: config.listType,
    };
  }

  async getStats() {
    const total = await this.prisma.vpnConfig.count({ where: { isActive: true } });
    const byProtocol = await this.prisma.vpnConfig.groupBy({
      by: ['protocol'],
      where: { isActive: true },
      _count: { id: true },
    });
    const byCountry = await this.prisma.vpnConfig.groupBy({
      by: ['country'],
      where: { isActive: true },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 20,
    });

    return {
      total,
      byProtocol: byProtocol.map((p) => ({ protocol: p.protocol, count: p._count.id })),
      byCountry: byCountry.map((c) => ({ country: c.country, count: c._count.id })),
    };
  }
}
