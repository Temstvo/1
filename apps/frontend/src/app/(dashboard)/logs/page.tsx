'use client';

import { useState } from 'react';
import { useTranslations } from '@/lib/i18n';

type LogTab = 'main' | 'core' | 'tunnel' | 'antifilter' | 'subscription' | 'service';

const mockLogs: Record<LogTab, string[]> = {
  main: [],
  core: [],
  tunnel: [],
  antifilter: [],
  subscription: [],
  service: [],
};

export default function LogsPage() {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState<LogTab>('main');

  const logTabs: { id: LogTab; label: string }[] = [
    { id: 'main', label: t('logs_main') },
    { id: 'core', label: t('logs_core') },
    { id: 'tunnel', label: t('logs_tunnel') },
    { id: 'antifilter', label: t('logs_antifilter') },
    { id: 'subscription', label: t('logs_subscription') },
    { id: 'service', label: t('logs_service') },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[hsl(var(--border))]">
        <h1 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-1">{t('logs_title')}</h1>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {t('logs_hint')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[hsl(var(--border))] px-4 overflow-x-auto">
        {logTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-0.5">
        {mockLogs[activeTab].length === 0 ? (
          <div className="text-center text-[hsl(var(--muted-foreground))] py-12">
            {t('logs_empty') || 'No logs'}
          </div>
        ) : (
          mockLogs[activeTab].map((entry, i) => (
            <div key={i} className="text-[hsl(var(--muted-foreground))] leading-relaxed py-0.5">
              {entry}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
