'use client';

import { useState } from 'react';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export function VpnConnector() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [selectedServer, setSelectedServer] = useState('Frankfurt, Germany');
  const [protocol, setProtocol] = useState('WireGuard');
  const [traffic, setTraffic] = useState({ download: 0, upload: 0 });
  const [duration, setDuration] = useState(0);

  const handleConnect = async () => {
    if (status === 'connected') {
      setStatus('disconnected');
      return;
    }

    setStatus('connecting');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setStatus('connected');
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">VPN Connection</h2>
        <p className="text-muted-foreground">
          {status === 'connected'
            ? 'Connected to VPN'
            : status === 'connecting'
            ? 'Connecting...'
            : 'Disconnected'}
        </p>
      </div>

      <div className="relative">
        <button
          onClick={handleConnect}
          disabled={status === 'connecting'}
          className={`h-40 w-40 rounded-full border-4 transition-all duration-300 ${
            status === 'connected'
              ? 'border-green-500 bg-green-50 shadow-lg shadow-green-500/25'
              : status === 'connecting'
              ? 'border-yellow-500 bg-yellow-50 animate-pulse'
              : 'border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-500'
          }`}
        >
          <div className="flex flex-col items-center justify-center">
            {status === 'connected' ? (
              <svg className="h-16 w-16 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : status === 'connecting' ? (
              <svg className="h-16 w-16 text-yellow-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-4.686a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            )}
          </div>
        </button>
      </div>

      <div className="grid w-full max-w-md grid-cols-3 gap-4 text-center">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm text-muted-foreground">Download</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {traffic.download > 0 ? `${(traffic.download / 1024 / 1024).toFixed(1)} MB` : '0 B'}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm text-muted-foreground">Upload</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {traffic.upload > 0 ? `${(traffic.upload / 1024 / 1024).toFixed(1)} MB` : '0 B'}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm text-muted-foreground">Duration</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {duration > 0 ? `${Math.floor(duration / 60)}m ${duration % 60}s` : '0:00'}
          </p>
        </div>
      </div>

      <div className="w-full max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Server Location
          </label>
          <select
            value={selectedServer}
            onChange={(e) => setSelectedServer(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option>Frankfurt, Germany</option>
            <option>Amsterdam, Netherlands</option>
            <option>New York, USA</option>
            <option>Tokyo, Japan</option>
            <option>London, UK</option>
            <option>Singapore</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Protocol
          </label>
          <select
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option>WireGuard</option>
            <option>OpenVPN</option>
            <option>Xray Reality</option>
            <option>VLESS</option>
          </select>
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-gray-400'}`} />
            <p className="text-sm text-muted-foreground">
              {status === 'connected' ? `Connected to ${selectedServer}` : 'Not connected'}
            </p>
          </div>
          {status === 'connected' && (
            <p className="mt-1 text-xs text-muted-foreground">Protocol: {protocol}</p>
          )}
        </div>
      </div>
    </div>
  );
}
