import { createHash } from 'crypto';
import { readdir, readFile, stat } from 'fs/promises';
import { join, relative } from 'path';
import { extractCountry, FLAG_MAP } from './config-parser';

export interface ProfileSummary {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  protocol: string;
  transports: string[];
  security: string[];
  nodeCount: number;
  format: 'xray-json';
}
export interface ImportedProfile {
  summary: ProfileSummary;
  document: Record<string, any>;
}
function canonical(value: any): string {
  return JSON.stringify(value, (_key, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(
          Object.keys(v)
            .sort()
            .map((k) => [k, v[k]]),
        )
      : v,
  );
}
function flatProfile(input: any) {
  const stream: any = { network: input.type || 'tcp', security: input.security };
  if (stream.security === 'tls')
    stream.tlsSettings = {
      serverName: input.sni || input.host,
      fingerprint: input.fingerprint || 'chrome',
      allowInsecure: false,
      ...(input.alpn
        ? { alpn: Array.isArray(input.alpn) ? input.alpn : String(input.alpn).split(',') }
        : {}),
    };
  else if (stream.security === 'reality')
    stream.realitySettings = {
      serverName: input.sni,
      publicKey: input.publicKey,
      shortId: input.shortId || '',
      fingerprint: input.fingerprint || 'chrome',
    };
  if (stream.network === 'xhttp')
    stream.xhttpSettings = {
      path: input.path || '/',
      mode: input.mode || 'auto',
      ...(input.httpHost ? { host: input.httpHost } : {}),
    };
  if (stream.network === 'grpc') stream.grpcSettings = { serviceName: input.serviceName || '' };
  if (stream.network === 'ws')
    stream.wsSettings = {
      path: input.path || '/',
      ...(input.httpHost ? { headers: { Host: input.httpHost } } : {}),
    };
  return {
    remarks: input.name,
    log: { loglevel: 'warning' },
    inbounds: [
      {
        tag: 'socks',
        listen: '127.0.0.1',
        port: 10808,
        protocol: 'socks',
        settings: { udp: true },
      },
    ],
    outbounds: [
      {
        tag: 'proxy',
        protocol: 'vless',
        settings: {
          vnext: [
            {
              address: input.host,
              port: Number(input.port || 443),
              users: [
                { id: input.uuid, encryption: 'none', ...(input.flow ? { flow: input.flow } : {}) },
              ],
            },
          ],
        },
        streamSettings: stream,
      },
      { tag: 'direct', protocol: 'freedom' },
      { tag: 'block', protocol: 'blackhole' },
    ],
  };
}
function fromUri(input: any) {
  const u = new URL(input.uri);
  if (u.protocol !== 'vless:') throw new Error('Unsupported URI');
  const q = u.searchParams;
  return flatProfile({
    name: input.name,
    host: u.hostname.replace(/^\[|\]$/g, ''),
    port: u.port || 443,
    uuid: decodeURIComponent(u.username),
    type: q.get('type') || 'tcp',
    security: q.get('security'),
    sni: q.get('sni'),
    fingerprint: q.get('fp'),
    alpn: q.get('alpn'),
    path: q.get('path'),
    httpHost: q.get('host'),
    mode: q.get('mode'),
    flow: q.get('flow'),
    serviceName: q.get('serviceName'),
    publicKey: q.get('pbk'),
    shortId: q.get('sid'),
  });
}
export function parseImportedDocument(input: any, sourceName: string): ImportedProfile[] {
  if (!input || typeof input !== 'object') throw new Error('Invalid JSON document');
  if (Array.isArray(input.servers))
    return input.servers.flatMap((entry: any) =>
      parseImportedDocument(
        {
          ...fromUri(entry),
          country: input.country || FLAG_MAP[extractCountry(String(input.remarks || ''), '').code],
        },
        sourceName,
      ),
    );
  const document: any = Array.isArray(input.outbounds)
    ? structuredClone(input)
    : input.host
      ? flatProfile(input)
      : null;
  if (!document) throw new Error('Expected Xray profile or VLESS server');
  const nodes = document.outbounds.filter((o: any) => o.protocol === 'vless');
  if (!nodes.length) throw new Error('No VLESS outbounds');
  for (const node of nodes) {
    const s = node.streamSettings;
    if (
      !['tls', 'reality'].includes(s?.security) ||
      !['tcp', 'raw', 'grpc', 'xhttp', 'ws'].includes(s.network || 'tcp')
    )
      throw new Error('Unsupported or unencrypted transport');
    if (s.tlsSettings?.allowInsecure) throw new Error('TLS verification is disabled');
    if (
      s.security === 'reality' &&
      (!s.realitySettings?.serverName || !s.realitySettings?.publicKey)
    )
      throw new Error('Incomplete Reality settings');
    if (!node.settings?.vnext?.length) throw new Error('Missing endpoint');
    for (const endpoint of node.settings.vnext) {
      if (
        typeof endpoint.address !== 'string' ||
        !endpoint.address ||
        !Number.isInteger(endpoint.port) ||
        endpoint.port < 1 ||
        endpoint.port > 65535
      )
        throw new Error('Invalid endpoint');
      if (
        !endpoint.users?.length ||
        endpoint.users.some((u: any) => !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(u.id))
      )
        throw new Error('Invalid VLESS user');
    }
  }
  // Preserve original routing, balancers, DNS and transport details. Local proxy
  // listeners should never expose the imported client's port to the LAN.
  for (const inbound of document.inbounds || []) inbound.listen = '127.0.0.1';
  const name =
    String(input.remarks || input.name || sourceName)
      .replace(/[a-z][a-z0-9+.-]*:\/\/\S+/gi, '')
      .replace(/[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}/gi, '')
      .replace(/[\r\n\t]/g, ' ')
      .trim()
      .slice(0, 100) || 'VPN-профиль';
  const detected = extractCountry(name, '');
  const countryCode =
    (detected.code !== 'XX' ? detected.code : '') ||
    Object.entries(FLAG_MAP).find(([, country]) => country === input.country)?.[0] ||
    '';
  const country = countryCode
    ? new Intl.DisplayNames(['ru'], { type: 'region' }).of(countryCode) || 'Регион не указан'
    : 'Регион не указан';
  // Fingerprint the complete profile, except display-only remarks and local logging.
  const { remarks, log, country: ignoredCountry, ...connection } = document;
  const id = createHash('sha256').update(canonical(connection)).digest('hex').slice(0, 32);
  return [
    {
      summary: {
        id,
        name,
        country,
        countryCode,
        protocol: 'VLESS',
        transports: [...new Set<string>(nodes.map((o: any) => o.streamSettings.network || 'tcp'))],
        security: [...new Set<string>(nodes.map((o: any) => o.streamSettings.security))],
        nodeCount: nodes.length,
        format: 'xray-json',
      },
      document,
    },
  ];
}
export async function loadImportedProfiles(directory: string) {
  const profiles = new Map<string, ImportedProfile>();
  const rejected: { file: string; reason: string }[] = [];
  let files = 0,
    duplicates = 0;
  async function walk(folder: string, depth = 0): Promise<void> {
    if (depth > 3) return;
    let entries;
    try {
      entries = await readdir(folder, { withFileTypes: true });
    } catch (e: any) {
      if (e.code === 'ENOENT') return;
      throw e;
    }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.isSymbolicLink()) continue;
      const path = join(folder, entry.name);
      if (entry.isDirectory()) {
        await walk(path, depth + 1);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
      if (++files > 200) throw new Error('Too many profile files');
      try {
        if ((await stat(path)).size > 2 * 1024 * 1024) throw new Error('Profile exceeds 2 MB');
        const data = JSON.parse((await readFile(path, 'utf8')).replace(/^\uFEFF/, ''));
        for (const profile of parseImportedDocument(data, entry.name.replace(/\.json$/, ''))) {
          if (profiles.has(profile.summary.id)) duplicates++;
          else profiles.set(profile.summary.id, profile);
        }
      } catch {
        rejected.push({
          file: relative(directory, path),
          reason: 'Invalid or unsupported profile; inspect locally',
        });
      }
    }
  }
  await walk(directory);
  return { profiles, files, duplicates, rejected };
}
