import * as crypto from 'crypto';

export const SUPPORTED_PROTOCOLS = [
  'vless',
  'trojan',
  'shadowsocks',
  'ss',
  'hysteria2',
  'hysteria',
  'vmess',
  'tuic',
];

export const FLAG_MAP: Record<string, string> = {
  DE: 'Germany',
  NL: 'Netherlands',
  GB: 'United Kingdom',
  FR: 'France',
  US: 'United States',
  CA: 'Canada',
  FI: 'Finland',
  SE: 'Sweden',
  LV: 'Latvia',
  EE: 'Estonia',
  RS: 'Serbia',
  JP: 'Japan',
  SG: 'Singapore',
  PL: 'Poland',
  CZ: 'Czech Republic',
  AT: 'Austria',
  CH: 'Switzerland',
  BE: 'Belgium',
  IE: 'Ireland',
  PT: 'Portugal',
  ES: 'Spain',
  IT: 'Italy',
  NO: 'Norway',
  DK: 'Denmark',
  RO: 'Romania',
  BG: 'Bulgaria',
  HR: 'Croatia',
  UA: 'Ukraine',
  KZ: 'Kazakhstan',
  TR: 'Turkey',
  IN: 'India',
  KR: 'South Korea',
  BR: 'Brazil',
  MX: 'Mexico',
  AU: 'Australia',
  NZ: 'New Zealand',
  ZA: 'South Africa',
  IL: 'Israel',
  AE: 'UAE',
  TH: 'Thailand',
  VN: 'Vietnam',
  ID: 'Indonesia',
  MY: 'Malaysia',
  PH: 'Philippines',
  TW: 'Taiwan',
  HK: 'Hong Kong',
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  PE: 'Peru',
  NG: 'Nigeria',
  KE: 'Kenya',
  EG: 'Egypt',
  MA: 'Morocco',
  GH: 'Ghana',
  PK: 'Pakistan',
  BD: 'Bangladesh',
  LK: 'Sri Lanka',
  NP: 'Nepal',
  MM: 'Myanmar',
  KH: 'Cambodia',
  LA: 'Laos',
  MN: 'Mongolia',
  GE: 'Georgia',
  AM: 'Armenia',
  AZ: 'Azerbaijan',
  MD: 'Moldova',
  BY: 'Belarus',
  LT: 'Lithuania',
  SI: 'Slovenia',
  SK: 'Slovakia',
  HU: 'Hungary',
  GR: 'Greece',
  CY: 'Cyprus',
  MT: 'Malta',
  LU: 'Luxembourg',
  IS: 'Iceland',
  GL: 'Greenland',
  GI: 'Gibraltar',
  AD: 'Andorra',
  MC: 'Monaco',
  LI: 'Liechtenstein',
  SM: 'San Marino',
  VA: 'Vatican',
};

export interface ParsedConfig {
  id: string;
  protocol: string;
  uri: string;
  label: string;
  country: string;
  countryCode: string;
  server: string;
  host: string;
  port: number;
  listType: string;
  isActive: boolean;
  lastChecked: Date;
}

export interface SecurityVerdict {
  ok: boolean;
  reason: string | null;
}

export function buildConfigId(uri: string): string {
  const id = crypto.createHash('md5').update(uri).digest('hex');
  return `${id.substring(0, 8)}-${id.substring(8, 12)}-${id.substring(12, 16)}-${id.substring(16, 20)}-${id.substring(20, 32)}`;
}

export function splitServer(server: string): { host: string; port: number } {
  const idx = server.lastIndexOf(':');
  if (idx <= 0) return { host: server.trim().toLowerCase(), port: 443 };
  const host = server.substring(0, idx).trim().toLowerCase();
  const port = parseInt(server.substring(idx + 1), 10);
  return { host, port: Number.isFinite(port) && port > 0 ? port : 443 };
}

export function isPrivateHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === 'localhost' || h === '::1' || h === '0.0.0.0' || h.endsWith('.local')) return true;

  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4) return false;

  const [a, b] = ipv4.slice(1).map(Number);
  if (a > 255 || b > 255) return true;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

export function extractCountry(label: string, uri: string): { name: string; code: string } {
  const flagMatch = label.match(/[\u{1F1E0}-\u{1F1FF}]{2}/u);
  if (flagMatch) {
    const code = flagToCode(flagMatch[0]);
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

export function flagToCode(flag: string): string | null {
  const codePoints = [...flag].map((c) => c.codePointAt(0)! - 0x1f1e6 + 65);
  return String.fromCharCode(...codePoints);
}

export function parseConfigUri(uri: string, listType: string): ParsedConfig | null {
  const trimmed = uri.trim();
  const match = trimmed.match(/^(\w+):\/\//);
  if (!match) return null;

  const protocol = match[1].toLowerCase();
  if (!SUPPORTED_PROTOCOLS.includes(protocol)) return null;

  const hashIndex = trimmed.indexOf('#');
  const label = hashIndex > -1 ? decodeURIComponent(trimmed.substring(hashIndex + 1)).trim() : '';
  const configUri = hashIndex > -1 ? trimmed.substring(0, hashIndex) : trimmed;

  const afterProtocol = trimmed.substring(match[0].length);
  const atMatch = afterProtocol.match(/@([^:]+):(\d+)/);
  const server = atMatch ? `${atMatch[1]}:${atMatch[2]}` : 'unknown';

  const { host, port } = splitServer(server);
  const country = extractCountry(label, trimmed);

  return {
    id: buildConfigId(configUri),
    protocol: protocol === 'ss' ? 'shadowsocks' : protocol,
    uri: trimmed,
    label,
    country: country.name,
    countryCode: country.code,
    server,
    host,
    port,
    listType,
    isActive: true,
    lastChecked: new Date(),
  };
}

export function validateSecurity(cfg: ParsedConfig): SecurityVerdict {
  if (!cfg.host || cfg.host === 'unknown') {
    return { ok: false, reason: 'no endpoint' };
  }
  if (isPrivateHost(cfg.host)) {
    return { ok: false, reason: 'private host' };
  }
  if (/[\s\u0000-\u001f\u007f]/.test(cfg.host)) {
    return { ok: false, reason: 'invalid hostname' };
  }
  if (cfg.port < 1 || cfg.port > 65535) {
    return { ok: false, reason: 'invalid port' };
  }
  if (cfg.uri.length > 2000) {
    return { ok: false, reason: 'uri too long' };
  }
  if (/[\u0000-\u001f\u007f]/.test(cfg.uri)) {
    return { ok: false, reason: 'control characters' };
  }
  return { ok: true, reason: null };
}
