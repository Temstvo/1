import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Welcome back
        </h2>
        <p className="text-gray-400">
          Here&apos;s an overview of your VPN account.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#222] bg-[#111] p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-400">Current Plan</p>
            <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-medium text-purple-400">Active</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-white">Pro</p>
          <p className="mt-1 text-xs text-gray-500">Active until Dec 2026</p>
        </div>
        <div className="rounded-2xl border border-[#222] bg-[#111] p-6">
          <p className="text-sm font-medium text-gray-400">Traffic Used</p>
          <p className="mt-3 text-2xl font-bold text-white">42.5 GB</p>
          <div className="mt-3 h-2 rounded-full bg-[#222]">
            <div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400" style={{ width: '42.5%' }} />
          </div>
          <p className="mt-1 text-xs text-gray-500">57.5 GB remaining</p>
        </div>
        <div className="rounded-2xl border border-[#222] bg-[#111] p-6">
          <p className="text-sm font-medium text-gray-400">Connected Devices</p>
          <p className="mt-3 text-2xl font-bold text-white">3 / 5</p>
          <p className="mt-1 text-xs text-gray-500">2 slots available</p>
        </div>
        <div className="rounded-2xl border border-[#222] bg-[#111] p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-400">Status</p>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-400">Connected</span>
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-white">Germany</p>
          <p className="mt-1 text-xs text-gray-500">Frankfurt - VLESS Reality</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#222] bg-[#111] p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Quick Actions</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <Link href="/vpn" className="flex items-center justify-center gap-2 rounded-xl border border-[#222] bg-[#0a0a0a] px-4 py-3.5 text-sm font-medium text-gray-300 hover:bg-purple-600/20 hover:border-purple-500/50 hover:text-purple-400 transition-all">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" />
            </svg>
            Connect to VPN
          </Link>
          <Link href="/vpn" className="flex items-center justify-center gap-2 rounded-xl border border-[#222] bg-[#0a0a0a] px-4 py-3.5 text-sm font-medium text-gray-300 hover:bg-purple-600/20 hover:border-purple-500/50 hover:text-purple-400 transition-all">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download Config
          </Link>
          <Link href="/servers" className="flex items-center justify-center gap-2 rounded-xl border border-[#222] bg-[#0a0a0a] px-4 py-3.5 text-sm font-medium text-gray-300 hover:bg-purple-600/20 hover:border-purple-500/50 hover:text-purple-400 transition-all">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3" />
            </svg>
            View Servers
          </Link>
        </div>
      </div>
    </div>
  );
}
