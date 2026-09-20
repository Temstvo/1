'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api, { apiErrorMessage } from '@/lib/api';
import { useAuth, newIdempotencyKey } from '@/lib/auth';

interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  currency: string;
  duration: number;
  deviceLimit?: number;
  isActive?: boolean;
}

export default function PricingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [paying, setPaying] = useState<string | null>(null);
  const [payErr, setPayErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/plans');
        const list = Array.isArray(data) ? data : (data?.plans ?? []);
        setPlans(list.filter((p: Plan) => p.isActive !== false));
      } catch (e: any) {
        setErr(apiErrorMessage(e, 'Не удалось загрузить тарифы'));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function buy(planId: string) {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?next=${encodeURIComponent('/pricing')}`);
      return;
    }
    setPaying(planId);
    setPayErr(null);
    try {
      const { data } = await api.post(
        '/payments/checkout',
        { planId, provider: 'YOOKASSA' },
        { headers: { 'Idempotency-Key': newIdempotencyKey() } },
      );
      if (data?.confirmationUrl) {
        window.location.href = data.confirmationUrl;
      } else {
        setPayErr('Платёжная ссылка не получена. Попробуйте позже.');
      }
    } catch (e: any) {
      setPayErr(apiErrorMessage(e, 'Не удалось создать платёж'));
    } finally {
      setPaying(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight">
            APPI·VPN
          </Link>
          <div className="flex gap-4 text-sm">
            {user ? (
              <Link href="/dashboard" className="btn-primary px-5 py-2">
                Кабинет
              </Link>
            ) : (
              <Link href="/login" className="btn-outline px-5 py-2">
                Войти
              </Link>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-14">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-center">Тарифы</h1>
        <p className="text-gray-400 text-center mt-3 mb-4">
          Оплата через ЮKassa. Подписка активируется автоматически после оплаты.
        </p>
        {process.env.NEXT_PUBLIC_SBP_QR_URL && (
          <div className="max-w-xl mx-auto mb-10 card p-5 text-center">
            <div className="font-bold mb-1">Быстрая оплата по СБП</div>
            <p className="text-gray-400 text-sm mb-4">
              После оплаты напишите в бота — доступ активируем вручную.
            </p>
            <a
              href={process.env.NEXT_PUBLIC_SBP_QR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-6 py-2.5 inline-block"
            >
              📱 Оплатить по СБП
            </a>
          </div>
        )}
        {payErr && (
          <div className="max-w-xl mx-auto mb-6 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-center">
            {payErr}
          </div>
        )}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-6 bg-white/10 rounded w-2/3 mb-3" />
                <div className="h-9 bg-white/10 rounded w-1/2 mb-4" />
                <div className="h-10 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : err ? (
          <div className="text-center text-red-400 mt-10">{err}</div>
        ) : plans.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            Тарифы пока недоступны. Загляните позже.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {plans.map((p) => (
              <div key={p.id} className="card p-6 flex flex-col">
                <h3 className="font-bold text-lg">{p.name}</h3>
                {p.description && (
                  <p className="text-gray-400 text-sm mt-1 mb-4">{p.description}</p>
                )}
                <div className="text-3xl font-bold mt-auto">{Number(p.price).toFixed(0)} ₽</div>
                <div className="text-gray-400 text-sm mb-1">
                  {p.duration >= 365
                    ? '12 месяцев'
                    : p.duration >= 180
                      ? '6 месяцев'
                      : p.duration >= 90
                        ? '3 месяца'
                        : '1 месяц'}
                  {typeof p.deviceLimit === 'number' && ` · ${p.deviceLimit} устр.`}
                </div>
                <button
                  onClick={() => buy(p.id)}
                  disabled={paying !== null}
                  className="btn-primary w-full py-2.5 mt-4 disabled:opacity-50"
                >
                  {paying === p.id ? 'Создаём платёж…' : user ? 'Оплатить' : 'Выбрать'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
