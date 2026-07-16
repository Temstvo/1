'use client';

const platforms = [
  { name: 'Windows', icon: '🪟', versions: ['WireGuard', 'OpenVPN', 'Xray'] },
  { name: 'macOS', icon: '🍎', versions: ['WireGuard', 'OpenVPN', 'Xray'] },
  { name: 'Linux', icon: '🐧', versions: ['WireGuard', 'OpenVPN', 'Xray'] },
  { name: 'Android', icon: '🤖', versions: ['WireGuard', 'OpenVPN', 'Xray'] },
  { name: 'iOS', icon: '📱', versions: ['WireGuard', 'OpenVPN'] },
  { name: 'Router', icon: '📡', versions: ['WireGuard', 'OpenVPN'] },
];

export default function DownloadsPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Downloads</h1>

      <div>
        <h2 className="happ-section-header">VPN Clients</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((platform) => (
            <div key={platform.name} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--primary)]/30 transition-all">
              <div className="text-3xl mb-3">{platform.icon}</div>
              <h3 className="font-semibold text-[var(--foreground)] mb-1">{platform.name}</h3>
              <div className="space-y-1.5 mt-3">
                {platform.versions.map((v) => (
                  <button key={v} className="w-full flex items-center justify-between px-3 py-2 bg-[var(--muted)] rounded-lg text-xs text-[var(--foreground)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-all">
                    <span>{v}</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
