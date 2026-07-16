export default function TrafficPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Statistics</h1>

      {/* Server Info */}
      <div>
        <h2 className="happ-section-header">Server</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="happ-settings-row">
            <span className="happ-settings-label">Start Time</span>
            <span className="happ-settings-value">18:32:46</span>
          </div>
          <div className="happ-settings-row">
            <span className="happ-settings-label">Connection Time</span>
            <span className="happ-settings-value">10:11:41</span>
          </div>
        </div>
      </div>

      {/* Proxy Bandwidth */}
      <div>
        <h2 className="happ-section-header">Proxy Bandwidth</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="happ-settings-row">
            <span className="happ-settings-label">Download</span>
            <span className="happ-settings-value text-green-400">205.0 B/s</span>
          </div>
          <div className="happ-settings-row">
            <span className="happ-settings-label">Upload</span>
            <span className="happ-settings-value text-blue-400">4.5 KB/s</span>
          </div>
        </div>
      </div>

      {/* Data Usage via Proxy */}
      <div>
        <h2 className="happ-section-header">Data Usage via Proxy</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="happ-settings-row">
            <span className="happ-settings-label">Download</span>
            <span className="happ-settings-value">10.1 GB</span>
          </div>
          <div className="happ-settings-row">
            <span className="happ-settings-label">Upload</span>
            <span className="happ-settings-value">96.6 MB</span>
          </div>
        </div>
      </div>

      {/* Direct Usage */}
      <div>
        <h2 className="happ-section-header">Direct Data Usage</h2>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="happ-settings-row">
            <span className="happ-settings-label">Direct Download</span>
            <span className="happ-settings-value">0.0 B</span>
          </div>
          <div className="happ-settings-row">
            <span className="happ-settings-label">Direct Upload</span>
            <span className="happ-settings-value">0.0 B</span>
          </div>
        </div>
      </div>
    </div>
  );
}
