import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { parseConfigUri, validateSecurity, ParsedConfig } from './config-parser';

const CONFIG_SOURCES = [
  {
    url: 'https://raw.githubusercontent.com/igareck/vpn-configs-for-russia/main/BLACK_VLESS_RUS_mobile.txt',
    listType: 'black',
    name: 'Black List VLESS Mobile',
  },
  {
    url: 'https://raw.githubusercontent.com/igareck/vpn-configs-for-russia/main/BLACK_SS+All_RUS.txt',
    listType: 'black',
    name: 'Black List SS+Hysteria2+VMess+Trojan',
  },
  {
    url: 'https://raw.githubusercontent.com/igareck/vpn-configs-for-russia/main/Vless-Reality-White-Lists-Rus-Mobile.txt',
    listType: 'white',
    name: 'White List CIDR Mobile',
  },
  {
    url: 'https://raw.githubusercontent.com/igareck/vpn-configs-for-russia/main/WHITE-CIDR-RU-checked.txt',
    listType: 'white',
    name: 'White List CIDR Checked',
  },
  {
    url: 'https://raw.githubusercontent.com/igareck/vpn-configs-for-russia/main/WHITE-SNI-RU-all.txt',
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
      try {
        this.logger.log(`Fetching ${source.name}...`);
        const response = await fetch(source.url, {
          signal: AbortSignal.timeout(30000),
        });
        if (!response.ok) {
          this.logger.error(`Failed to fetch ${source.name}: ${response.status}`);
          results.errors++;
          continue;
        }

        const text = await response.text();
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

        const existing = await this.prisma.vpnConfig.findMany({
          where: { id: { in: rows.map((r) => r.id) } },
          select: { id: true },
        });
        const existingIds = new Set(existing.map((e) => e.id));

        const newRows = rows.filter((r) => !existingIds.has(r.id));
        const dupRows = rows.filter((r) => existingIds.has(r.id));

        if (newRows.length > 0) {
          const created = await this.prisma.vpnConfig.createMany({
            data: newRows.map((r) => ({
              id: r.id,
              protocol: r.protocol,
              uri: r.uri,
              label: r.label,
              country: r.country,
              countryCode: r.countryCode,
              server: r.server,
              listType: r.listType,
              isActive: true,
              lastChecked: new Date(),
            })),
            skipDuplicates: true,
          });
          results.created += created.count;
        }

        if (dupRows.length > 0) {
          const updated = await this.prisma.vpnConfig.updateMany({
            where: { id: { in: dupRows.map((r) => r.id) } },
            data: { isActive: true, lastChecked: new Date() },
          });
          results.updated += updated.count;
          results.duplicates += dupRows.length - updated.count;
        }
      } catch (error: any) {
        this.logger.error(`Error syncing ${source.name}: ${error.message}`);
        results.errors++;
      }
    }

    if (okSources === CONFIG_SOURCES.length) {
      const deactivated = await this.prisma.vpnConfig.updateMany({
        where: { isActive: true, lastChecked: { lt: syncStart } },
        data: { isActive: false },
      });
      this.logger.log(`Deactivated ${deactivated.count} configs not present in sources`);
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
