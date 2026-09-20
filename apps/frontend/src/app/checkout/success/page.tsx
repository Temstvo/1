'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api, { apiErrorMessage } from '@/lib/api';
import { Shell } from '@/components/site';
function Status() {
  const params = useSearchParams(),
    id = params.get('paymentId');
  const [status, setStatus] = useState(''),
    [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;
    async function poll() {
      if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
        setError('Не указан корректный номер платежа.');
        return;
      }
      try {
        const { data } = await api.get('/payments/' + id);
        if (!alive) return;
        setStatus(data.status);
        if (data.status === 'PENDING' && ++attempts < 30) timer = setTimeout(poll, 5000);
      } catch (e) {
        if (alive) setError(apiErrorMessage(e));
      }
    }
    void poll();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [id]);
  return (
    <div className="auth-card">
      <p className="eyebrow">СТАТУС ПЛАТЕЖА</p>
      <h1>
        {status === 'COMPLETED'
          ? 'Оплата подтверждена.'
          : status === 'PENDING'
            ? 'Ждём подтверждения.'
            : status
              ? 'Платёж: ' + status
              : 'Проверяем платёж…'}
      </h1>
      <p>
        {status === 'COMPLETED'
          ? 'Подписка активирована. Конфигурация появится в кабинете после настройки на сервере.'
          : 'Возврат со страницы оплаты сам по себе не подтверждает платёж. Мы проверяем статус вашего заказа на сервере.'}
      </p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <Link href="/dashboard" className="button">
        Вернуться в кабинет ↗
      </Link>
    </div>
  );
}
export default function Page() {
  return (
    <Shell>
      <Suspense fallback={<p>Загрузка…</p>}>
        <Status />
      </Suspense>
    </Shell>
  );
}
