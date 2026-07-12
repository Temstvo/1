export default function DevicesPage() {
  const devices = [
    { id: 1, name: 'MacBook Pro', platform: 'macOS', lastIP: '192.168.1.100', lastSeen: '2026-07-12T10:30:00Z', isActive: true },
    { id: 2, name: 'iPhone 15', platform: 'iOS', lastIP: '192.168.1.101', lastSeen: '2026-07-12T09:15:00Z', isActive: true },
    { id: 3, name: 'Windows Desktop', platform: 'Windows', lastIP: '10.0.0.50', lastSeen: '2026-07-11T18:45:00Z', isActive: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Devices</h2>
        <p className="text-muted-foreground">Manage your connected devices. 3 / 5 devices used.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                  <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 7.41A2.25 2.25 0 012.25 5.495V5.25" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{device.name}</h3>
                  <p className="text-sm text-muted-foreground">{device.platform} · {device.lastIP}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    device.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {device.isActive ? 'Active' : 'Inactive'}
                </span>
                <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
