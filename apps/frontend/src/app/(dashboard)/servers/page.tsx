export default function ServersPage() {
  const servers = [
    { id: 1, name: 'Frankfurt', country: 'Germany', status: 'online', load: 45, latency: 12, users: 234 },
    { id: 2, name: 'Amsterdam', country: 'Netherlands', status: 'online', load: 62, latency: 18, users: 189 },
    { id: 3, name: 'New York', country: 'USA', status: 'online', load: 78, latency: 85, users: 456 },
    { id: 4, name: 'Tokyo', country: 'Japan', status: 'online', load: 33, latency: 120, users: 167 },
    { id: 5, name: 'London', country: 'UK', status: 'maintenance', load: 0, latency: 0, users: 0 },
    { id: 6, name: 'Singapore', country: 'Singapore', status: 'online', load: 55, latency: 95, users: 298 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Servers</h2>
        <p className="text-muted-foreground">Select a VPN server to connect to.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {servers.map((server) => (
          <div
            key={server.id}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{server.name}</h3>
                <p className="text-sm text-muted-foreground">{server.country}</p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  server.status === 'online'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                }`}
              >
                {server.status}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">Load</p>
                <p className="font-medium text-gray-900 dark:text-white">{server.load}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Latency</p>
                <p className="font-medium text-gray-900 dark:text-white">{server.latency}ms</p>
              </div>
              <div>
                <p className="text-muted-foreground">Users</p>
                <p className="font-medium text-gray-900 dark:text-white">{server.users}</p>
              </div>
            </div>
            <button
              className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
              disabled={server.status !== 'online'}
            >
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
