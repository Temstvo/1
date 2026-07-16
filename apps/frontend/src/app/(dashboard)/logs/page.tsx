'use client';

import { useState } from 'react';

type LogTab = 'main' | 'core' | 'tunnel' | 'antifilter' | 'subscription' | 'service';

const logTabs: { id: LogTab; label: string }[] = [
  { id: 'main', label: 'Main Log' },
  { id: 'core', label: 'Core Log' },
  { id: 'tunnel', label: 'Tunnel Log' },
  { id: 'antifilter', label: 'AntiFilter Log' },
  { id: 'subscription', label: 'Subscription Log' },
  { id: 'service', label: 'Service Log' },
];

const mockLogs: Record<LogTab, string[]> = {
  main: [
    '[15.07 23:54:05] [SUBSCRIPTION]: Subscription 1865376919 update already in progress',
    '[15.07 23:54:06] [SUBSCRIPTION]: Failed to update subscription - WHIT: Remote host closed connection',
    '[15.07 23:54:06] [SUBSCRIPTION]: Saved 4 subscriptions to database',
    '[16.07 00:27:00] [SUBSCRIPTION]: Auto-updating 1 subscription(s)',
    '[16.07 00:27:01] [SUBSCRIPTION]: - WHIT interval: 1 hour(s)',
    '[16.07 00:27:01] [SUBSCRIPTION]: Failed to update subscription - WHIT: Remote host closed connection',
    '[16.07 00:54:00] [SUBSCRIPTION]: Auto-updating 1 subscription(s)',
    '[16.07 00:54:05] [SUBSCRIPTION]: Saved 4 subscriptions to database',
    '[16.07 01:27:00] [SUBSCRIPTION]: Auto-updating 1 subscription(s)',
    '[16.07 01:27:05] [SUBSCRIPTION]: Saved 4 subscriptions to database',
    '[16.07 02:27:00] [SUBSCRIPTION]: Auto-updating 1 subscription(s)',
    '[16.07 02:54:00] [SUBSCRIPTION]: Auto-updating 1 subscription(s)',
    '[16.07 03:27:00] [SUBSCRIPTION]: Auto-updating 1 subscription(s)',
  ],
  core: [
    '[15.07 23:54:05] [CORE]: Started successfully',
    '[15.07 23:54:06] [CORE]: Configuration loaded',
    '[16.07 00:27:00] [CORE]: Health check passed',
    '[16.07 00:54:00] [CORE]: Health check passed',
    '[16.07 01:27:00] [CORE]: Health check passed',
  ],
  tunnel: [
    '[15.07 23:54:05] [TUNNEL]: TUN device created',
    '[15.07 23:54:06] [TUNNEL]: Routes configured',
    '[16.07 00:27:00] [TUNNEL]: Traffic routed successfully',
  ],
  antifilter: [
    '[15.07 23:54:05] [ANTIFILTER]: Rules loaded (1250 entries)',
    '[16.07 00:27:00] [ANTIFILTER]: Rules refreshed',
  ],
  subscription: [
    '[15.07 23:54:05] [SUB]: Subscription 1865376919 updated',
    '[15.07 23:54:06] [SUB]: Subscription -1597392755 updated',
    '[16.07 00:27:01] [SUB]: Failed to update - connection refused',
    '[16.07 00:54:05] [SUB]: Saved 4 subscriptions',
  ],
  service: [
    '[15.07 23:54:05] [SERVICE]: Background service started',
    '[15.07 23:54:06] [SERVICE]: Auto-update scheduler active',
    '[16.07 00:27:00] [SERVICE]: Timer triggered auto-update',
  ],
};

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState<LogTab>('main');

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[var(--border)]">
        <h1 className="text-lg font-semibold text-[var(--foreground)] mb-1">Logs</h1>
        <p className="text-xs text-[var(--muted-foreground)]">
          Press Ctrl+R to create a report
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] px-4 overflow-x-auto">
        {logTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-0.5">
        {mockLogs[activeTab].map((entry, i) => (
          <div key={i} className="text-[var(--muted-foreground)] leading-relaxed py-0.5">
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
}
