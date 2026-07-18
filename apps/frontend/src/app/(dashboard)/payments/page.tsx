'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  description: string;
  createdAt: string;
  plan?: { name: string };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments')
      .then((res) => {
        const data = res.data;
        setPayments(Array.isArray(data) ? data : data.payments || []);
      })
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (s: string) => {
    switch (s) {
      case 'COMPLETED': return 'text-green-400 bg-green-500/10';
      case 'PENDING': return 'text-yellow-400 bg-yellow-500/10';
      case 'FAILED': return 'text-red-400 bg-red-500/10';
      case 'REFUNDED': return 'text-gray-400 bg-gray-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const providerName = (p: string) => {
    switch (p) {
      case 'YOOKASSA': return 'YooKassa';
      case 'CRYPTOMUS': return 'Crypto';
      case 'STRIPE': return 'Card';
      case 'TELEGRAM': return 'Telegram';
      default: return p;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Payments</h1>
        <p className="text-sm text-gray-500">Your payment history</p>
      </div>

      {payments.length === 0 ? (
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">💳</div>
          <h3 className="text-lg font-semibold text-white mb-2">No Payments Yet</h3>
          <p className="text-sm text-gray-400">Your payment history will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div key={p.id} className="bg-[#141414] border border-white/5 rounded-xl p-4 flex items-center justify-between min-h-[44px]">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm shrink-0">
                  {p.status === 'COMPLETED' ? '✓' : p.status === 'PENDING' ? '...' : '✕'}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white truncate">{p.description || p.plan?.name || 'Payment'}</div>
                  <div className="text-xs text-gray-500 truncate">{new Date(p.createdAt).toLocaleDateString()} · {providerName(p.provider)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">₽{Number(p.amount).toLocaleString()}</div>
                <div className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(p.status)}`}>
                  {p.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
