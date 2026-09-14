import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { parseConfigUri, validateSecurity, ParsedConfig } from './config-parser';

const GITHUB_RAW = 'https://raw.githubusercontent.com/igareck/vpn-configs-for-russia/main';
const GITLAB_RAW = 'https://gitlab.com/igareck/vpn-configs-for-russia/-/raw/main';
const CODEBERG_RAW = 'https://codeberg.org/igareck/vpn-configs-for-russia/raw/branch/main';
const GITHACK_RAW = 'https://raw.githack.com/igareck/vpn-configs-for-russia/main';

const RJSXRD_RAW =
  'https://raw.githubusercontent.com/whoahaow/rjsxrd/main/githubmirror/split-by-protocols';

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
  {
    url: `${RJSXRD_RAW}/vless-secure.txt`,
    mirrors: [`${RJSXRD_RAW}/vless.txt`],
    listType: 'black',
    name: 'RJSXRD VLESS Secure',
  },
  {
    url: `${RJSXRD_RAW}/hysteria2-secure.txt`,
    mirrors: [
      `${RJSXRD_RAW}/hysteria2.txt`,
      `${RJSXRD_RAW}/hy2-secure.txt`,
      `${RJSXRD_RAW}/hy2.txt`,
    ],
    listType: 'black',
    name: 'RJSXRD Hysteria2 Secure',
  },
  {
    url: `${RJSXRD_RAW}/trojan-secure.txt`,
    mirrors: [`${RJSXRD_RAW}/trojan.txt`],
    listType: 'black',
    name: 'RJSXRD Trojan Secure',
  },
  {
    url: `${RJSXRD_RAW}/ss-secure.txt`,
    mirrors: [`${RJSXRD_RAW}/ss.txt`],
    listType: 'black',
    name: 'RJSXRD Shadowsocks Secure',
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
      query_timeout: 60000,
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

  async getActiveSubscription() {
    const configs = await this.prisma.vpnConfig.findMany({
      where: { isActive: true },
      orderBy: { country: 'asc' },
      select: {
        id: true,
        protocol: true,
        uri: true,
        label: true,
        country: true,
        countryCode: true,
        server: true,
      },
    });
    return configs.map((c) => ({
      id: c.id,
      protocol: c.protocol,
      uri: c.uri,
      label: c.label,
      country: c.country,
      countryCode: c.countryCode,
      server: c.server,
    }));
  }

  /**
   * Готовая выдача для Happ: проверенные (с latency) серверы первыми,
   * лимит количества, имена в стиле «⚡ Страна» / «⚡ Страна 2».
   */
  async getSubscriptionLines(limit = 250): Promise<string[]> {
    const take = Math.min(Math.max(limit, 20), 500);
    const configs = await this.prisma.vpnConfig.findMany({
      where: { isActive: true },
      orderBy: [{ lastChecked: 'desc' }],
      take: take * 2,
      select: {
        protocol: true,
        uri: true,
        label: true,
        country: true,
        countryCode: true,
        server: true,
        latency: true,
      },
    });

    const RU: Record<string, string> = {
      'United Kingdom': 'Великобритания',
      Germany: 'Германия',
      France: 'Франция',
      Netherlands: 'Нидерланды',
      'United States': 'США',
      Canada: 'Канада',
      Sweden: 'Швеция',
      Finland: 'Финляндия',
      Poland: 'Польша',
      Italy: 'Италия',
      Spain: 'Испания',
      Turkey: 'Турция',
      Singapore: 'Сингапур',
      Japan: 'Япония',
      'South Korea': 'Корея',
      Thailand: 'Таиланд',
      Seychelles: 'Сейшелы',
      Anycast: 'Anycast',
      Unknown: 'VPN',
    };

    // Живые (есть latency от health-check) — первыми, дальше по скорости
    const sorted = [...configs].sort((a, b) => {
      if (a.latency == null && b.latency == null) return 0;
      if (a.latency == null) return 1;
      if (b.latency == null) return -1;
      return a.latency - b.latency;
    });

    const counters = new Map<string, number>();
    const lines: string[] = [];
    const flagFromLabel = (label?: string | null): string | null => {
      if (!label) return null;
      const m = label.match(/[\u{1F1E6}-\u{1F1FF}]{2}/u);
      return m ? m[0] : null;
    };
    const flagFromCode = (code?: string | null): string | null => {
      if (!code || code.length !== 2) return null;
      const cc = code.toUpperCase();
      if (cc === 'XX' || !/^[A-Z]{2}$/.test(cc)) return null;
      return String.fromCodePoint(...[...cc].map((ch) => 0x1f1e6 - 65 + ch.charCodeAt(0)));
    };
    for (const c of sorted) {
      if (!c.uri || lines.length >= take) break;
      const base = c.uri.split('#')[0];
      // Флаг: из сохранённой метки, иначе из countryCode — Happ рисует флаг из эмодзи в названии
      const flag = flagFromLabel(c.label) ?? flagFromCode(c.countryCode);
      // Если в БД уже лежит красивая метка вида «⚡ Великобрит...» — берём её как есть (сохраняем твой русский)
      if (c.label && c.label.trim().startsWith('⚡')) {
        const clean = c.label.trim();
        const existing = flagFromLabel(clean) ?? flagFromCode(c.countryCode);
        const withFlag = existing && !clean.includes(existing) ? `${existing} ${clean}` : clean;
        lines.push(`${base}#${encodeURIComponent(withFlag)}`);
        continue;
      }
      const rawPlace = (c.country || c.server || c.protocol || 'VPN').trim();
      const place = RU[rawPlace] ?? rawPlace;
      const n = (counters.get(place) ?? 0) + 1;
      counters.set(place, n);
      const core = n === 1 ? `⚡ ${place}` : `⚡ ${place} ${n}`;
      const name = flag ? `${flag} ${core}` : core;
      lines.push(`${base}#${encodeURIComponent(name)}`);
    }
    return lines;
  }

  /** Синк из локальных JSON на рабочем столе — твои 31 файл из serv configs, которым ты доверяешь */
  async syncFromLocal(): Promise<SyncResults> {
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
    const candidates = [
      path.resolve(process.cwd(), '..', '..', 'serv-configs'),
      path.resolve(process.cwd(), 'serv-configs'),
      path.resolve(__dirname, '../../../serv-configs'),
      path.resolve(__dirname, '../../../../serv-configs'),
      'C:\\Users\\Артём\\Desktop\\serv configs',
    ];
    let dir: string | null = null;
    for (const p of candidates) {
      try {
        if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
          dir = p;
          break;
        }
      } catch {}
    }
    if (!dir) {
      this.logger.error(`syncFromLocal: serv-configs not found tried ${candidates.join(', ')}`);
      return results;
    }
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.json') && fs.statSync(path.join(dir, f)).isFile());
    // also check subfolder sickok
    const sub = path.join(dir, 'sickok');
    if (fs.existsSync(sub)) {
      for (const f of fs.readdirSync(sub).filter((f) => f.endsWith('.json')))
        files.push(path.join('sickok', f));
    }
    this.logger.log(`syncFromLocal: ${files.length} files in ${dir}`);
    const buildId = (uri: string) => {
      const h = crypto.createHash('md5').update(uri).digest('hex');
      return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
    };
    const extractCountry = (remark: string) => {
      const map: Record<string, string> = {
        '\uD83C\uDDEC\uD83C\uDDE7': 'GB',
        '\uD83C\uDDF3\uD83C\uDDF1': 'NL',
        '\uD83C\uDDED\uD83C\uDDF0': 'HK',
        '\uD83C\uDDF7\uD83C\uDDFA': 'RU',
        '\uD83C\uDDF8\uD83C\uDDEA': 'SE',
        '\uD83C\uDDEB\uD83C\uDDEE': 'FI',
        '\uD83C\uDDF1\uD83C\uDDF9': 'LT',
        '\uD83C\uDDFA\uD83C\uDDF8': 'US',
        '\uD83C\uDDF3\uD83C\uDDF4': 'NO',
        '\uD83C\uDDEB\uD83C\uDDF7': 'FR',
        '\uD83C\uDDE9\uD83C\uDDEA': 'DE',
        '\uD83C\uDDF5\uD83C\uDDF1': 'PL',
      };
      for (const [flag, code] of Object.entries(map))
        if (remark.includes(flag)) {
          const name = remark
            .replace(flag, '')
            .replace(/[\uFE0F\u200D]/g, '')
            .split(/[—#^~]/)[0]
            .trim()
            .split('  ')[0]
            .trim();
          return { code, name: name || remark.slice(0, 30) };
        }
      return {
        code: 'XX',
        name:
          remark
            .replace(/\p{Emoji}/gu, '')
            .trim()
            .slice(0, 30) || 'VPN',
      };
    };
    const toUri = (o: any, remark: string, idx: number) => {
      if (o.protocol !== 'vless') return null;
      const v = o.settings?.vnext?.[0];
      if (!v) return null;
      const host = v.address,
        port = v.port,
        uuid = v.users?.[0]?.id,
        flow = v.users?.[0]?.flow || '',
        enc = v.users?.[0]?.encryption || 'none';
      const ss = o.streamSettings || {};
      const net = ss.network || 'tcp',
        sec = ss.security || 'none';
      const params = new URLSearchParams();
      params.set('encryption', enc);
      if (flow) params.set('flow', flow);
      params.set('security', sec);
      params.set('type', net);
      if (sec === 'tls') {
        const t = ss.tlsSettings || {};
        if (t.serverName) params.set('sni', t.serverName);
        if (t.fingerprint) params.set('fp', t.fingerprint);
        if (t.alpn) params.set('alpn', Array.isArray(t.alpn) ? t.alpn.join(',') : t.alpn);
      } else if (sec === 'reality') {
        const r = ss.realitySettings || {};
        if (r.serverName) params.set('sni', r.serverName);
        if (r.fingerprint) params.set('fp', r.fingerprint);
        if (r.publicKey) params.set('pbk', r.publicKey);
        if (r.shortId) params.set('sid', r.shortId);
        if (r.spiderX) params.set('spx', r.spiderX);
      }
      if (net === 'grpc') {
        const g = ss.grpcSettings || {};
        if (g.serviceName) params.set('serviceName', g.serviceName);
        if (g.authority) params.set('authority', g.authority);
      } else if (net === 'xhttp') {
        const x = ss.xhttpSettings || {};
        if (x.path) params.set('path', x.path);
        if (x.host !== undefined) params.set('host', x.host);
        if (x.mode) params.set('mode', x.mode);
      } else if (net === 'ws') {
        const w = ss.wsSettings || {};
        if (w.path) params.set('path', w.path);
        if (w.headers?.Host) params.set('host', w.headers.Host);
      }
      const base = `vless://${uuid}@${host}:${port}?${params.toString()}`;
      const clean = remark.replace(/[\uFE0F\u200D]/g, '').trim();
      const name = idx === 0 ? clean : `${clean} ${idx + 1}`;
      return { uri: `${base}#${encodeURIComponent(name)}`, host, port };
    };
    const allRows: any[] = [];
    const seen = new Set<string>();
    for (const file of files) {
      const full = path.join(dir, file);
      let j: any;
      try {
        j = JSON.parse(fs.readFileSync(full, 'utf8'));
      } catch (e: any) {
        this.logger.warn(`skip ${file}: ${e.message}`);
        results.errors++;
        continue;
      }
      const remark = j.remarks || file;
      const outs = (j.outbounds || []).filter((o: any) => o.protocol === 'vless');
      results.fetched += outs.length;
      results.sources++;
      for (let i = 0; i < outs.length; i++) {
        const res = toUri(outs[i], remark, i);
        if (!res) {
          results.rejected++;
          continue;
        }
        const cfgUri = res.uri.split('#')[0];
        const id = buildId(cfgUri);
        if (seen.has(id)) {
          results.duplicates++;
          continue;
        }
        seen.add(id);
        const c = extractCountry(remark);
        const label = decodeURIComponent(res.uri.split('#')[1] || '');
        allRows.push([id, 'vless', res.uri, label, c.name, c.code, res.host + ':' + res.port]);
        results.parsed++;
      }
    }
    for (let i = 0; i < allRows.length; i += 10) {
      const chunk = allRows.slice(i, i + 10);
      if (i > 0) await new Promise((r) => setTimeout(r, 200));
      const db = { client: this.createDbClient() };
      await db.client.connect();
      try {
        for (const row of chunk) {
          const [id, proto, uri, label, country, code, server] = row;
          await this.runQuery(
            db,
            'INSERT INTO free_vpn_configs (id, protocol, uri, label, country, country_code, server, list_type, is_active, last_checked, created_at, updated_at, latency) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,now(),now(),now(),5) ON CONFLICT (id) DO UPDATE SET uri=EXCLUDED.uri, label=EXCLUDED.label, country=EXCLUDED.country, country_code=EXCLUDED.country_code, server=EXCLUDED.server, is_active=true, last_checked=now(), latency=5',
            [id, proto, uri, label, country, code, server, 'desktop'],
          );
          results.created++;
        }
      } finally {
        try {
          await db.client.end();
        } catch {}
      }
    }
    this.logger.log(`syncFromLocal done: ${JSON.stringify(results)}`);
    return results;
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
