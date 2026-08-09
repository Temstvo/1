import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as crypto from 'crypto';

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

const FLAG_MAP: Record<string, string> = {
  DE: 'Germany', NL: 'Netherlands', GB: 'United Kingdom', FR: 'France',
  US: 'United States', CA: 'Canada', FI: 'Finland', SE: 'Sweden',
  LV: 'Latvia', EE: 'Estonia', RS: 'Serbia', JP: 'Japan',
  SG: 'Singapore', PL: 'Poland', CZ: 'Czech Republic', AT: 'Austria',
  CH: 'Switzerland', BE: 'Belgium', IE: 'Ireland', PT: 'Portugal',
  ES: 'Spain', IT: 'Italy', NO: 'Norway', DK: 'Denmark',
  RO: 'Romania', BG: 'Bulgaria', HR: 'Croatia', UA: 'Ukraine',
  KZ: 'Kazakhstan', TR: 'Turkey', IN: 'India', KR: 'South Korea',
  BR: 'Brazil', MX: 'Mexico', AU: 'Australia', NZ: 'New Zealand',
  ZA: 'South Africa', IL: 'Israel', AE: 'UAE', TH: 'Thailand',
  VN: 'Vietnam', ID: 'Indonesia', MY: 'Malaysia', PH: 'Philippines',
  TW: 'Taiwan', HK: 'Hong Kong', AR: 'Argentina', CL: 'Chile',
  CO: 'Colombia', PE: 'Peru', NG: 'Nigeria', KE: 'Kenya',
  EG: 'Egypt', MA: 'Morocco', GH: 'Ghana', PK: 'Pakistan',
  BD: 'Bangladesh', LK: 'Sri Lanka', NP: 'Nepal', MM: 'Myanmar',
  KH: 'Cambodia', LA: 'Laos', MN: 'Mongolia', GE: 'Georgia',
  AM: 'Armenia', AZ: 'Azerbaijan', MD: 'Moldova', BY: 'Belarus',
  LT: 'Lithuania', SI: 'Slovenia', SK: 'Slovakia', HU: 'Hungary',
  GR: 'Greece', CY: 'Cyprus', MT: 'Malta', LU: 'Luxembourg',
  IS: 'Iceland', GL: 'Greenland', GI: 'Gibraltar', AD: 'Andorra',
  MC: 'Monaco', LI: 'Liechtenstein', SM: 'San Marino', VA: 'Vatican',
};

const SUPPORTED_PROTOCOLS = ['vless', 'trojan', 'shadowsocks', 'ss', 'hysteria2', 'hysteria', 'vmess', 'tuic'];

@Injectable()
export class VpnConfigSyncService {
  private readonly logger = new Logger(VpnConfigSyncService.name);

  constructor(private prisma: PrismaService) {}

  async countActiveConfigs(): Promise<number> {
    return this.prisma.vpnConfig.count({ where: { isActive: true } });
  }

  async syncAll(): Promise<{ fetched: number; stored: number; errors: number; sources: number }> {
    this.logger.log('Starting VPN config sync...');
    const results = { fetched: 0, stored: 0, errors: 0, sources: 0 };
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

        const rows: any[] = [];
        for (const line of lines) {
          try {
            const config = this.parseConfigUri(line.trim(), source.listType);
            if (config) rows.push(config);
          } catch (_err) {
            results.errors++;
          }
        }

        for (const config of rows) {
          try {
            await this.prisma.vpnConfig.upsert({
              where: { id: config.id },
              update: { isActive: true, lastChecked: new Date() },
              create: config,
            });
            results.stored++;
          } catch (_err) {
            results.errors++;
          }
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

  private parseConfigUri(uri: string, listType: string) {
    const match = uri.match(/^(\w+):\/\//);
    if (!match) return null;

    const protocol = match[1].toLowerCase();
    if (!SUPPORTED_PROTOCOLS.includes(protocol)) return null;

    const hashIndex = uri.indexOf('#');
    const label = hashIndex > -1 ? decodeURIComponent(uri.substring(hashIndex + 1)) : '';
    const configUri = hashIndex > -1 ? uri.substring(0, hashIndex) : uri;

    const afterProtocol = uri.substring(match[0].length);
    const atMatch = afterProtocol.match(/@([^:]+):(\d+)/);
    const server = atMatch ? `${atMatch[1]}:${atMatch[2]}` : 'unknown';

    const country = this.extractCountry(label, uri);

    const id = crypto.createHash('md5').update(configUri).digest('hex');
    const uuid = `${id.substring(0, 8)}-${id.substring(8, 12)}-${id.substring(12, 16)}-${id.substring(16, 20)}-${id.substring(20, 32)}`;

    return {
      id: uuid,
      protocol: protocol === 'ss' ? 'shadowsocks' : protocol,
      uri,
      label,
      country: country.name,
      countryCode: country.code,
      server,
      listType,
      isActive: true,
      lastChecked: new Date(),
    };
  }

  private extractCountry(label: string, uri: string): { name: string; code: string } {
    const flagMatch = label.match(/[\u{1F1E0}-\u{1F1FF}]{2}/u);
    if (flagMatch) {
      const flag = flagMatch[0];
      const code = this.flagToCode(flag);
      if (code && FLAG_MAP[code]) {
        return { name: FLAG_MAP[code], code };
      }
    }

    for (const [code, name] of Object.entries(FLAG_MAP)) {
      if (label.toLowerCase().includes(name.toLowerCase())) {
        return { name, code };
      }
    }

    if (label.toLowerCase().includes('anycast')) {
      return { name: 'Anycast', code: 'XX' };
    }

    return { name: 'Unknown', code: 'XX' };
  }

  private flagToCode(flag: string): string | null {
    const codePoints = [...flag].map((c) => c.codePointAt(0)! - 0x1f1e6 + 65);
    return String.fromCharCode(...codePoints);
  }

  async getConfigs(filters?: { protocol?: string; country?: string; listType?: string; search?: string }) {
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
    if (!config) return null;
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
