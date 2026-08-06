'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from '@/lib/i18n';
import api from '@/lib/api';

interface VpnConfig {
  id: string;
  protocol: string;
  label: string;
  country: string;
  countryCode: string;
  server: string;
  listType: string;
  latency: number | null;
  lastChecked: string | null;
}

const PROTOCOL_COLORS: Record<string, string> = {
  vless: '#22c55e',
  trojan: '#f59e0b',
  shadowsocks: '#3b82f6',
  vmess: '#a855f7',
  hysteria2: '#ef4444',
  tuic: '#06b6d4',
};

const GITHUB_SOURCES = [
  { url: 'https://raw.githubusercontent.com/igareck/vpn-configs-for-russia/main/BLACK_VLESS_RUS_mobile.txt', listType: 'black', name: 'Black List VLESS Mobile' },
  { url: 'https://raw.githubusercontent.com/igareck/vpn-configs-for-russia/main/BLACK_SS+All_RUS.txt', listType: 'black', name: 'Black List SS+Hysteria2+VMess+Trojan' },
  { url: 'https://raw.githubusercontent.com/igareck/vpn-configs-for-russia/main/Vless-Reality-White-Lists-Rus-Mobile.txt', listType: 'white', name: 'White List CIDR Mobile' },
  { url: 'https://raw.githubusercontent.com/igareck/vpn-configs-for-russia/main/WHITE-CIDR-RU-checked.txt', listType: 'white', name: 'White List CIDR Checked' },
  { url: 'https://raw.githubusercontent.com/igareck/vpn-configs-for-russia/main/WHITE-SNI-RU-all.txt', listType: 'white', name: 'White List SNI' },
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
  BR: 'Brazil', AU: 'Australia', NZ: 'New Zealand', IL: 'Israel',
  TH: 'Thailand', VN: 'Vietnam', ID: 'Indonesia', MY: 'Malaysia',
  TW: 'Taiwan', HK: 'Hong Kong', GE: 'Georgia', AM: 'Armenia',
  LT: 'Lithuania', SI: 'Slovenia', SK: 'Slovakia', HU: 'Hungary',
  GR: 'Greece', CY: 'Cyprus', MT: 'Malta', LU: 'Luxembourg',
};

const SUPPORTED_PROTOCOLS = ['vless', 'trojan', 'shadowsocks', 'ss', 'hysteria2', 'hysteria', 'vmess', 'tuic'];

function parseConfigUri(uri: string, listType: string): VpnConfig | null {
  const match = uri.match(/^(\w+):\/\//);
  if (!match) return null;
  const protocol = match[1].toLowerCase();
  if (!SUPPORTED_PROTOCOLS.includes(protocol)) return null;

  const hashIndex = uri.indexOf('#');
  const label = hashIndex > -1 ? decodeURIComponent(uri.substring(hashIndex + 1)) : '';

  const afterProtocol = uri.substring(match[0].length);
  const atMatch = afterProtocol.match(/@([^:]+):(\d+)/);
  const server = atMatch ? `${atMatch[1]}:${atMatch[2]}` : 'unknown';

  const flagMatch = label.match(/[\u{1F1E0}-\u{1F1FF}]{2}/u);
  let country = 'Unknown', countryCode = 'XX';
  if (flagMatch) {
    const codePoints = [...flagMatch[0]].map((c) => c.codePointAt(0)! - 0x1f1e6 + 65);
    const code = String.fromCharCode(...codePoints);
    if (FLAG_MAP[code]) { country = FLAG_MAP[code]; countryCode = code; }
  }

  const hash = uri.substring(0, Math.min(uri.length, 100));
  let h = 0;
  for (let i = 0; i < hash.length; i++) { h = ((h << 5) - h + hash.charCodeAt(i)) | 0; }
  const id = Math.abs(h).toString(16).padStart(8, '0');

  return {
    id,
    protocol: protocol === 'ss' ? 'shadowsocks' : protocol,
    label: label || `${country} ${protocol.toUpperCase()}`,
    country,
    countryCode,
    server,
    listType,
    latency: null,
    lastChecked: null,
  };
}

export default function VpnPage() {
  const { t } = useTranslations();
  const [configs, setConfigs] = useState<VpnConfig[]>([]);
  const [fullUriMap, setFullUriMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [search, setSearch] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('');
  const [listFilter, setListFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFullUri, setShowFullUri] = useState<string | null>(null);
  const [fullUri, setFullUri] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const [selectedConfig, setSelectedConfig] = useState<VpnConfig | null>(null);
  const [source, setSource] = useState<'api' | 'github' | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const res = await api.get('/vpn-configs', { timeout: 5000 });
        if (!cancelled && res.data?.length > 0) {
          setConfigs(res.data);
          setSource('api');
          setLoading(false);
          return;
        }
      } catch {}

      const allConfigs: VpnConfig[] = [];
      const uriMap: Record<string, string> = {};

      for (const src of GITHUB_SOURCES) {
        if (cancelled) return;
        setLoadingMsg(src.name);
        try {
          const resp = await fetch(src.url, { signal: AbortSignal.timeout(15000) });
          if (!resp.ok) continue;
          const text = await resp.text();
          const lines = text.split('\n').filter((l) => l.trim() && !l.startsWith('#'));

          for (const line of lines) {
            const config = parseConfigUri(line.trim(), src.listType);
            if (config) {
              if (!uriMap[config.id]) {
                uriMap[config.id] = line.trim();
                allConfigs.push(config);
              }
            }
          }
        } catch {}
      }

      if (!cancelled) {
        setConfigs(allConfigs);
        setFullUriMap(uriMap);
        setSource('github');
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const filteredConfigs = useMemo(() => {
    return configs.filter((c) => {
      if (protocolFilter && c.protocol !== protocolFilter) return false;
      if (listFilter && c.listType !== listFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.label.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.protocol.toLowerCase().includes(q);
      }
      return true;
    });
  }, [configs, protocolFilter, listFilter, search]);

  const stats = useMemo(() => {
    const byProtocol: Record<string, number> = {};
    const byCountry: Record<string, number> = {};
    for (const c of filteredConfigs) {
      byProtocol[c.protocol] = (byProtocol[c.protocol] || 0) + 1;
      byCountry[c.country] = (byCountry[c.country] || 0) + 1;
    }
    return {
      total: filteredConfigs.length,
      byProtocol: Object.entries(byProtocol).sort((a, b) => b[1] - a[1]),
      byCountry: Object.entries(byCountry).sort((a, b) => b[1] - a[1]),
    };
  }, [filteredConfigs]);

  const copyUri = async (config: VpnConfig) => {
    let uri = '';
    if (source === 'github' && fullUriMap[config.id]) {
      uri = fullUriMap[config.id];
    } else {
      try {
        const res = await api.get(`/vpn-configs/${config.id}`);
        uri = res.data?.uri || '';
      } catch {}
    }
    if (uri) {
      await navigator.clipboard.writeText(uri);
      setCopiedId(config.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const showUri = async (config: VpnConfig) => {
    setShowFullUri(config.id);
    if (source === 'github' && fullUriMap[config.id]) {
      setFullUri(fullUriMap[config.id]);
      return;
    }
    try {
      const res = await api.get(`/vpn-configs/${config.id}`);
      setFullUri(res.data.uri || '');
    } catch {
      setFullUri('Error loading config');
    }
  };

  const flagUrl = (code: string) =>
    `https://flagcdn.com/w80/${(code || 'un').toLowerCase()}.png`;

  const isTauri = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_TAURI === 'true';

  return (
    <div className="flex h-full flex-col md:flex-row">
      {!isTauri && (
        <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-b border-[hsl(var(--border))] px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-[hsl(var(--foreground))]">{t('vpn_download_banner')}</p>
          <a href="/downloads" className="shrink-0 rounded-lg bg-[hsl(var(--primary))] px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity">
            {t('vpn_download_btn')}
          </a>
        </div>
      )}
      <div className="md:hidden flex border-b border-[hsl(var(--border))]">
        <button onClick={() => setMobileView('list')} className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${mobileView === 'list' ? 'text-[hsl(var(--primary))] border-b-2 border-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
          {t('vpn_title')}
        </button>
        <button onClick={() => setMobileView('detail')} className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${mobileView === 'detail' ? 'text-[hsl(var(--primary))] border-b-2 border-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
          {t('vpn_how_to_use')}
        </button>
      </div>

      <div className={`${mobileView === 'detail' ? 'hidden md:flex' : 'flex'} w-full md:w-[320px] lg:w-[420px] border-r border-[hsl(var(--border))] flex-col shrink-0`}>
        <div className="p-4">
          <h1 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-3">{t('vpn_title')}</h1>

          {source === 'github' && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))]">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                <span className="font-medium text-[hsl(var(--foreground))]">igareck/vpn-configs-for-russia</span> — {configs.length} {configs.length === 1 ? 'config' : 'configs'}
              </p>
            </div>
          )}

          <div className="relative mb-3">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" placeholder={t('vpn_search')} value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:border-[hsl(var(--primary))] transition-colors" />
          </div>

          <div className="flex gap-2 mb-3">
            <select value={listFilter} onChange={(e) => setListFilter(e.target.value)}
              className="flex-1 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--primary))]">
              <option value="">{t('vpn_all_lists')}</option>
              <option value="black">{t('vpn_black_list')}</option>
              <option value="white">{t('vpn_white_list')}</option>
            </select>
            <select value={protocolFilter} onChange={(e) => setProtocolFilter(e.target.value)}
              className="flex-1 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded-lg px-3 py-2 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:border-[hsl(var(--primary))]">
              <option value="">{t('vpn_all_protocols')}</option>
              <option value="vless">VLESS</option>
              <option value="trojan">Trojan</option>
              <option value="shadowsocks">Shadowsocks</option>
              <option value="vmess">VMess</option>
              <option value="hysteria2">Hysteria2</option>
              <option value="tuic">TUIC</option>
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))] mb-2">
            <span>{stats.total} configs</span>
            {stats.byProtocol.slice(0, 4).map(([proto, count]) => (
              <span key={proto} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: PROTOCOL_COLORS[proto] || '#888' }} />
                {proto} ({count})
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <div className="w-6 h-6 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin" />
              {loadingMsg && <p className="text-xs text-[hsl(var(--muted-foreground))]">{loadingMsg}...</p>}
            </div>
          ) : filteredConfigs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-[hsl(var(--muted-foreground))] text-sm">
              <p>{t('vpn_no_configs')}</p>
            </div>
          ) : (
            filteredConfigs.map((config) => (
              <button key={config.id}
                onClick={() => { setSelectedConfig(config); setMobileView('detail'); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${selectedConfig?.id === config.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                <span className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-white/10">
                  <img src={flagUrl(config.countryCode)} alt={config.country} className="w-full h-full object-cover" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{config.label || config.country}</div>
                  <div className="flex items-center gap-2 text-xs text-[hsl(222,10%,50%)]">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PROTOCOL_COLORS[config.protocol] || '#888' }} />
                    <span className="uppercase">{config.protocol}</span>
                    <span className="opacity-50">|</span>
                    <span>{config.listType === 'black' ? 'BL' : 'WL'}</span>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); copyUri(config); }}
                  className="p-1.5 rounded-md hover:bg-white/10 transition-colors shrink-0" title="Copy">
                  {copiedId === config.id ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-[hsl(var(--muted-foreground))]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                  )}
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      <div className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} flex-1 flex-col items-center justify-center py-6 md:py-10 px-4 md:px-8 relative`}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 35%, rgba(139,92,246,0.04) 0%, transparent 60%)' }} />

        {!selectedConfig ? (
          <div className="flex flex-col items-center gap-4 text-[hsl(var(--muted-foreground))]">
            <svg className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 7.41A2.25 2.25 0 012.25 5.496V5.25" />
            </svg>
            <p className="text-sm">{t('vpn_select_config')}</p>
            <p className="text-xs opacity-60 text-center max-w-xs">{t('vpn_select_hint')}</p>
          </div>
        ) : (
          <div className="w-full max-w-lg space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                <img src={flagUrl(selectedConfig.countryCode)} alt={selectedConfig.country} className="w-full h-full object-cover" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{selectedConfig.country}</h2>
                <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                  <span className="w-2 h-2 rounded-full" style={{ background: PROTOCOL_COLORS[selectedConfig.protocol] || '#888' }} />
                  <span className="uppercase font-medium">{selectedConfig.protocol}</span>
                  <span className="opacity-50">|</span>
                  <span>{selectedConfig.listType === 'black' ? t('vpn_black_list') : t('vpn_white_list')}</span>
                  <span className="opacity-50">|</span>
                  <span>{selectedConfig.server}</span>
                </div>
              </div>
            </div>

            {selectedConfig.label && (
              <div className="text-sm text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] rounded-xl px-4 py-3">
                {selectedConfig.label}
              </div>
            )}

            <div className="space-y-3">
              <button onClick={() => copyUri(selectedConfig)}
                className="w-full py-3 rounded-xl bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white text-sm font-semibold transition-all active:scale-[0.97] flex items-center justify-center gap-2">
                {copiedId === selectedConfig.id ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {t('vpn_copied')}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                    {t('vpn_copy_config')}
                  </>
                )}
              </button>

              <button onClick={() => showUri(selectedConfig)}
                className="w-full py-3 rounded-xl bg-[#1e1e24] border border-[#2a2a32] hover:border-[#3a3a44] text-[hsl(var(--foreground))] text-sm font-medium transition-all active:scale-[0.97]">
                {t('vpn_show_config')}
              </button>
            </div>

            {showFullUri === selectedConfig.id && fullUri && (
              <div className="bg-[hsl(var(--muted))] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">{t('vpn_config_uri')}</span>
                  <button onClick={() => { navigator.clipboard.writeText(fullUri); setCopiedId('full'); }} className="text-xs text-[hsl(var(--primary))] hover:underline">
                    {copiedId === 'full' ? t('vpn_copied') : t('vpn_copy_config')}
                  </button>
                </div>
                <pre className="text-xs text-[hsl(var(--muted-foreground))] break-all whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">{fullUri}</pre>
              </div>
            )}

            <div className="bg-[hsl(var(--muted))] rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase mb-3">{t('vpn_how_to_use')}</h3>
              <div className="text-xs text-[hsl(var(--muted-foreground))] space-y-2">
                <p>{t('vpn_step1')}</p>
                <p>{t('vpn_step2')}</p>
                <p>{t('vpn_step3')}</p>
                <p>{t('vpn_step4')}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-[hsl(var(--border))]">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  <span className="font-medium">{t('vpn_black_list')}</span> — {t('vpn_black_explain')}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  <span className="font-medium">{t('vpn_white_list')}</span> — {t('vpn_white_explain')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
