'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Invoice {
  id: string;
  number: string;
  total: number;
  currency: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/invoices')
      .then((res) => {
        const data = res.data;
        setInvoices(Array.isArray(data) ? data : data.invoices || []);
      })
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, []);

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
        <h1 className="text-2xl font-bold text-white mb-1">Invoices</h1>
        <p className="text-sm text-gray-500">Your invoices</p>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-white mb-2">No Invoices</h3>
          <p className="text-sm text-gray-400">Invoices will appear after your first payment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div key={inv.id} className="bg-[#141414] border border-white/5 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm">
                  📄
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{inv.number}</div>
                  <div className="text-xs text-gray-500">{new Date(inv.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">₽{Number(inv.total).toLocaleString()}</div>
                <div className={`text-xs font-medium ${inv.paidAt ? 'text-green-400' : 'text-yellow-400'}`}>
                  {inv.paidAt ? 'Paid' : 'Unpaid'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
