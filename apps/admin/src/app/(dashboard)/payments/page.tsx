'use client';

const payments = [
  { id: '1', user: 'john@example.com', amount: 9.99, currency: 'USD', status: 'COMPLETED', provider: 'STRIPE', plan: 'Pro', createdAt: '2026-01-15' },
  { id: '2', user: 'jane@example.com', amount: 4.99, currency: 'USD', status: 'COMPLETED', provider: 'CRYPTOMUS', plan: 'Basic', createdAt: '2025-12-20' },
  { id: '3', user: 'bob@example.com', amount: 14.99, currency: 'USD', status: 'FAILED', provider: 'STRIPE', plan: 'Premium', createdAt: '2025-12-10' },
  { id: '4', user: 'alice@example.com', amount: 9.99, currency: 'USD', status: 'REFUNDED', provider: 'STRIPE', plan: 'Pro', createdAt: '2025-11-15' },
  { id: '5', user: 'charlie@example.com', amount: 9.99, currency: 'USD', status: 'COMPLETED', provider: 'TELEGRAM', plan: 'Pro', createdAt: '2025-11-01' },
];

export default function PaymentsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payments</h1>
        <p className="text-muted-foreground">Manage payments and refunds</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {payment.user}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
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
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {payment.plan}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                    {payment.createdAt}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex gap-2">
                      <button className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300">
                        View
                      </button>
                      {payment.status === 'COMPLETED' && (
                        <button className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300">
                          Refund
                        </button>
                      )}
                    </div>
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
