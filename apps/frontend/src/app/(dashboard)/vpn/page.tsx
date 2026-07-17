'use client';

import { useState, useRef, useCallback } from 'react';

const servers = [
  { id: '1', country: 'Germany', city: 'Nuremberg', code: 'DE', protocol: 'VLESS', flag: '🇩🇪', ping: 28, online: true },
  { id: '2', country: 'Germany', city: 'Karlsruhe', code: 'DE', protocol: 'VLESS', flag: '🇩🇪', ping: 31, online: true },
  { id: '3', country: 'Latvia', city: 'Riga', code: 'LV', protocol: 'VLESS', flag: '🇱🇻', ping: 45, online: true },
  { id: '4', country: 'Serbia', city: 'Belgrade', code: 'RS', protocol: 'VLESS', flag: '🇷🇸', ping: 52, online: true },
  { id: '5', country: 'Sweden', city: 'Stockholm', code: 'SE', protocol: 'VLESS', flag: '🇸🇪', ping: 38, online: true },
  { id: '6', country: 'Netherlands', city: 'Amsterdam', code: 'NL', protocol: 'VLESS', flag: '🇳🇱', ping: 22, online: true },
  { id: '7', country: 'United Kingdom', city: 'London', code: 'GB', protocol: 'VLESS', flag: '🇬🇧', ping: 35, online: true },
  { id: '8', country: 'United States', city: 'Los Angeles', code: 'US', protocol: 'VLESS', flag: '🇺🇸', ping: 120, online: true },
  { id: '9', country: 'United States', city: 'San Francisco', code: 'US', protocol: 'VLESS', flag: '🇺🇸', ping: 115, online: true },
  { id: '10', country: 'United States', city: 'Washington D.C.', code: 'US', protocol: 'VLESS', flag: '🇺🇸', ping: 95, online: true },
  { id: '11', country: 'Estonia', city: 'Tallinn', code: 'EE', protocol: 'VLESS', flag: '🇪🇪', ping: 42, online: true },
  { id: '12', country: 'France', city: 'Paris', code: 'FR', protocol: 'WIREGUARD', flag: '🇫🇷', ping: 25, online: true },
  { id: '13', country: 'Japan', city: 'Tokyo', code: 'JP', protocol: 'VLESS', flag: '🇯🇵', ping: 180, online: true },
  { id: '14', country: 'Singapore', city: 'Singapore', code: 'SG', protocol: 'VLESS', flag: '🇸🇬', ping: 160, online: true },
  { id: '15', country: 'Canada', city: 'Toronto', code: 'CA', protocol: 'OPENVPN', flag: '🇨🇦', ping: 100, online: true },
];

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export default function VpnPage() {
  const [search, setSearch] = useState('');
  const [selectedServer, setSelectedServer] = useState(servers[0]);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [connectionTime, setConnectionTime] = useState('00:00:00');
  const [mode, setMode] = useState<'Proxy' | 'TUN'>('Proxy');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const secondsRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    secondsRef.current = 0;
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

  return (
    <div className="flex h-full">
      {/* Left: Server list */}
      <div className="w-[420px] border-r border-[var(--border)] flex flex-col shrink-0">
        <div className="p-4">
          <h1 className="text-lg font-semibold text-[var(--foreground)] mb-3">Servers</h1>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search servers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-lg pl-10 pr-10 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="px-4 pb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
          <span className="text-xs font-medium text-[var(--muted-foreground)]">Server List</span>
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
              <span className="text-2xl shrink-0">{server.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {server.country}
                </div>
                <div className="text-xs text-[hsl(222,10%,55%)]">{server.protocol}</div>
              </div>
              <svg className="w-5 h-5 text-[hsl(222,10%,55%)] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Connection panel */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/5 via-transparent to-transparent pointer-events-none" />

        {/* Connection circle */}
        <div className="relative mb-8">
          {/* Outer ring animation */}
          {status === 'connected' && (
            <div className="absolute inset-0 -m-4 rounded-full border border-[var(--primary)]/20 animate-connect-pulse" />
          )}
          {status === 'connecting' && (
            <div className="absolute inset-0 -m-8 rounded-full border-2 border-t-transparent border-[var(--primary)] animate-connect-spin" />
          )}

          {/* Main circle */}
          <button
            onClick={handleConnect}
            className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
              status === 'disconnected'
                ? 'bg-[var(--card)] border-2 border-[var(--border)] hover:border-[var(--primary)]/50 shadow-lg'
                : status === 'connecting'
                ? 'bg-[var(--primary)]/10 border-2 border-[var(--primary)]/50'
                : 'bg-[var(--primary)]/10 border-2 border-[var(--primary)]'
            }`}
          >
            <div className={`absolute inset-2 rounded-full flex flex-col items-center justify-center gap-1 ${
              status === 'connected' ? 'animate-pulse-glow rounded-full' : ''
            }`}>
              {/* Power icon */}
              <svg
                className={`w-10 h-10 transition-colors duration-300 ${
                  status === 'disconnected'
                    ? 'text-[var(--muted-foreground)]'
                    : status === 'connecting'
                    ? 'text-[var(--primary)] animate-connect-spin'
                    : 'text-[var(--primary)]'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
              </svg>
              <span className={`text-xs font-medium ${
                status === 'disconnected' ? 'text-[var(--muted-foreground)]' : 'text-[var(--primary)]'
              }`}>
                {status === 'disconnected' ? 'Disconnected' : status === 'connecting' ? 'Connecting...' : 'Connected'}
              </span>
              {status === 'connected' && (
                <span className="text-xs text-[var(--primary)] font-mono">{connectionTime}</span>
              )}
            </div>
          </button>
        </div>

        {/* Selected server info */}
        <div className="text-center mb-6">
          <div className="text-2xl mb-2">{selectedServer?.flag}</div>
          <div className="text-sm font-medium text-[var(--foreground)]">
            {selectedServer?.country}, {selectedServer?.city}
          </div>
        </div>

        {/* Ping test button */}
        <button className="w-64 mb-6 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors">
          Test Ping
        </button>

        {/* Proxy / TUN toggle */}
        <div className="flex gap-2">
          {(['Proxy', 'TUN'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
