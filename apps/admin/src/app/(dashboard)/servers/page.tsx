'use client';

const servers = [
  { id: '1', name: 'Frankfurt', country: 'Germany', ip: '185.234.72.1', status: 'ONLINE', load: 45, cpu: 32, ram: 67, users: 234, maxUsers: 1000 },
  { id: '2', name: 'Amsterdam', country: 'Netherlands', ip: '185.234.72.2', status: 'ONLINE', load: 62, cpu: 58, ram: 72, users: 189, maxUsers: 800 },
  { id: '3', name: 'New York', country: 'USA', ip: '185.234.72.3', status: 'ONLINE', load: 78, cpu: 75, ram: 81, users: 456, maxUsers: 1500 },
  { id: '4', name: 'Tokyo', country: 'Japan', ip: '185.234.72.4', status: 'ONLINE', load: 33, cpu: 28, ram: 45, users: 167, maxUsers: 600 },
  { id: '5', name: 'London', country: 'UK', ip: '185.234.72.5', status: 'MAINTENANCE', load: 0, cpu: 0, ram: 0, users: 0, maxUsers: 1000 },
  { id: '6', name: 'Singapore', country: 'Singapore', ip: '185.234.72.6', status: 'ONLINE', load: 55, cpu: 48, ram: 63, users: 298, maxUsers: 800 },
];

export default function ServersPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'OFFLINE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Servers</h1>
          <p className="text-muted-foreground">Manage VPN servers</p>
        </div>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
          + Add Server
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {servers.map((server) => (
          <div key={server.id} className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{server.name}</h3>
                <p className="text-sm text-muted-foreground">{server.country}</p>
              </div>
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(server.status)}`}>
                {server.status}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IP</span>
                <span className="font-mono text-gray-900 dark:text-white">{server.ip}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Load</span>
                <span className="text-gray-900 dark:text-white">{server.load}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CPU</span>
                <span className="text-gray-900 dark:text-white">{server.cpu}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">RAM</span>
                <span className="text-gray-900 dark:text-white">{server.ram}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Users</span>
                <span className="text-gray-900 dark:text-white">{server.users}/{server.maxUsers}</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300">
                Edit
              </button>
              <button className="flex-1 rounded bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300">
                {server.status === 'ONLINE' ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
