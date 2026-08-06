'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Subscription {
  id: string;
  status: string;
  plan: { name: string; price: number; deviceLimit: number; trafficLimit: number };
  expiresAt: string;
}

interface TrafficData {
  download: number;
  upload: number;
  total: number;
  limit: number;
}

interface Device {
  id: string;
  name: string;
  platform: string;
  lastSeen: string;
  lastIp: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0';
  if (bytes >= 1099511627776) return (bytes / 1099511627776).toFixed(1) + ' ТБ';
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' ГБ';
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' МБ';
  return (bytes / 1024).toFixed(0) + ' КБ';
}

function daysUntil(date: string): number {
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export default function DashboardPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [traffic, setTraffic] = useState<TrafficData | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/subscriptions/current').catch(() => ({ data: null })),
      api.get('/traffic/current').catch(() => ({ data: null })),
      api.get('/devices').catch(() => ({ data: [] })),
    ]).then(([subRes, trafRes, devRes]) => {
      setSubscription(subRes.data);
      if (trafRes.data) {
        setTraffic(trafRes.data);
      }
      const devList = Array.isArray(devRes.data) ? devRes.data : devRes.data?.devices || [];
      setDevices(devList);
    }).finally(() => setLoading(false));
  }, []);

  const trafficPct = traffic && traffic.limit > 0
    ? Math.min(100, Math.round((traffic.total / traffic.limit) * 100))
    : 0;
  const trafficRemaining = traffic && traffic.limit > 0
    ? traffic.limit - traffic.total
    : 0;

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Главная</h1>
        <p className="text-gray-400 text-sm">Обзор вашего аккаунта.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/5 bg-[#111] p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500">Тариф</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              subscription?.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' :
              subscription?.status === 'TRIAL' ? 'bg-blue-500/10 text-blue-400' :
              'bg-gray-500/10 text-gray-500'
            }`}>
              {subscription?.status === 'ACTIVE' ? 'Активен' : subscription?.status || 'Нет'}
            </span>
          </div>
          <p className="text-xl font-bold text-white">{subscription?.plan?.name || '—'}</p>
          {subscription ? (
            <p className="text-xs text-gray-500 mt-1">Осталось {daysUntil(subscription.expiresAt)} дн.</p>
          ) : (
            <Link href="/checkout" className="text-xs text-purple-400 hover:text-purple-300 mt-1 inline-block">Выбрать тариф →</Link>
          )}
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#111] p-5">
          <p className="text-xs text-gray-500 mb-3">Трафик</p>
          <p className="text-xl font-bold text-white">{formatBytes(traffic?.total || 0)}</p>
          {traffic && traffic.limit > 0 ? (
            <>
              <div className="mt-3 h-1.5 rounded-full bg-[#222]">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all"
                  style={{ width: `${trafficPct}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Осталось {formatBytes(trafficRemaining)}</p>
            </>
          ) : (
            <p className="text-xs text-gray-500 mt-1">Без ограничений</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#111] p-5">
          <p className="text-xs text-gray-500 mb-3">Устройства</p>
          <p className="text-xl font-bold text-white">{devices.length}{subscription?.plan?.deviceLimit ? ` / ${subscription.plan.deviceLimit}` : ''}</p>
          <p className="text-xs text-gray-500 mt-1">
            {subscription?.plan?.deviceLimit
              ? `${Math.max(0, subscription.plan.deviceLimit - devices.length)} слот${Math.max(0, subscription.plan.deviceLimit - devices.length) === 1 ? '' : 'ов'} свободно`
              : 'Подключено'}
          </p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#111] p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500">Статус</p>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-gray-500" />
              <span className="text-xs text-gray-500">Ожидание</span>
            </div>
          </div>
          <p className="text-xl font-bold text-white">VPN</p>
          <p className="text-xs text-gray-500 mt-1">Подключите через приложение</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#111] p-6">
        <h3 className="mb-4 text-base font-semibold text-white">Быстрые действия</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <Link href="/vpn" className="flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-[#0a0a0a] px-4 py-3.5 text-sm font-medium text-gray-300 hover:bg-purple-600/20 hover:border-purple-500/50 hover:text-purple-400 transition-all">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
            </svg>
            Конфиги VPN
          </Link>
          <Link href="/downloads" className="flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-[#0a0a0a] px-4 py-3.5 text-sm font-medium text-gray-300 hover:bg-purple-600/20 hover:border-purple-500/50 hover:text-purple-400 transition-all">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Скачать приложение
          </Link>
          <Link href="/subscription" className="flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-[#0a0a0a] px-4 py-3.5 text-sm font-medium text-gray-300 hover:bg-purple-600/20 hover:border-purple-500/50 hover:text-purple-400 transition-all">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
            Управление тарифом
          </Link>
        </div>
      </div>
    </div>
  );
}
