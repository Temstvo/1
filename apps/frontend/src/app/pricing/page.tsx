'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api, { apiErrorMessage } from '@/lib/api';

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
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

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

  function botBuyUrl(planId: string) {
    return `https://t.me/AppiVPNBot?start=buy_${planId}`;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight">
            APPI·VPN
          </Link>
          <div className="flex gap-4 text-sm">
            <a
              href="https://t.me/AppiVPNBot"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-5 py-2"
            >
              Открыть бота
            </a>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-14">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-center">Тарифы</h1>
        <p className="text-gray-400 text-center mt-3 mb-4">
          Оплата — в Telegram-боте. Нажми «Оплатить в боте» — бот выдаст ссылку ЮKassa/СБП.
        </p>
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
                <a
                  href={botBuyUrl(p.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full py-2.5 mt-4 text-center block"
                >
                  Оплатить в боте
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
