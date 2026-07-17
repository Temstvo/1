'use client';

import { useState, useRef, useCallback } from 'react';

const servers = [
  { id: '1', country: 'Germany', city: 'Nuremberg', code: 'DE', protocol: 'VLESS', flag: '🇩🇪', online: true },
  { id: '2', country: 'Germany', city: 'Karlsruhe', code: 'DE', protocol: 'VLESS', flag: '🇩🇪', online: true },
  { id: '3', country: 'Latvia', city: 'Riga', code: 'LV', protocol: 'VLESS', flag: '🇱🇻', online: true },
  { id: '4', country: 'Serbia', city: 'Belgrade', code: 'RS', protocol: 'VLESS', flag: '🇷🇸', online: true },
  { id: '5', country: 'Sweden', city: 'Stockholm', code: 'SE', protocol: 'VLESS', flag: '🇸🇪', online: true },
  { id: '6', country: 'Netherlands', city: 'Amsterdam', code: 'NL', protocol: 'VLESS', flag: '🇳🇱', online: true },
  { id: '7', country: 'United Kingdom', city: 'London', code: 'GB', protocol: 'VLESS', flag: '🇬🇧', online: true },
  { id: '8', country: 'United States', city: 'Los Angeles', code: 'US', protocol: 'VLESS', flag: '🇺🇸', online: true },
  { id: '9', country: 'United States', city: 'San Francisco', code: 'US', protocol: 'VLESS', flag: '🇺🇸', online: true },
  { id: '10', country: 'United States', city: 'Washington D.C.', code: 'US', protocol: 'VLESS', flag: '🇺🇸', online: true },
  { id: '11', country: 'Estonia', city: 'Tallinn', code: 'EE', protocol: 'VLESS', flag: '🇪🇪', online: true },
  { id: '12', country: 'France', city: 'Paris', code: 'FR', protocol: 'WIREGUARD', flag: '🇫🇷', online: true },
  { id: '13', country: 'Japan', city: 'Tokyo', code: 'JP', protocol: 'VLESS', flag: '🇯🇵', online: true },
  { id: '14', country: 'Singapore', city: 'Singapore', code: 'SG', protocol: 'VLESS', flag: '🇸🇬', online: true },
  { id: '15', country: 'Canada', city: 'Toronto', code: 'CA', protocol: 'OPENVPN', flag: '🇨🇦', online: true },
];

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';
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
  const [selectedServer, setSelectedServer] = useState(servers[0]);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [connectionTime, setConnectionTime] = useState('00:00:00');
  const [mode, setMode] = useState<'Proxy' | 'TUN'>('Proxy');
  const [pings, setPings] = useState<PingState>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(0);
  const pingTimeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

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

  const filteredServers = servers.filter(
    (s) =>
      s.country.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleConnect = () => {
    if (status === 'disconnected') {
      setStatus('connecting');
      setTimeout(() => {
        setStatus('connected');
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
      setStatus('disconnected');
      setConnectionTime('00:00:00');
    }
  };

  const pingServer = useCallback((serverId: string) => {
    setPings((prev) => ({ ...prev, [serverId]: 'loading' }));
    const delay = 500 + Math.random() * 2000;
    const t = setTimeout(() => {
      const success = Math.random() > 0.15;
      if (success) {
        const ms = Math.floor(10 + Math.random() * 180);
        setPings((prev) => ({ ...prev, [serverId]: ms }));
      } else {
        setPings((prev) => ({ ...prev, [serverId]: 'na' }));
      }
    }, delay);
    pingTimeouts.current.push(t);
  }, []);

  const pingAll = useCallback(() => {
    clearPingTimeouts();
    setPings({});
    filteredServers.forEach((server, i) => {
      const t = setTimeout(() => {
        pingServer(server.id);
      }, i * 300);
      pingTimeouts.current.push(t);
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

  return (
    <div className="flex h-full">
      {/* Left: Server list */}
      <div className="w-[420px] border-r border-[var(--border)] flex flex-col shrink-0">
        <div className="p-4">
          <h1 className="text-lg font-semibold text-[var(--foreground)] mb-3">Серверы</h1>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Введите текст для поиска"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-lg pl-10 pr-20 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              {/* Refresh / Ping all icon */}
              <button
                onClick={pingAll}
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                title="Пинг всех"
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
                        Добавить URL
                      </button>
                      <button
                        onClick={pingAll}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-white/5 transition-colors text-left"
                      >
                        <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                        </svg>
                        Пинг всех
                      </button>
                      <button
                        onClick={() => { setExpanded(false); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-white/5 transition-colors text-left"
                      >
                        <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                        </svg>
                        Свернуть все
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {filteredServers.map((server) => (
            <button
              key={server.id}
              onClick={() => setSelectedServer(server)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                selectedServer?.id === server.id
                  ? 'bg-white/10'
                  : 'hover:bg-white/5'
              }`}
            >
              <span className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-white/10">
                <img
                  src={`https://flagcdn.com/w80/${server.code.toLowerCase()}.png`}
                  alt={server.country}
                  className="w-full h-full object-cover"
                />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {server.country}, {server.city}
                </div>
                <div className="text-xs text-[hsl(222,10%,50%)]">{server.protocol}</div>
              </div>
              {/* Ping indicator */}
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
      <div className="flex-1 flex flex-col items-center justify-between py-10 px-6 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 35%, rgba(139,92,246,0.04) 0%, transparent 60%)' }} />

        {/* Power button */}
        <div className="flex-1 flex items-center justify-center w-full">
          <div className="relative">
            <div className="absolute -inset-5 rounded-full" style={{ background: 'conic-gradient(from 0deg, transparent 0%, rgba(100,100,120,0.15) 25%, transparent 50%, rgba(100,100,120,0.1) 75%, transparent 100%)' }} />
            <div className="absolute -inset-3 rounded-full bg-[#1e1e24] border border-[#2a2a32]" />
            <div className="absolute -inset-1 rounded-full bg-[#1a1a20] border border-[#252530]" />
            {status === 'connecting' && (
              <div className="absolute -inset-1 rounded-full border-2 border-t-transparent border-r-transparent border-[var(--primary)]/50 animate-[spin_2s_linear_infinite]" />
            )}
            {status === 'connected' && (
              <div className="absolute -inset-1 rounded-full border-2 border-[var(--primary)] shadow-[0_0_20px_rgba(139,92,246,0.3)] animate-connect-pulse" />
            )}
            <button
              onClick={handleConnect}
              className={`relative w-[180px] h-[180px] rounded-full flex items-center justify-center transition-all duration-500 z-10 ${
                status === 'disconnected'
                  ? 'bg-[#1a1a20] border border-[#2a2a32] hover:border-[#3a3a44] shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]'
                  : status === 'connecting'
                  ? 'bg-[#1a1a20] border border-[var(--primary)]/50'
                  : 'bg-[#1a1a20] border border-[var(--primary)] shadow-[0_0_30px_rgba(139,92,246,0.2)]'
              }`}
            >
              <svg
                className={`w-16 h-16 transition-all duration-500 ${
                  status === 'disconnected'
                    ? 'text-[#555560]'
                    : status === 'connecting'
                    ? 'text-[var(--primary)]/70'
                    : 'text-white drop-shadow-[0_0_12px_rgba(139,92,246,0.6)]'
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
        <div className="flex flex-col items-center gap-4 w-full max-w-[260px]">
          <div className="flex flex-col items-center gap-1.5">
            <span className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
              <img
                src={`https://flagcdn.com/w80/${selectedServer?.code.toLowerCase()}.png`}
                alt={selectedServer?.country}
                className="w-full h-full object-cover"
              />
            </span>
            <div className="text-sm font-medium text-[var(--foreground)] text-center">
              {selectedServer?.country} | {selectedServer?.code}
            </div>
          </div>

          <button
            onClick={pingAll}
            className="w-full py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white text-sm font-semibold transition-all active:scale-[0.97]"
          >
            Тест пинга
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
