'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useTranslations } from '@/lib/i18n';

interface Device {
  id: string;
  name: string;
  platform: string;
  osVersion?: string;
  lastIp: string;
  lastSeen: string;
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин. назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  return `${days} дн. назад`;
}

function deviceIcon(platform: string) {
  const p = (platform || '').toLowerCase();
  if (p.includes('mac') || p.includes('iphone') || p.includes('ios')) {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    );
  }
  if (p.includes('android')) {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5z" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 7.41A2.25 2.25 0 012.25 5.495V5.25" />
    </svg>
  );
}

export default function DevicesPage() {
  const { t } = useTranslations();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    api.get('/devices')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.devices || [];
        setDevices(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (id: string) => {
    if (!confirm('Удалить устройство?')) return;
    setRemoving(id);
    try {
      await api.delete(`/devices/${id}`);
      setDevices((prev) => prev.filter((d) => d.id !== id));
    } catch {}
    setRemoving(null);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('devices_title')}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {devices.length > 0
            ? `Подключено ${devices.length} устройств`
            : 'Нет подключённых устройств'}
        </p>
      </div>

      {devices.length === 0 ? (
        <div className="bg-[#111] border border-white/5 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0v.243" />
            </svg>
          </div>
          <p className="text-sm text-gray-400">Подключите устройство через VPN-клиент</p>
        </div>
      ) : (
        <div className="space-y-3">
          {devices.map((device) => (
            <div key={device.id} className="bg-[#111] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                  {deviceIcon(device.platform)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{device.name || device.platform}</p>
                  <p className="text-xs text-gray-500">{device.platform} · {device.lastIp || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-600">{timeAgo(device.lastSeen)}</span>
                <button
                  onClick={() => handleRemove(device.id)}
                  disabled={removing === device.id}
                  className="px-3 py-1.5 text-xs text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  {removing === device.id ? '...' : 'Удалить'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
