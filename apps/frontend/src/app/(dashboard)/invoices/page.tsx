export default function InvoicesPage() {
  const invoices = [
    { id: 'INV-2026-001', date: 'Jul 1, 2026', amount: '$9.99', status: 'Paid' },
    { id: 'INV-2026-002', date: 'Jun 1, 2026', amount: '$9.99', status: 'Paid' },
    { id: 'INV-2026-003', date: 'May 1, 2026', amount: '$9.99', status: 'Paid' },
    { id: 'INV-2026-004', date: 'Apr 1, 2026', amount: '$9.99', status: 'Paid' },
    { id: 'INV-2026-005', date: 'Mar 1, 2026', amount: '$9.99', status: 'Paid' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Invoices</h2>
        <p className="text-muted-foreground">Download and manage your invoices.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{invoice.id}</p>
                  <p className="text-sm text-muted-foreground">{invoice.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-medium text-gray-900 dark:text-white">{invoice.amount}</p>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                  {invoice.status}
                </span>
                <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800">
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
