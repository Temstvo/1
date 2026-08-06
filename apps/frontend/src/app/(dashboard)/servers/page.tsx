'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Server {
  id: string;
  name: string;
  country: string;
  city?: string;
  flag?: string;
  ip?: string;
  status: string;
  cpu?: number;
  ram?: number;
  load?: number;
  latency?: number;
  users?: number;
  protocols?: string[];
}

export default function ServersPage() {
  const { t } = useTranslations();
  const router = useRouter();
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    api.get('/servers')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.servers || [];
        setServers(list);
      })
      .catch(() => setServers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleConnect = async (serverId: string) => {
    setConnecting(serverId);
    try {
      const res = await api.post('/vpn/connect', { serverId });
      router.push('/vpn');
    } catch {
      setConnecting(null);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (servers.length === 0) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-[#111] border border-white/5 rounded-2xl p-8 text-center">
          <div className="text-3xl mb-3">🖥️</div>
          <p className="text-sm text-gray-400">Серверы не найдены</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('servers_title')}</h1>
        <p className="text-sm text-gray-500 mt-1">Выберите сервер для подключения</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {servers.map((server) => {
          const isOnline = server.status === 'online';
          const load = server.load ?? server.cpu ?? 0;
          return (
            <div key={server.id} className="bg-[#111] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{server.flag || '🌍'}</span>
                  <div>
                    <h3 className="font-semibold text-white">{server.name}</h3>
                    <p className="text-xs text-gray-500">{server.country}{server.city ? ` · ${server.city}` : ''}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  isOnline ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {isOnline ? 'Онлайн' : 'Обслуживание'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wide">Нагрузка</p>
                  <p className="text-sm font-medium text-white">{load}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wide">Задержка</p>
                  <p className="text-sm font-medium text-white">{server.latency ?? '—'} ms</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wide">Онлайн</p>
                  <p className="text-sm font-medium text-white">{server.users ?? '—'}</p>
                </div>
              </div>
              <button
                onClick={() => handleConnect(server.id)}
                disabled={!isOnline || connecting === server.id}
                className="w-full rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {connecting === server.id ? 'Подключение...' : isOnline ? 'Подключиться' : 'Недоступен'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
