'use client';

import { useState } from 'react';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export function VpnConnector() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [selectedServer, setSelectedServer] = useState('Frankfurt, Germany');
  const [protocol, setProtocol] = useState('WireGuard');

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
    <div className="flex flex-col items-center space-y-10 py-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">VPN Connection</h2>
        <p className="mt-2 text-gray-400">
          {status === 'connected'
            ? 'Connected to VPN'
            : status === 'connecting'
            ? 'Establishing connection...'
            : 'Tap to connect'}
        </p>
      </div>

      <div className="relative">
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
          status === 'connected'
            ? 'bg-green-500/20 blur-2xl scale-125'
            : status === 'connecting'
            ? 'bg-yellow-500/20 blur-2xl scale-125 animate-pulse'
            : 'bg-purple-500/10 blur-2xl scale-110'
        }`} />
        <button
          onClick={handleConnect}
          disabled={status === 'connecting'}
          className={`relative h-48 w-48 rounded-full transition-all duration-500 ${
            status === 'connected'
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl shadow-green-500/30'
              : status === 'connecting'
              ? 'bg-gradient-to-br from-yellow-500 to-orange-500 shadow-2xl shadow-yellow-500/30'
              : 'bg-gradient-to-br from-purple-600 to-cyan-500 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105'
          }`}
        >
          <div className="flex flex-col items-center justify-center h-full">
            {status === 'connected' ? (
              <>
                <svg className="h-16 w-16 text-white mb-2" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white text-sm font-semibold">Connected</span>
              </>
            ) : status === 'connecting' ? (
              <>
                <svg className="h-16 w-16 text-white mb-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-white text-sm font-semibold">Connecting</span>
              </>
            ) : (
              <>
                <svg className="h-16 w-16 text-white mb-2" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
                </svg>
                <span className="text-white text-sm font-semibold">Connect</span>
              </>
            )}
          </div>
        </button>
      </div>

      <div className="grid w-full max-w-md grid-cols-3 gap-4 text-center">
        <div className="rounded-2xl border border-[#222] bg-[#111] p-4">
          <p className="text-xs text-gray-500 mb-1">Download</p>
          <p className="text-lg font-bold text-white">0 B</p>
        </div>
        <div className="rounded-2xl border border-[#222] bg-[#111] p-4">
          <p className="text-xs text-gray-500 mb-1">Upload</p>
          <p className="text-lg font-bold text-white">0 B</p>
        </div>
        <div className="rounded-2xl border border-[#222] bg-[#111] p-4">
          <p className="text-xs text-gray-500 mb-1">Duration</p>
          <p className="text-lg font-bold text-white">0:00</p>
        </div>
      </div>

      <div className="w-full max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Server Location
          </label>
          <select
            value={selectedServer}
            onChange={(e) => setSelectedServer(e.target.value)}
            className="block w-full rounded-xl border border-gray-700/50 bg-[#111] px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
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
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Protocol
          </label>
          <select
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            className="block w-full rounded-xl border border-gray-700/50 bg-[#111] px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
          >
            <option>WireGuard</option>
            <option>OpenVPN</option>
            <option>Xray Reality</option>
            <option>VLESS</option>
          </select>
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[#222] bg-[#111] p-4">
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${
              status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
            }`} />
            <p className="text-sm text-gray-300">
              {status === 'connected' ? `Connected to ${selectedServer}` : 'Not connected'}
            </p>
          </div>
          {status === 'connected' && (
            <p className="mt-2 ml-5.5 text-xs text-gray-500">Protocol: {protocol}</p>
          )}
        </div>
      </div>
    </div>
  );
}
