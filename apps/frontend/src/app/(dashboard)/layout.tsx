import Link from 'next/link';

const sidebarItems = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'Subscription', href: '/subscription' },
  { label: 'Servers', href: '/servers' },
  { label: 'Devices', href: '/devices' },
  { label: 'Downloads', href: '/downloads' },
  { label: 'Traffic', href: '/traffic' },
  { label: 'Payments', href: '/payments' },
  { label: 'Invoices', href: '/invoices' },
  { label: 'Referral', href: '/referral' },
  { label: 'Settings', href: '/settings' },
  { label: 'Support', href: '/support' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="flex h-16 items-center border-b border-gray-200 px-6 dark:border-gray-800">
          <Link href="/" className="text-xl font-bold text-blue-600">
            APPI VPN
          </Link>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 pl-64">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-950">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </button>
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold text-white">
              U
            </div>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
