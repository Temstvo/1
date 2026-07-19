'use client';

import { useState, useEffect, useCallback } from 'react';
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

interface ConfigStats {
  total: number;
  byProtocol: { protocol: string; count: number }[];
  byCountry: { country: string; count: number }[];
}

const PROTOCOL_COLORS: Record<string, string> = {
  vless: '#22c55e',
  trojan: '#f59e0b',
  shadowsocks: '#3b82f6',
  vmess: '#a855f7',
  hysteria2: '#ef4444',
  tuic: '#06b6d4',
};

export default function VpnPage() {
  const { t } = useTranslations();
  const [configs, setConfigs] = useState<VpnConfig[]>([]);
  const [stats, setStats] = useState<ConfigStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('');
  const [listFilter, setListFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFullUri, setShowFullUri] = useState<string | null>(null);
  const [fullUri, setFullUri] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');
  const [selectedConfig, setSelectedConfig] = useState<VpnConfig | null>(null);

  const fetchConfigs = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (protocolFilter) params.set('protocol', protocolFilter);
    if (listFilter) params.set('listType', listFilter);
    if (search) params.set('search', search);

    api.get(`/vpn-configs?${params.toString()}`)
      .then((res) => setConfigs(res.data))
      .catch(() => setConfigs([]))
      .finally(() => setLoading(false));
  }, [protocolFilter, listFilter, search]);

  const fetchStats = useCallback(() => {
    api.get('/vpn-configs/stats')
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchConfigs();
    fetchStats();
  }, [fetchConfigs, fetchStats]);

  useEffect(() => {
    const debounce = setTimeout(fetchConfigs, 300);
    return () => clearTimeout(debounce);
  }, [search, protocolFilter, listFilter, fetchConfigs]);

  const copyUri = async (config: VpnConfig) => {
    try {
      const res = await api.get(`/vpn-configs/${config.id}`);
      const uri = res.data?.uri || '';
      await navigator.clipboard.writeText(uri);
      setCopiedId(config.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const showUri = async (config: VpnConfig) => {
    setShowFullUri(config.id);
    try {
      const res = await api.get(`/vpn-configs/${config.id}`);
      setFullUri(res.data.uri || '');
    } catch {
      setFullUri('Error loading config');
    }
  };

  const flagUrl = (code: string) =>
    `https://flagcdn.com/w80/${(code || 'un').toLowerCase()}.png`;

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="md:hidden flex border-b border-[var(--border)]">
        <button
          onClick={() => setMobileView('list')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${mobileView === 'list' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`}
        >
          {t('vpn_title')}
        </button>
        <button
          onClick={() => setMobileView('detail')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${mobileView === 'detail' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`}
        >
          Info
        </button>
      </div>

      <div className={`${mobileView === 'detail' ? 'hidden md:flex' : 'flex'} w-full md:w-[320px] lg:w-[420px] border-r border-[var(--border)] flex-col shrink-0`}>
        <div className="p-4">
          <h1 className="text-lg font-semibold text-[var(--foreground)] mb-3">{t('vpn_title')}</h1>
          <div className="relative mb-3">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder={t('vpn_search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
          <div className="flex gap-2 mb-3">
            <select
              value={listFilter}
              onChange={(e) => setListFilter(e.target.value)}
              className="flex-1 bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="">All lists</option>
              <option value="black">Black List (bypass blocks)</option>
              <option value="white">White List (Russia only)</option>
            </select>
            <select
              value={protocolFilter}
              onChange={(e) => setProtocolFilter(e.target.value)}
              className="flex-1 bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="">All protocols</option>
              <option value="vless">VLESS</option>
              <option value="trojan">Trojan</option>
              <option value="shadowsocks">Shadowsocks</option>
              <option value="vmess">VMess</option>
              <option value="hysteria2">Hysteria2</option>
            </select>
          </div>
          {stats && (
            <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] mb-2">
              <span>{stats.total} configs</span>
              {stats.byProtocol.slice(0, 3).map((p) => (
                <span key={p.protocol} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: PROTOCOL_COLORS[p.protocol] || '#888' }} />
                  {p.protocol} ({p.count})
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : configs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-[var(--muted-foreground)] text-sm">
              <p>No configs found</p>
            </div>
          ) : (
            configs.map((config) => (
              <button
                key={config.id}
                onClick={() => { setSelectedConfig(config); setMobileView('detail'); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                  selectedConfig?.id === config.id ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
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
                <button
                  onClick={(e) => { e.stopPropagation(); copyUri(config); }}
                  className="p-1.5 rounded-md hover:bg-white/10 transition-colors shrink-0"
                  title="Copy config"
                >
                  {copiedId === config.id ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
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
          <div className="flex flex-col items-center gap-4 text-[var(--muted-foreground)]">
            <svg className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 7.41A2.25 2.25 0 012.25 5.496V5.25" />
            </svg>
            <p className="text-sm">Select a config to view details</p>
            <p className="text-xs opacity-60 text-center max-w-xs">
              Copy the config URI and import it into your VPN client (Karing, v2rayN, Streisand, etc.)
            </p>
          </div>
        ) : (
          <div className="w-full max-w-lg space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                <img src={flagUrl(selectedConfig.countryCode)} alt={selectedConfig.country} className="w-full h-full object-cover" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">{selectedConfig.country}</h2>
                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <span className="w-2 h-2 rounded-full" style={{ background: PROTOCOL_COLORS[selectedConfig.protocol] || '#888' }} />
                  <span className="uppercase font-medium">{selectedConfig.protocol}</span>
                  <span className="opacity-50">|</span>
                  <span>{selectedConfig.listType === 'black' ? 'Black List' : 'White List'}</span>
                  <span className="opacity-50">|</span>
                  <span>{selectedConfig.server}</span>
                </div>
              </div>
            </div>

            {selectedConfig.label && (
              <div className="text-sm text-[var(--muted-foreground)] bg-[var(--muted)] rounded-xl px-4 py-3">
                {selectedConfig.label}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => copyUri(selectedConfig)}
                className="w-full py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white text-sm font-semibold transition-all active:scale-[0.97] flex items-center justify-center gap-2"
              >
                {copiedId === selectedConfig.id ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                    Copy Config
                  </>
                )}
              </button>

              <button
                onClick={() => showUri(selectedConfig)}
                className="w-full py-3 rounded-xl bg-[#1e1e24] border border-[#2a2a32] hover:border-[#3a3a44] text-[var(--foreground)] text-sm font-medium transition-all active:scale-[0.97]"
              >
                Show Full Config
              </button>
            </div>

            {showFullUri === selectedConfig.id && fullUri && (
              <div className="bg-[var(--muted)] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase">Config URI</span>
                  <button onClick={() => { navigator.clipboard.writeText(fullUri); setCopiedId('full'); }} className="text-xs text-[var(--primary)] hover:underline">
                    {copiedId === 'full' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="text-xs text-[var(--muted-foreground)] break-all whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
                  {fullUri}
                </pre>
              </div>
            )}

            <div className="bg-[var(--muted)] rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-medium text-[var(--muted-foreground)] uppercase mb-3">How to use</h3>
              <div className="text-xs text-[var(--muted-foreground)] space-y-2">
                <p>1. Copy the config URI above</p>
                <p>2. Open your VPN client (Karing, v2rayN, Streisand, etc.)</p>
                <p>3. Paste the URI as a new server</p>
                <p>4. Connect and browse freely</p>
              </div>
              <div className="mt-3 pt-3 border-t border-[var(--border)]">
                <p className="text-xs text-[var(--muted-foreground)]">
                  <span className="font-medium">Black List</span> - bypasses RKN blocks. Use this in Russia.
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  <span className="font-medium">White List</span> - only routes Russian traffic through proxy. For split tunneling.
                </p>
              </div>
            </div>

            {selectedConfig.latency && (
              <div className="text-xs text-[var(--muted-foreground)] text-center">
                Latency: {selectedConfig.latency}ms
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
