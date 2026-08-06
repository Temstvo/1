'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n';
import api from '@/lib/api';

function formatBytes(bytes: number): string {
  if (!bytes) return '0 Б';
  const units = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 100 ? 0 : 1)} ${units[i]}`;
}

function formatDuration(seconds: number): string {
  if (!seconds) return '—';
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h} ч ${m} мин`;
  if (m > 0) return `${m} мин ${s % 60} сек`;
  return `${s} сек`;
}

export default function TrafficPage() {
  const { t } = useTranslations();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/traffic/current')
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const rows = [
    { label: t('stats_download'), value: formatBytes(stats?.download || stats?.totalDownload || 0), color: 'text-green-400' },
    { label: t('stats_upload'), value: formatBytes(stats?.upload || stats?.totalUpload || 0), color: 'text-blue-400' },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('stats_title')}</h1>
        <p className="text-sm text-gray-500 mt-1">Статистика использования</p>
      </div>

      {!stats ? (
        <div className="bg-[#111] border border-white/5 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-3">📊</div>
          <p className="text-sm text-gray-400">Нет данных — подключитесь к VPN</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
              <div className="text-xs text-gray-500 mb-2">{t('stats_download')}</div>
              <div className="text-xl font-bold text-green-400">{formatBytes(stats.download || stats.totalDownload || 0)}</div>
            </div>
            <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
              <div className="text-xs text-gray-500 mb-2">{t('stats_upload')}</div>
              <div className="text-xl font-bold text-blue-400">{formatBytes(stats.upload || stats.totalUpload || 0)}</div>
            </div>
          </div>

          {stats.limit ? (
            <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">{t('stats_data_proxy')}</span>
                <span className="text-white font-medium">{formatBytes(stats.total || 0)} / {formatBytes(stats.limit)}</span>
              </div>
              <div className="h-2 rounded-full bg-[#222]">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                  style={{ width: `${Math.min(100, Math.round(((stats.total || 0) / stats.limit) * 100))}%` }}
                />
              </div>
            </div>
          ) : null}

          <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between px-5 py-4 border-b border-white/5 last:border-0">
                <span className="text-sm text-gray-400">{r.label}</span>
                <span className={`text-sm font-medium ${r.color}`}>{r.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
