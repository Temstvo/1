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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">VPN</h1>
        <p className="text-muted-foreground">Connect to VPN servers and manage your configurations</p>
      </div>

      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {[
          { id: 'connect', label: 'Connect' },
          { id: 'servers', label: 'Servers' },
          { id: 'configs', label: 'Configurations' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
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
          <p className="text-sm text-muted-foreground">
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
