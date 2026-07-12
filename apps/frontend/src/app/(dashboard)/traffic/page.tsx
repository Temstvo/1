export default function TrafficPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Traffic</h2>
        <p className="text-muted-foreground">Monitor your data usage and traffic statistics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm font-medium text-muted-foreground">Downloaded</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">42.5 GB</p>
          <p className="mt-1 text-xs text-muted-foreground">This month</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm font-medium text-muted-foreground">Uploaded</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">8.3 GB</p>
          <p className="mt-1 text-xs text-muted-foreground">This month</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm font-medium text-muted-foreground">Total Used</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">50.8 GB</p>
          <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-800">
            <div className="h-2 rounded-full bg-blue-600" style={{ width: '50.8%' }} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">50.8 GB / 100 GB</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Usage History</h3>
        <div className="mt-4">
          <div className="h-64 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 flex items-center justify-center">
            <p className="text-muted-foreground">Traffic chart will be displayed here</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="border-b border-gray-200 p-6 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Usage</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {[
            { date: 'Jul 12, 2026', download: '2.1 GB', upload: '0.4 GB', total: '2.5 GB' },
            { date: 'Jul 11, 2026', download: '3.8 GB', upload: '0.7 GB', total: '4.5 GB' },
            { date: 'Jul 10, 2026', download: '1.5 GB', upload: '0.3 GB', total: '1.8 GB' },
            { date: 'Jul 9, 2026', download: '4.2 GB', upload: '0.8 GB', total: '5.0 GB' },
            { date: 'Jul 8, 2026', download: '2.8 GB', upload: '0.5 GB', total: '3.3 GB' },
          ].map((day) => (
            <div key={day.date} className="flex items-center justify-between p-4">
              <p className="text-sm text-muted-foreground">{day.date}</p>
              <div className="flex gap-8 text-sm">
                <div className="text-right">
                  <p className="text-muted-foreground">↓ {day.download}</p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">↑ {day.upload}</p>
                </div>
                <div className="w-20 text-right font-medium text-gray-900 dark:text-white">
                  {day.total}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
