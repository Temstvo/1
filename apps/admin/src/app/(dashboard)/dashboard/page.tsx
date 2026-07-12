'use client';

const stats = [
  { name: 'Total Users', value: '12,847', change: '+12%', changeType: 'positive' },
  { name: 'Active Subscriptions', value: '8,234', change: '+8%', changeType: 'positive' },
  { name: 'Revenue (Month)', value: '$84,230', change: '+15%', changeType: 'positive' },
  { name: 'Active Connections', value: '3,421', change: '-2%', changeType: 'negative' },
  { name: 'Servers Online', value: '24/26', change: '92%', changeType: 'neutral' },
  { name: 'Open Tickets', value: '47', change: '-5%', changeType: 'positive' },
];

const recentActivity = [
  { id: 1, user: 'john@example.com', action: 'New subscription', plan: 'Pro', time: '2 min ago' },
  { id: 2, user: 'jane@example.com', action: 'Payment failed', plan: 'Basic', time: '5 min ago' },
  { id: 3, user: 'bob@example.com', action: 'Connected', server: 'Frankfurt', time: '8 min ago' },
  { id: 4, user: 'alice@example.com', action: 'New registration', plan: 'Trial', time: '12 min ago' },
  { id: 5, user: 'charlie@example.com', action: 'Cancelled', plan: 'Premium', time: '15 min ago' },
];

const serverStatus = [
  { name: 'Frankfurt', country: '🇩🇪', status: 'ONLINE', load: 45, users: 234 },
  { name: 'Amsterdam', country: '🇳🇱', status: 'ONLINE', load: 62, users: 189 },
  { name: 'New York', country: '🇺🇸', status: 'ONLINE', load: 78, users: 456 },
  { name: 'Tokyo', country: '🇯🇵', status: 'ONLINE', load: 33, users: 167 },
  { name: 'London', country: '🇬🇧', status: 'MAINTENANCE', load: 0, users: 0 },
  { name: 'Singapore', country: '🇸🇬', status: 'ONLINE', load: 55, users: 298 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your APPI VPN platform</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
          >
            <p className="text-sm text-muted-foreground">{stat.name}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p
              className={`text-sm ${
                stat.changeType === 'positive'
                  ? 'text-green-600'
                  : stat.changeType === 'negative'
                  ? 'text-red-600'
                  : 'text-muted-foreground'
              }`}
            >
              {stat.change} from last month
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.user}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.action} • {item.plan || item.server}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Server Status</h2>
          <div className="space-y-4">
            {serverStatus.map((server) => (
              <div key={server.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span>{server.country}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{server.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {server.users} users • {server.load}% load
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    server.status === 'ONLINE'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}
                >
                  {server.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
