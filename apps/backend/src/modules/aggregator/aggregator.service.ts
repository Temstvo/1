import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface NormalizedNode {
  uri: string;
  host: string;
  port: number;
  protocol: string;
  country: string;
  countryCode: string;
  latency?: number;
  speed?: number;
  source: string;
}

@Injectable()
export class AggregatorService {
  private readonly logger = new Logger(AggregatorService.name);

  constructor(private prisma: PrismaService) {}

  // 1. PublicVPNList — приоритет 1 и 4 (VLESS). Требует Bearer 24h key.
  async fetchPublicVPNList(apiKey: string, limit = 50): Promise<NormalizedNode[]> {
    const url = `https://publicvpnlist.com/api/v1/servers?protocol=vless&status=online&sort=last_checked&order=desc&per_page=${Math.min(200, limit)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok)
      throw new Error(
        `PublicVPNList ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`,
      );
    const json: any = await res.json();
    const data: any[] = json.data || json.servers || [];
    const nodes: NormalizedNode[] = [];
    for (const r of data.slice(0, limit)) {
      const cfgUrl: string | null = r.config_download_url || r.config_url || null;
      let uri: string | null = null;
      if (cfgUrl) {
        try {
          const cr = await fetch(cfgUrl, {
            headers: { Authorization: `Bearer ${apiKey}` },
            signal: AbortSignal.timeout(8000),
          });
          if (cr.ok) uri = (await cr.text()).trim().split('\n')[0]?.trim() || null;
        } catch {}
      }
      // Fallback: некоторые записи отдают uri напрямую
      if (!uri) uri = r.uri || r.config || null;
      if (!uri || !uri.startsWith('vless://')) continue;
      // Быстрая проба TCP (не блокируем надолго)
      const u = this.parseVless(uri);
      if (!u) continue;
      nodes.push({
        uri,
        host: u.host,
        port: u.port,
        protocol: 'VLESS',
        country: r.country || r.country_name || this.countryFromIp(r.exit_ip) || 'Unknown',
        countryCode: (r.country_code || r.countryCode || this.ccFromIp(r.exit_ip) || 'XX')
          .toUpperCase()
          .slice(0, 2),
        latency: r.latency_ms ?? r.handshake_ms ?? undefined,
        speed: r.speed_mbps ?? undefined,
        source: 'publicvpnlist',
      });
    }
    return nodes;
  }

  // 3. morpheusadam — бандлы + каталог subs/all.txt (по твоей ссылке)
  async fetchMorpheus(limit = 50): Promise<NormalizedNode[]> {
    const urls = [
      'https://raw.githubusercontent.com/morpheusadam/v2ray-config/main/subs/bundles/best.txt',
      'https://raw.githubusercontent.com/morpheusadam/v2ray-config/main/subs/bundles/vless.txt',
      'https://raw.githubusercontent.com/morpheusadam/v2ray-config/main/subs/all.txt', // каталог подписок — парсим как ссылки
    ];
    const seen = new Set<string>();
    const nodes: NormalizedNode[] = [];
    for (const url of urls) {
      try {
        const headers: any = { 'User-Agent': 'Mozilla/5.0' };
        const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
        if (!res.ok) continue;
        const text = await res.text();
        const isCatalog = url.endsWith('/subs/all.txt');
        if (isCatalog) {
          // all.txt — список подписок, берём топ-3
          const links = text
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.startsWith('https://'))
            .slice(0, 3);
          for (const link of links) {
            try {
              const rr = await fetch(link, { headers, signal: AbortSignal.timeout(10000) });
              if (!rr.ok) continue;
              const tt = await rr.text();
              for (const line of tt.split('\n')) {
                let uri = line.trim();
                // base64 bundle?
                if (!uri.startsWith('vless://') && uri.length > 100 && !uri.includes('://')) {
                  try {
                    uri = Buffer.from(uri, 'base64').toString('utf8').trim();
                  } catch {}
                }
                if (!uri.startsWith('vless://') || seen.has(uri)) continue;
                seen.add(uri);
                const u = this.parseVless(uri);
                if (!u) continue;
                nodes.push({
                  uri,
                  host: u.host,
                  port: u.port,
                  protocol: 'VLESS',
                  country: 'Unknown',
                  countryCode: 'XX',
                  source: 'morpheusadam/catalog',
                });
                if (nodes.length >= limit) break;
              }
              if (nodes.length >= limit) break;
            } catch {}
          }
        } else {
          for (const line of text.split('\n')) {
            let uri = line.trim();
            if (!uri) continue;
            if (!uri.startsWith('vless://') && uri.length > 100 && !uri.includes('://')) {
              try {
                uri = Buffer.from(uri, 'base64').toString('utf8').trim();
              } catch {}
            }
            if (!uri.startsWith('vless://') || seen.has(uri)) continue;
            seen.add(uri);
            const u = this.parseVless(uri);
            if (!u) continue;
            nodes.push({
              uri,
              host: u.host,
              port: u.port,
              protocol: 'VLESS',
              country: 'Unknown',
              countryCode: 'XX',
              source: 'morpheusadam',
            });
            if (nodes.length >= limit) break;
          }
        }
        if (nodes.length >= limit) break;
      } catch (e: any) {
        this.logger.warn(`morpheus ${url}: ${e.message}`);
      }
    }
    return nodes.slice(0, limit);
  }

  // 2. VPN Gate — CSV OpenVPN (https://www.vpngate.net/api/iphone/)
  async fetchVPNGate(limit = 20): Promise<NormalizedNode[]> {
    const url = 'https://www.vpngate.net/api/iphone/';
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`VPNGate ${res.status}`);
    const text = await res.text();
    const lines = text.split('\n').filter((l) => l && !l.startsWith('*') && !l.startsWith('#'));
    if (lines.length < 2) return [];
    const header = lines[0].split(',');
    const idxHost = header.indexOf('IP');
    const idxScore = header.indexOf('Score');
    const idxCountry = header.indexOf('CountryShort');
    const idxConfig = header.indexOf('OpenVPN_ConfigData_Base64');
    const nodes: NormalizedNode[] = [];
    for (let i = 1; i < lines.length && nodes.length < limit; i++) {
      const cols = lines[i].split(',');
      if (cols.length < 10) continue;
      const b64 = cols[idxConfig];
      if (!b64) continue;
      const ovpn = Buffer.from(b64, 'base64').toString('utf8').slice(0, 500);
      // Храним как openvpn://IP — Happ не ест, но для агрегатора и /api достаточно
      const host = cols[idxHost] || 'unknown';
      nodes.push({
        uri: `openvpn://${host}#VPN Gate ${cols[idxCountry] || ''}`.trim(),
        host,
        port: 443,
        protocol: 'OPENVPN',
        country: cols[idxCountry] || 'Unknown',
        countryCode: (cols[idxCountry] || 'XX').toUpperCase(),
        speed: Number(cols[idxScore]) || undefined,
        source: 'vpngate',
      });
    }
    return nodes;
  }

  private parseVless(uri: string): { host: string; port: number } | null {
    try {
      const m = uri.match(/@([^:\/]+):(\d+)/);
      if (!m) return null;
      return { host: m[1], port: parseInt(m[2], 10) };
    } catch {
      return null;
    }
  }

  private countryFromIp(_ip: string | null): string | null {
    return null;
  }
  private ccFromIp(_ip: string | null): string | null {
    return null;
  }

  async upsertNodes(nodes: NormalizedNode[]): Promise<number> {
    let upserted = 0;
    for (const n of nodes) {
      const { Client } = require('pg');
      const cfg: any = {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 15000,
      };
      for (let attempt = 1; attempt <= 3; attempt++) {
        const client = new Client(cfg);
        client.on('error', () => {});
        try {
          await client.connect();
          const id = this.hashUri(n.uri);
          await client.query(
            `INSERT INTO free_vpn_configs (id, protocol, uri, label, country, country_code, server, list_type, is_active, latency)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,$9)
             ON CONFLICT (id) DO UPDATE SET is_active=true, latency=COALESCE(EXCLUDED.latency, free_vpn_configs.latency), updated_at=now()`,
            [
              id,
              n.protocol,
              n.uri,
              `${n.country} ${n.host}`.slice(0, 120),
              n.country,
              n.countryCode,
              n.host,
              n.source,
              n.latency ?? null,
            ],
          );
          await client.end().catch(() => {});
          upserted++;
          break;
        } catch (e: any) {
          await client.end().catch(() => {});
          if (attempt === 3) this.logger.warn(`upsert ${n.host}: ${e.message.slice(0, 120)}`);
          else await new Promise((r) => setTimeout(r, 800 * attempt));
        }
      }
    }
    return upserted;
  }

  private hashUri(uri: string): string {
    // uuid-совместимый id из md5, как раньше
    const crypto = require('crypto');
    const h = crypto.createHash('md5').update(uri).digest('hex');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
  }

  async runOnce(
    apiKey?: string,
  ): Promise<{ publicvpnlist: number; morpheus: number; vpngate: number }> {
    const result = { publicvpnlist: 0, morpheus: 0, vpngate: 0 };
    if (apiKey) {
      try {
        const nodes = await this.fetchPublicVPNList(apiKey, 40);
        result.publicvpnlist = await this.upsertNodes(nodes);
        this.logger.log(`PublicVPNList: ${nodes.length} fetched, ${result.publicvpnlist} upserted`);
      } catch (e: any) {
        this.logger.warn(`PublicVPNList: ${e.message}`);
      }
    }
    try {
      const nodes = await this.fetchMorpheus(40);
      result.morpheus = await this.upsertNodes(nodes);
      this.logger.log(`morpheusadam: ${result.morpheus} upserted`);
    } catch (e: any) {
      this.logger.warn(`morpheusadam: ${e.message}`);
    }
    try {
      const nodes = await this.fetchVPNGate(10);
      result.vpngate = await this.upsertNodes(nodes);
      this.logger.log(`VPNGate: ${result.vpngate} upserted`);
    } catch (e: any) {
      this.logger.warn(`VPNGate: ${e.message}`);
    }
    return result;
  }
}
