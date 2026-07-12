'use client';

import { useState } from 'react';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  description: string;
  createdAt: string;
  plan?: string;
}

const mockPayments: Payment[] = [
  { id: '1', amount: 9.99, currency: 'USD', status: 'COMPLETED', provider: 'STRIPE', description: 'Pro Plan', createdAt: '2026-01-15', plan: 'Pro' },
  { id: '2', amount: 9.99, currency: 'USD', status: 'COMPLETED', provider: 'STRIPE', description: 'Pro Plan', createdAt: '2025-12-15', plan: 'Pro' },
  { id: '3', amount: 4.99, currency: 'USD', status: 'COMPLETED', provider: 'CRYPTOMUS', description: 'Basic Plan', createdAt: '2025-11-15', plan: 'Basic' },
  { id: '4', amount: 9.99, currency: 'USD', status: 'REFUNDED', provider: 'STRIPE', description: 'Pro Plan', createdAt: '2025-10-15', plan: 'Pro' },
  { id: '5', amount: 14.99, currency: 'USD', status: 'FAILED', provider: 'STRIPE', description: 'Premium Plan', createdAt: '2025-09-15', plan: 'Premium' },
];

export default function PaymentHistoryPage() {
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed' | 'refunded'>('all');

  const filteredPayments = mockPayments.filter(
    (p) => filter === 'all' || p.status.toLowerCase() === filter,
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'FAILED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'REFUNDED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment History</h1>
        <p className="text-muted-foreground">View all your transactions</p>
      </div>

      <div className="flex gap-2">
        {(['all', 'completed', 'failed', 'refunded'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Method
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {payment.createdAt}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {payment.description}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    ${payment.amount.toFixed(2)} {payment.currency}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                    {payment.provider}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
