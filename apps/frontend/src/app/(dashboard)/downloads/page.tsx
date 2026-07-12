export default function DownloadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Downloads</h2>
        <p className="text-muted-foreground">Download VPN clients and configuration files.</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">VPN Clients</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {[
            { name: 'Windows', icon: 'M.54 3.87L.16 1.63C-.08 1.36-.08.88.16.61L3.87.54C4.14.3 4.62.3 4.89.54L18.39 14.04C18.66 14.31 18.66 14.79 18.39 15.06L15.06 18.39C14.79 18.66 14.31 18.66 14.04 18.39L.54 3.87Z', version: 'v2.1.0' },
            { name: 'macOS', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', version: 'v2.1.0' },
            { name: 'Linux', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', version: 'v2.1.0' },
            { name: 'Android', icon: 'M17.523 15.342a1 1 0 01-1.003 1.764l-.147-.073a1 1 0 01-1.002-1.764l.147.073zm-11.046 0a1 1 0 011.003 1.764l-.147-.073a1 1 0 01-1.002-1.764l.147.073z', version: 'v2.1.0' },
            { name: 'iOS', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', version: 'v2.1.0' },
            { name: 'Router', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', version: 'v1.0.0' },
          ].map((client) => (
            <div key={client.name} className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={client.icon} />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{client.name}</p>
                  <p className="text-sm text-muted-foreground">{client.version}</p>
                </div>
              </div>
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                Download
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configuration Files</h3>
        <div className="mt-4 space-y-3">
          {[
            { name: 'WireGuard Config', format: '.conf', protocol: 'WireGuard' },
            { name: 'OpenVPN Config', format: '.ovpn', protocol: 'OpenVPN' },
            { name: 'Xray Config', format: '.json', protocol: 'Xray Reality' },
          ].map((config) => (
            <div key={config.name} className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{config.name}</p>
                <p className="text-sm text-muted-foreground">{config.protocol} · {config.format}</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800">
                  Copy
                </button>
                <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-500">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
