export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Welcome back
        </h2>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your VPN account.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Pro</p>
          <p className="mt-1 text-xs text-muted-foreground">Active until Dec 2026</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm font-medium text-muted-foreground">Traffic Used</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">42.5 GB</p>
          <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-800">
            <div className="h-2 rounded-full bg-blue-600" style={{ width: '42.5%' }} />
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm font-medium text-muted-foreground">Connected Devices</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">3 / 5</p>
          <p className="mt-1 text-xs text-muted-foreground">2 slots available</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm font-medium text-muted-foreground">Active Server</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Germany</p>
          <p className="mt-1 text-xs text-muted-foreground">Frankfurt - WireGuard</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <button className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800">
            Connect to VPN
          </button>
          <button className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800">
            Download Config
          </button>
          <button className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800">
            View Servers
          </button>
        </div>
      </div>
    </div>
  );
}
