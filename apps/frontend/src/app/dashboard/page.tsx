'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api, { apiErrorMessage } from '@/lib/api';
import { useAuth, newIdempotencyKey } from '@/lib/auth';

function fmtDate(v?: string) {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function daysLeft(expiresAt?: string) {
  if (!expiresAt) return null;
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000));
}

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [sub, setSub] = useState<any>(null);
  const [vpn, setVpn] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [renewing, setRenewing] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [s, v, p] = await Promise.all([
        api
          .get('/subscriptions/current')
          .then((r) => r.data)
          .catch(() => null),
        api
          .get('/vpn/status')
          .then((r) => r.data)
          .catch(() => null),
        api
          .get('/payments')
          .then((r) => r.data)
          .catch(() => []),
      ]);
      setSub(s);
      setVpn(v);
      setPayments(Array.isArray(p) ? p : (p?.payments ?? []));
      if (s?.status === 'ACTIVE') {
        const c = await api
          .get('/vpn/config/auto')
          .then((r) => r.data)
          .catch(() => null);
        setConfig(c);
      }
    } catch (e: any) {
      setErr(apiErrorMessage(e, 'Не удалось загрузить кабинет'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login?next=%2Fdashboard');
    if (!authLoading && user) load();
  }, [authLoading, user, router, load]);

  async function renew() {
    setRenewing(true);
    try {
      const { data } = await api.post(
        '/subscriptions/renew',
        {},
        { headers: { 'Idempotency-Key': newIdempotencyKey() } },
      );
      if (data?.confirmationUrl) window.location.href = data.confirmationUrl;
      else if (data?.paymentId) router.push(`/payment/success?id=${data.paymentId}`);
    } catch (e: any) {
      setErr(apiErrorMessage(e, 'Не удалось создать продление'));
    } finally {
      setRenewing(false);
    }
  }

  function copyConfig() {
    const text = config?.uri || config?.subscriptionUrl || config?.url || JSON.stringify(config);
    if (!text) return;
    navigator.clipboard
      .writeText(typeof text === 'string' ? text : JSON.stringify(text))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  }

  if (authLoading || (loading && !err)) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-gray-400">Загружаем кабинет…</div>
      </div>
    );
  }

  const left = sub ? daysLeft(sub.expiresAt) : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight">
            APPI·VPN
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400 hidden sm:inline">{user?.email}</span>
            <button
              onClick={async () => {
                await logout();
                router.push('/');
              }}
              className="btn-outline px-4 py-2"
            >
              Выйти
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-10 space-y-4">
        {err && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            {err}{' '}
            <button onClick={load} className="underline ml-2">
              Повторить
            </button>
          </div>
        )}

        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">Подписка</h2>
          {!sub ? (
            <div>
              <p className="text-gray-400 text-sm mb-4">Активной подписки нет.</p>
              <Link href="/pricing" className="btn-primary px-6 py-2.5 inline-block">
                Выбрать тариф
              </Link>
            </div>
          ) : (
            <div className="space-y-1.5 text-sm">
              <div>
                Тариф: <b>{sub.plan?.name ?? '—'}</b>
              </div>
              <div>
                Статус:{' '}
                <b className={sub.status === 'ACTIVE' ? 'text-green-400' : 'text-yellow-400'}>
                  {sub.status === 'ACTIVE' ? 'Активна' : sub.status}
                </b>
              </div>
              <div>
                Истекает: <b>{fmtDate(sub.expiresAt)}</b>
                {left !== null && ` (осталось ${left} дн.)`}
              </div>
              <div className="pt-3 flex flex-wrap gap-2">
                <button
                  onClick={renew}
                  disabled={renewing}
                  className="btn-primary px-6 py-2.5 disabled:opacity-50"
                >
                  {renewing ? 'Создаём…' : 'Продлить'}
                </button>
                <Link href="/pricing" className="btn-outline px-6 py-2.5">
                  Сменить тариф
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">VPN-доступ</h2>
          {!sub || sub.status !== 'ACTIVE' ? (
            <p className="text-gray-400 text-sm">Оплатите подписку — конфиг появится здесь.</p>
          ) : !vpn ? (
            <p className="text-gray-400 text-sm">Статус недоступен.</p>
          ) : (
            <div className="space-y-1.5 text-sm">
              <div>
                Статус: <b>{vpn.status}</b>
              </div>
              {vpn.expiresAt && (
                <div>
                  Доступен до: <b>{fmtDate(vpn.expiresAt)}</b>
                </div>
              )}
              {config ? (
                <div className="pt-3">
                  <p className="text-gray-400 mb-2">
                    Протокол: {config.protocol ?? 'VLESS Reality'}. Скопируйте конфиг в ваш клиент:
                  </p>
                  <code className="block text-xs bg-white/5 border border-white/10 rounded-lg p-3 break-all max-h-32 overflow-auto">
                    {typeof config === 'string'
                      ? config
                      : config.uri ||
                        config.subscriptionUrl ||
                        JSON.stringify(config).slice(0, 500)}
                  </code>
                  <button onClick={copyConfig} className="btn-outline px-5 py-2 mt-3">
                    {copied ? 'Скопировано!' : 'Скопировать конфиг'}
                  </button>
                </div>
              ) : (
                <p className="text-yellow-400 text-sm pt-2">
                  {vpn.status === 'PENDING'
                    ? 'Доступ настраивается — обновите страницу через минуту.'
                    : 'Конфиг пока недоступен.'}{' '}
                  <button onClick={load} className="underline">
                    Обновить
                  </button>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-lg mb-4">История платежей</h2>
          {payments.length === 0 ? (
            <p className="text-gray-400 text-sm">Платежей пока нет.</p>
          ) : (
            <div className="space-y-2 text-sm">
              {payments.slice(0, 20).map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border-b border-white/5 pb-2"
                >
                  <div>
                    <div>{p.description || `Платёж ${String(p.id).slice(0, 8)}`}</div>
                    <div className="text-gray-500 text-xs">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString('ru-RU') : ''} ·{' '}
                      {p.amount} {p.currency}
                    </div>
                  </div>
                  <span
                    className={
                      p.status === 'COMPLETED'
                        ? 'text-green-400'
                        : p.status === 'PENDING'
                          ? 'text-yellow-400'
                          : 'text-gray-400'
                    }
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
