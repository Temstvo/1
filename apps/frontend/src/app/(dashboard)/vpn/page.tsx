'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n';
import api from '@/lib/api';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';
type VisualPhase = 'off' | 'spinning' | 'on' | 'fading';
type PingState = Record<string, 'idle' | 'loading' | number | 'na'>;

function PingDots() {
  return (
    <span className="inline-flex items-center gap-[3px]">
      <span className="w-[4px] h-[4px] rounded-full bg-[var(--muted-foreground)] animate-ping" style={{ animationDelay: '0ms', animationDuration: '1s' }} />
      <span className="w-[4px] h-[4px] rounded-full bg-[var(--muted-foreground)] animate-ping" style={{ animationDelay: '200ms', animationDuration: '1s' }} />
      <span className="w-[4px] h-[4px] rounded-full bg-[var(--muted-foreground)] animate-ping" style={{ animationDelay: '400ms', animationDuration: '1s' }} />
    </span>
  );
}

export default function VpnPage() {
  const [search, setSearch] = useState('');
  const [allServers, setAllServers] = useState<any[]>([]);
  const [selectedServer, setSelectedServer] = useState<any>(null);
  const [loadingServers, setLoadingServers] = useState(true);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [visualPhase, setVisualPhase] = useState<VisualPhase>('off');
  const [connectionTime, setConnectionTime] = useState('00:00:00');
  const [mode, setMode] = useState<'Proxy' | 'TUN'>('Proxy');
  const [pings, setPings] = useState<PingState>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'servers' | 'connect'>('servers');
  const [expanded, setExpanded] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(0);
  const pingTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const { t } = useTranslations();

  useEffect(() => {
    api.get('/servers')
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data) ? data : data.servers || [];
        setAllServers(list.filter((s: any) => s.status === 'ONLINE'));
        if (list.length > 0) setSelectedServer(list.find((s: any) => s.status === 'ONLINE') || list[0]);
      })
      .catch(() => setAllServers([]))
      .finally(() => setLoadingServers(false));
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    secondsRef.current = 0;
  }, []);

  const clearPingTimeouts = useCallback(() => {
    pingTimeouts.current.forEach(clearTimeout);
    pingTimeouts.current = [];
  }, []);

  const filteredServers = allServers.filter(
    (s) =>
      s.country.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleConnect = () => {
    if (status === 'disconnected') {
      setStatus('connecting');
      setVisualPhase('spinning');
      setTimeout(() => {
        setStatus('connected');
        setVisualPhase('on');
        secondsRef.current = 0;
        intervalRef.current = setInterval(() => {
          secondsRef.current++;
          const sec = secondsRef.current;
          const h = String(Math.floor(sec / 3600)).padStart(2, '0');
          const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
          const s = String(sec % 60).padStart(2, '0');
          setConnectionTime(`${h}:${m}:${s}`);
        }, 1000);
      }, 1500);
    } else {
      clearTimer();
      setVisualPhase('fading');
      setTimeout(() => {
        setStatus('disconnected');
        setVisualPhase('off');
      }, 400);
      setConnectionTime('00:00:00');
    }
  };

  const pingServer = useCallback((serverId: string) => {
    setPings((prev) => ({ ...prev, [serverId]: 'loading' }));
    const delay = 500 + Math.random() * 2000;
    const timeout = setTimeout(() => {
      const success = Math.random() > 0.15;
      if (success) {
        const ms = Math.floor(10 + Math.random() * 180);
        setPings((prev) => ({ ...prev, [serverId]: ms }));
      } else {
        setPings((prev) => ({ ...prev, [serverId]: 'na' }));
      }
    }, delay);
    pingTimeouts.current.push(timeout);
  }, []);

  const pingAll = useCallback(() => {
    clearPingTimeouts();
    setPings({});
    filteredServers.forEach((server, i) => {
      const timeout = setTimeout(() => {
        pingServer(server.id);
      }, i * 300);
      pingTimeouts.current.push(timeout);
    });
    setMenuOpen(false);
  }, [filteredServers, pingServer, clearPingTimeouts]);

  const renderPing = (serverId: string) => {
    const p = pings[serverId];
    if (p === undefined || p === 'idle') return null;
    if (p === 'loading') return <PingDots />;
    if (p === 'na') return <span className="text-xs text-[var(--muted-foreground)]">n/a</span>;
    return <span className="text-xs text-[var(--muted-foreground)]">{p}ms</span>;
  };

  const hasAnyPing = Object.keys(pings).length > 0;

  const statusText =
    status === 'disconnected'
      ? t('vpn_disconnected')
      : status === 'connecting'
      ? t('vpn_connecting')
      : t('vpn_connected');

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* Mobile toggle */}
      <div className="md:hidden flex border-b border-[var(--border)]">
        <button
          onClick={() => setMobileView('servers')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${mobileView === 'servers' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`}
        >
          {t('vpn_title')}
        </button>
        <button
          onClick={() => setMobileView('connect')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${mobileView === 'connect' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`}
        >
          {statusText}
        </button>
      </div>

      {/* Left: Server list */}
      <div className={`${mobileView === 'connect' ? 'hidden md:flex' : 'flex'} w-full md:w-[320px] lg:w-[420px] border-r border-[var(--border)] flex-col shrink-0`}>
        <div className="p-4">
          <h1 className="text-lg font-semibold text-[var(--foreground)] mb-3">{t('vpn_title')}</h1>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder={t('vpn_search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-lg pl-10 pr-20 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              {/* Refresh / Ping all icon */}
              <button
                onClick={pingAll}
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                title={t('vpn_ping_all')}
              >
                <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
              </button>
              {/* Three dots menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                >
                  <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="5" cy="12" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="19" cy="12" r="2" />
                  </svg>
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-[#1e1e24] border border-[#2a2a32] rounded-lg shadow-xl overflow-hidden">
                      <button
                        onClick={() => { setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-white/5 transition-colors text-left"
                      >
                        <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        {t('vpn_add_url')}
                      </button>
                      <button
                        onClick={pingAll}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-white/5 transition-colors text-left"
                      >
                        <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                        </svg>
                        {t('vpn_ping_all')}
                      </button>
                      <button
                        onClick={() => { setExpanded(false); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-white/5 transition-colors text-left"
                      >
                        <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                        </svg>
                        {t('vpn_collapse_all')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {loadingServers ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredServers.map((server) => (
            <button
              key={server.id}
              onClick={() => { setSelectedServer(server); setMobileView('connect'); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                selectedServer?.id === server.id
                  ? 'bg-white/10'
                  : 'hover:bg-white/5'
              }`}
            >
              <span className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-white/10">
                <img
                  src={`https://flagcdn.com/w80/${server.code?.toLowerCase() || 'un'}.png`}
                  alt={server.country}
                  className="w-full h-full object-cover"
                />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {server.country}, {server.city}
                </div>
                <div className="text-xs text-[hsl(222,10%,50%)]">{Array.isArray(server.protocols) ? server.protocols[0] : server.protocol || 'VLESS'}</div>
              </div>
              {hasAnyPing && (
                <span className="shrink-0 w-12 text-right">
                  {renderPing(server.id)}
                </span>
              )}
              <svg className="w-4 h-4 text-[hsl(222,10%,40%)] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Connection panel */}
      <div className={`${mobileView === 'servers' ? 'hidden md:flex' : 'flex'} flex-1 flex-col items-center justify-between py-6 md:py-10 px-4 md:px-6 relative`}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 35%, rgba(139,92,246,0.04) 0%, transparent 60%)' }} />

        {/* Power button */}
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="relative">
            <div className="absolute -inset-5 rounded-full" style={{ background: 'conic-gradient(from 0deg, transparent 0%, rgba(100,100,120,0.15) 25%, transparent 50%, rgba(100,100,120,0.1) 75%, transparent 100%)' }} />
            <div className="absolute -inset-3 rounded-full bg-[#1e1e24] border border-[#2a2a32]" />
            <div className="absolute -inset-1 rounded-full bg-[#1a1a20] border border-[#252530]" />
            {/* Outer ring — spin once while connecting */}
            {visualPhase === 'spinning' && (
              <div className="absolute -inset-1 rounded-full border-2 border-t-transparent border-r-transparent border-[var(--primary)]/60 animate-spin-once" />
            )}
            {/* Outer ring — glow in when connected */}
            {visualPhase === 'on' && (
              <div className="absolute -inset-1 rounded-full border-2 border-[var(--primary)] shadow-[0_0_24px_rgba(139,92,246,0.4)] animate-glow-in" />
            )}
            {/* Outer ring — glow out when disconnecting */}
            {visualPhase === 'fading' && (
              <div className="absolute -inset-1 rounded-full border-2 border-[var(--primary)]/50 animate-glow-out" />
            )}
            {/* Main button */}
            <button
              onClick={handleConnect}
              className={`relative w-[140px] h-[140px] md:w-[180px] md:h-[180px] rounded-full flex items-center justify-center transition-all duration-500 z-10 ${
                visualPhase === 'off'
                  ? 'bg-[#1a1a20] border border-[#2a2a32] hover:border-[#3a3a44] shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]'
                  : visualPhase === 'spinning'
                  ? 'bg-[#1a1a20] border border-[var(--primary)]/40'
                  : visualPhase === 'on'
                  ? 'bg-[#1a1a20] border border-[var(--primary)] shadow-[0_0_30px_rgba(139,92,246,0.15)]'
                  : 'bg-[#1a1a20] border border-[var(--primary)]/30'
              }`}
            >
              <svg
                className={`w-12 h-12 md:w-16 md:h-16 transition-all duration-500 ${
                  visualPhase === 'off'
                    ? 'text-[#555560]'
                    : visualPhase === 'spinning'
                    ? 'text-[var(--primary)]/60'
                    : visualPhase === 'on'
                    ? 'text-white drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]'
                    : 'text-[var(--primary)]/40'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col items-center gap-4 w-full max-w-[260px] md:max-w-[260px]">
          <div className="flex flex-col items-center gap-1.5">
            <span className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
              <img
                src={`https://flagcdn.com/w80/${selectedServer?.code?.toLowerCase() || 'un'}.png`}
                alt={selectedServer?.country}
                className="w-full h-full object-cover"
              />
            </span>
            <div className="text-sm font-medium text-[var(--foreground)] text-center">
              {selectedServer?.country} | {selectedServer?.code}
            </div>
            {pings[selectedServer?.id] !== undefined && pings[selectedServer?.id] !== 'idle' && (
              <div className="text-xs text-[var(--muted-foreground)] text-center">
                {pings[selectedServer?.id] === 'loading' ? (
                  <PingDots />
                ) : pings[selectedServer?.id] === 'na' ? (
                  'n/a'
                ) : (
                  `${pings[selectedServer?.id]}ms`
                )}
              </div>
            )}
          </div>

          <div className="text-sm text-[var(--muted-foreground)] text-center">
            {statusText}
            {status === 'connected' && (
              <span className="ml-2 text-[var(--foreground)]">{connectionTime}</span>
            )}
          </div>

          <button
            onClick={() => pingServer(selectedServer?.id)}
            className="w-full py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white text-sm font-semibold transition-all active:scale-[0.97]"
          >
            {t('vpn_ping_test')}
          </button>

          <div className="flex gap-2 w-full">
            {(['Proxy', 'TUN'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  mode === m
                    ? 'bg-[var(--primary)] text-white shadow-[0_0_12px_rgba(139,92,246,0.2)]'
                    : 'bg-[#1e1e24] text-[var(--muted-foreground)] border border-[#2a2a32] hover:border-[#3a3a44]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
