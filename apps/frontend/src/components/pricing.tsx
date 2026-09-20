'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api, { apiErrorMessage } from '@/lib/api';
export type Plan = {
  id: string;
  name: string;
  price: number | string;
  currency: string;
  duration: number;
  description?: string;
  features: string[];
  deviceLimit: number;
  trafficLimit: number | string;
};
export default function Pricing({ choose }: { choose?: (plan: Plan) => void }) {
  const [plans, setPlans] = useState<Plan[]>([]),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true);
    setError('');
    try {
      setPlans((await api.get('/plans')).data);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  if (loading)
    return (
      <div className="pricing-grid" aria-label="Загрузка тарифов">
        {[1, 2, 3].map((n) => (
          <div className="card skeleton" key={n} />
        ))}
      </div>
    );
  if (error)
    return (
      <div className="notice" role="alert">
        {error}{' '}
        <button className="text-button" onClick={load}>
          Повторить
        </button>
      </div>
    );
  if (!plans.length)
    return <p className="notice">Тарифы пока не опубликованы. Свяжитесь с поддержкой.</p>;
  return (
    <div className="pricing-grid">
      {plans.map((p, i) => (
        <article className={'price-card ' + (i === 1 ? 'featured' : '')} key={p.id}>
          <div className="price-top">
            <span>{p.name}</span>
            {i === 1 && <span className="pill">Дольше вместе</span>}
          </div>
          <h3>
            {p.duration} <span>дней доступа</span>
          </h3>
          <div className="price">
            {new Intl.NumberFormat('ru-RU', {
              style: 'currency',
              currency: p.currency,
              maximumFractionDigits: 0,
            }).format(Number(p.price))}
          </div>
          <p>{p.description || 'Персональное подключение к VPN'}</p>
          <ul>
            <li>VLESS Reality</li>
            <li>
              {Number(p.trafficLimit) === 0
                ? 'Без лимита трафика'
                : Math.round(Number(p.trafficLimit) / 1024 ** 3) + ' ГБ трафика'}
            </li>
            <li>Конфигурация в личном кабинете</li>
            <li>Без автоматических списаний</li>
          </ul>
          {choose ? (
            <button className="button wide" onClick={() => choose(p)}>
              Выбрать тариф ↗
            </button>
          ) : (
            <Link className="button wide" href="/dashboard">
              Выбрать тариф ↗
            </Link>
          )}
        </article>
      ))}
    </div>
  );
}
