'use client';

import { useState } from 'react';

interface Server {
  id: string;
  name: string;
  country: string;
  city: string;
  flag: string;
  status: string;
  load: number;
  latency: number;
  currentUsers: number;
  maxUsers: number;
  protocols: string[];
}

const mockServers: Server[] = [
  { id: '1', name: 'Frankfurt', country: 'Germany', city: 'Frankfurt', flag: '🇩🇪', status: 'ONLINE', load: 45, latency: 12, currentUsers: 234, maxUsers: 1000, protocols: ['WireGuard', 'OpenVPN', 'Xray'] },
  { id: '2', name: 'Amsterdam', country: 'Netherlands', city: 'Amsterdam', flag: '🇳🇱', status: 'ONLINE', load: 62, latency: 18, currentUsers: 189, maxUsers: 800, protocols: ['WireGuard', 'OpenVPN'] },
  { id: '3', name: 'New York', country: 'USA', city: 'New York', flag: '🇺🇸', status: 'ONLINE', load: 78, latency: 85, currentUsers: 456, maxUsers: 1500, protocols: ['WireGuard', 'OpenVPN', 'Xray', 'VLESS'] },
  { id: '4', name: 'Tokyo', country: 'Japan', city: 'Tokyo', flag: '🇯🇵', status: 'ONLINE', load: 33, latency: 120, currentUsers: 167, maxUsers: 600, protocols: ['WireGuard', 'Xray'] },
  { id: '5', name: 'London', country: 'UK', city: 'London', flag: '🇬🇧', status: 'MAINTENANCE', load: 0, latency: 0, currentUsers: 0, maxUsers: 1000, protocols: ['WireGuard', 'OpenVPN'] },
  { id: '6', name: 'Singapore', country: 'Singapore', city: 'Singapore', flag: '🇸🇬', status: 'ONLINE', load: 55, latency: 95, currentUsers: 298, maxUsers: 800, protocols: ['WireGuard', 'OpenVPN', 'VLESS'] },
  { id: '7', name: 'Paris', country: 'France', city: 'Paris', flag: '🇫🇷', status: 'ONLINE', load: 28, latency: 22, currentUsers: 145, maxUsers: 700, protocols: ['WireGuard', 'Xray'] },
  { id: '8', name: 'Warsaw', country: 'Poland', city: 'Warsaw', flag: '🇵🇱', status: 'ONLINE', load: 15, latency: 28, currentUsers: 89, maxUsers: 500, protocols: ['WireGuard', 'OpenVPN'] },
];

export function ServerList({ onSelect }: { onSelect?: (server: Server) => void }) {
  const [filter, setFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredServers = mockServers.filter(
    (s) =>
      s.name.toLowerCase().includes(filter.toLowerCase()) ||
      s.country.toLowerCase().includes(filter.toLowerCase()),
  );

  const handleSelect = (server: Server) => {
    setSelectedId(server.id);
    onSelect?.(server);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder="Search servers..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full rounded-xl border border-gray-700/50 bg-[#111] pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
        />
      </div>

      <div className="space-y-2">
        {filteredServers.map((server) => (
          <button
            key={server.id}
            onClick={() => handleSelect(server)}
            disabled={server.status !== 'ONLINE'}
            className={`w-full rounded-2xl border p-4 text-left transition-all ${
              selectedId === server.id
                ? 'border-purple-500/50 bg-purple-500/10'
                : 'border-[#222] bg-[#111] hover:border-gray-700 hover:bg-[#222]'
            } ${server.status !== 'ONLINE' ? 'opacity-40' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{server.flag}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{server.name}</h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        server.status === 'ONLINE'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {server.status === 'ONLINE' ? 'Online' : 'Maintenance'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{server.country}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Load</p>
                  <p className="font-medium text-white">{server.load}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Ping</p>
                  <p className="font-medium text-white">{server.latency}ms</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Users</p>
                  <p className="font-medium text-white">{server.currentUsers}</p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
