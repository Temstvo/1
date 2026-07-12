'use client';

import { useState } from 'react';

interface Server {
  id: string;
  name: string;
  country: string;
  city: string;
  status: string;
  load: number;
  latency: number;
  currentUsers: number;
  maxUsers: number;
  protocols: string[];
}

const mockServers: Server[] = [
  { id: '1', name: 'Frankfurt', country: 'Germany', city: 'Frankfurt', status: 'ONLINE', load: 45, latency: 12, currentUsers: 234, maxUsers: 1000, protocols: ['WIREGUARD', 'OPENVPN', 'XRAY_REALITY'] },
  { id: '2', name: 'Amsterdam', country: 'Netherlands', city: 'Amsterdam', status: 'ONLINE', load: 62, latency: 18, currentUsers: 189, maxUsers: 800, protocols: ['WIREGUARD', 'OPENVPN'] },
  { id: '3', name: 'New York', country: 'USA', city: 'New York', status: 'ONLINE', load: 78, latency: 85, currentUsers: 456, maxUsers: 1500, protocols: ['WIREGUARD', 'OPENVPN', 'XRAY_REALITY', 'VLESS'] },
  { id: '4', name: 'Tokyo', country: 'Japan', city: 'Tokyo', status: 'ONLINE', load: 33, latency: 120, currentUsers: 167, maxUsers: 600, protocols: ['WIREGUARD', 'XRAY_REALITY'] },
  { id: '5', name: 'London', country: 'UK', city: 'London', status: 'MAINTENANCE', load: 0, latency: 0, currentUsers: 0, maxUsers: 1000, protocols: ['WIREGUARD', 'OPENVPN'] },
  { id: '6', name: 'Singapore', country: 'Singapore', city: 'Singapore', status: 'ONLINE', load: 55, latency: 95, currentUsers: 298, maxUsers: 800, protocols: ['WIREGUARD', 'OPENVPN', 'VLESS'] },
  { id: '7', name: 'Paris', country: 'France', city: 'Paris', status: 'ONLINE', load: 28, latency: 22, currentUsers: 145, maxUsers: 700, protocols: ['WIREGUARD', 'XRAY_REALITY'] },
  { id: '8', name: 'Warsaw', country: 'Poland', city: 'Warsaw', status: 'ONLINE', load: 15, latency: 28, currentUsers: 89, maxUsers: 500, protocols: ['WIREGUARD', 'OPENVPN'] },
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
      <div>
        <input
          type="text"
          placeholder="Search servers..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="space-y-2">
        {filteredServers.map((server) => (
          <button
            key={server.id}
            onClick={() => handleSelect(server)}
            disabled={server.status !== 'ONLINE'}
            className={`w-full rounded-lg border p-4 text-left transition-all ${
              selectedId === server.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700'
            } ${server.status !== 'ONLINE' ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{server.name}</h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      server.status === 'ONLINE'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}
                  >
                    {server.status === 'ONLINE' ? 'Online' : 'Maintenance'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{server.country}</p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-right">
                  <p className="text-muted-foreground">Load</p>
                  <p className="font-medium text-gray-900 dark:text-white">{server.load}%</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Ping</p>
                  <p className="font-medium text-gray-900 dark:text-white">{server.latency}ms</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Users</p>
                  <p className="font-medium text-gray-900 dark:text-white">{server.currentUsers}</p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
