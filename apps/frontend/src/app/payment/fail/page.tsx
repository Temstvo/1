'use client';

import Link from 'next/link';

export default function PaymentFailPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="card max-w-md w-full p-8 text-center space-y-4">
        <div className="text-5xl">❌</div>
        <h1 className="text-2xl font-bold">Оплата не прошла</h1>
        <p className="text-gray-400 text-sm">
          Платёж отклонён или отменён. Деньги не списаны — попробуйте ещё раз или выберите другой
          способ.
        </p>
        <div className="flex gap-2 justify-center">
          <Link href="/pricing" className="btn-primary px-6 py-2.5">
            К тарифам
          </Link>
          <Link href="/dashboard" className="btn-outline px-6 py-2.5">
            В кабинет
          </Link>
        </div>
      </div>
    </div>
  );
}
