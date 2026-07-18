'use client';

import { useTranslations } from '@/lib/i18n';

export default function TrafficPage() {
  const { t } = useTranslations();

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">{t('stats_title')}</h1>

      {/* Server Info */}
      <div>
        <h2 className="happ-section-header">{t('stats_server')}</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="happ-settings-row">
            <span className="happ-settings-label">{t('stats_start_time')}</span>
            <span className="happ-settings-value">18:32:46</span>
          </div>
          <div className="happ-settings-row">
            <span className="happ-settings-label">{t('stats_connection_time')}</span>
            <span className="happ-settings-value">10:11:41</span>
          </div>
        </div>
      </div>

      {/* Proxy Bandwidth */}
      <div>
        <h2 className="happ-section-header">{t('stats_proxy_bandwidth')}</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="happ-settings-row">
            <span className="happ-settings-label">{t('stats_download')}</span>
            <span className="happ-settings-value text-green-400">205.0 B/s</span>
          </div>
          <div className="happ-settings-row">
            <span className="happ-settings-label">{t('stats_upload')}</span>
            <span className="happ-settings-value text-blue-400">4.5 KB/s</span>
          </div>
        </div>
      </div>

      {/* Data Usage via Proxy */}
      <div>
        <h2 className="happ-section-header">{t('stats_data_proxy')}</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="happ-settings-row">
            <span className="happ-settings-label">{t('stats_download')}</span>
            <span className="happ-settings-value">10.1 GB</span>
          </div>
          <div className="happ-settings-row">
            <span className="happ-settings-label">{t('stats_upload')}</span>
            <span className="happ-settings-value">96.6 MB</span>
          </div>
        </div>
      </div>

      {/* Direct Usage */}
      <div>
        <h2 className="happ-section-header">{t('stats_data_direct')}</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="happ-settings-row">
            <span className="happ-settings-label">{t('stats_direct_download')}</span>
            <span className="happ-settings-value">0.0 B</span>
          </div>
          <div className="happ-settings-row">
            <span className="happ-settings-label">{t('stats_direct_upload')}</span>
            <span className="happ-settings-value">0.0 B</span>
          </div>
        </div>
      </div>
    </div>
  );
}
