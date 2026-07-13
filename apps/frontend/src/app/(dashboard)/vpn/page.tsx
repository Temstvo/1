'use client';

import { useState } from 'react';
import { VpnConnector } from '@/components/vpn/vpn-connector';
import { ServerList } from '@/components/vpn/server-list';
import { ConfigDownload } from '@/components/vpn/config-download';

type Tab = 'connect' | 'servers' | 'configs';

export default function VpnPage() {
  const [activeTab, setActiveTab] = useState<Tab>('connect');
  const [selectedServer, setSelectedServer] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">VPN</h1>
        <p className="text-gray-400">Connect to VPN servers and manage your configurations</p>
      </div>

      <div className="flex gap-1 rounded-2xl bg-[#111] p-1.5 border border-[#222]">
        {[
          { id: 'connect', label: 'Connect', icon: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3' },
          { id: 'servers', label: 'Servers', icon: 'M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3' },
          { id: 'configs', label: 'Configs', icon: 'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                : 'text-gray-400 hover:text-white hover:bg-[#222]'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'connect' && <VpnConnector />}

      {activeTab === 'servers' && (
        <ServerList
          onSelect={(server) => {
            setSelectedServer(server.id);
            setActiveTab('connect');
          }}
        />
      )}

      {activeTab === 'configs' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
            Download VPN client configurations for your devices
          </p>
          <ConfigDownload configId="wg-abc123" protocol="WireGuard" />
          <ConfigDownload configId="ovpn-def456" protocol="OpenVPN" />
          <ConfigDownload configId="xray-ghi789" protocol="Xray Reality" />
        </div>
      )}
    </div>
  );
}
