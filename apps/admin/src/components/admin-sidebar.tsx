'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Users', href: '/users', icon: '👥' },
  { name: 'Servers', href: '/servers', icon: '🖥️' },
  { name: 'Subscriptions', href: '/subscriptions', icon: '🔑' },
  { name: 'Payments', href: '/payments', icon: '💳' },
  { name: 'Coupons', href: '/coupons', icon: '🎁' },
  { name: 'Tickets', href: '/tickets', icon: '🎫' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6 dark:border-gray-800">
        <img src="/logo.svg" alt="APPI VPN" className="h-8 w-8" />
        <span className="text-lg font-bold text-gray-900 dark:text-white">APPI VPN</span>
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          Admin
        </span>
      </div>
      <nav className="space-y-1 p-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === item.href || pathname.startsWith(item.href + '/')
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            <span>{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
