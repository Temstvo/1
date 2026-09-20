'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';

function SuccessInner() {
  const params = useSearchParams();
  const id = params.get('id');
  const [status, setStatus] = useState<string | null>(null);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (!id) return;
    let stop = false;
    (async () => {
      for (let i = 0; i < 10 && !stop; i++) {
        try {
          const { data } = await api.get(`/payments/${id}`);
          setStatus(data?.status ?? null);
          if (data?.status === 'COMPLETED') break;
        } catch {
          /* webhook ещё не дошёл — ждём */
        }
        await new Promise((r) => setTimeout(r, 3000));
        setTries((t) => t + 1);
      }
    })();
    return () => {
      stop = true;
    };
  }, [id, tries > 100]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="card max-w-md w-full p-8 text-center space-y-4">
        <div className="text-5xl">✅</div>
        <h1 className="text-2xl font-bold">Оплата получена</h1>
        <p className="text-gray-400 text-sm">
          {status === 'COMPLETED'
            ? 'Подписка активирована! Конфиг уже в кабинете.'
            : 'Ждём подтверждение от платёжной системы — обычно до минуты. Статус обновится сам.'}
        </p>
        <div className="flex gap-2 justify-center">
          <Link href="/dashboard" className="btn-primary px-6 py-2.5">
            В кабинет
          </Link>
          <Link href="/" className="btn-outline px-6 py-2.5">
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <SuccessInner />
    </Suspense>
  );
}
