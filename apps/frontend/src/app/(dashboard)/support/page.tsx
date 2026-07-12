export default function SupportPage() {
  const tickets = [
    { id: 'TKT-001', subject: 'Connection issues with Tokyo server', status: 'Open', priority: 'High', date: 'Jul 12, 2026' },
    { id: 'TKT-002', subject: 'Billing question', status: 'Resolved', priority: 'Low', date: 'Jul 10, 2026' },
    { id: 'TKT-003', subject: 'Cannot download config', status: 'Closed', priority: 'Medium', date: 'Jul 5, 2026' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Support</h2>
          <p className="text-muted-foreground">Get help with your account or VPN connection.</p>
        </div>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
          New Ticket
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-200 p-6 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Tickets</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between p-6">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 dark:text-white">{ticket.id}</p>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      ticket.status === 'Open'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : ticket.status === 'Resolved'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{ticket.subject}</p>
                <p className="text-xs text-muted-foreground">{ticket.date}</p>
              </div>
              <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800">
                View
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">FAQ</h3>
        <div className="mt-4 space-y-4">
          {[
            { q: 'How do I connect to VPN?', a: 'Download the client app, import your configuration file, and click Connect.' },
            { q: 'How do I change my plan?', a: 'Go to Subscription page and click Change Plan to select a new plan.' },
            { q: 'How do I reset my password?', a: 'Click "Forgot password" on the login page and follow the instructions.' },
          ].map((faq) => (
            <div key={faq.q} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <p className="font-medium text-gray-900 dark:text-white">{faq.q}</p>
              <p className="mt-1 text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
