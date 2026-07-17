'use client';

const platforms = [
  {
    name: 'Windows',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
      </svg>
    ),
    versions: ['WireGuard', 'OpenVPN', 'Xray'],
  },
  {
    name: 'macOS',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
    versions: ['WireGuard', 'OpenVPN', 'Xray'],
  },
  {
    name: 'Linux',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 100 100" fill="currentColor">
        <ellipse cx="50" cy="62" rx="28" ry="35" />
        <ellipse cx="50" cy="30" rx="18" ry="18" />
        <ellipse cx="50" cy="70" rx="16" ry="12" fill="hsl(267,80%,60%,0.3)" />
        <circle cx="43" cy="27" r="3" fill="white" />
        <circle cx="57" cy="27" r="3" fill="white" />
        <circle cx="43" cy="27" r="1.5" />
        <circle cx="57" cy="27" r="1.5" />
        <ellipse cx="50" cy="33" rx="5" ry="3" fill="hsl(267,80%,50%)" />
        <ellipse cx="30" cy="55" rx="8" ry="14" transform="rotate(-15 30 55)" />
        <ellipse cx="70" cy="55" rx="8" ry="14" transform="rotate(15 70 55)" />
        <ellipse cx="40" cy="92" rx="10" ry="4" transform="rotate(-5 40 92)" />
        <ellipse cx="60" cy="92" rx="10" ry="4" transform="rotate(5 60 92)" />
      </svg>
    ),
    versions: ['WireGuard', 'OpenVPN', 'Xray'],
  },
  {
    name: 'Android',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z" />
      </svg>
    ),
    versions: ['WireGuard', 'OpenVPN', 'Xray'],
  },
  {
    name: 'iOS',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
    versions: ['WireGuard', 'OpenVPN'],
  },
  {
    name: 'Router',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h.01" />
        <path d="M2 8.82a15 15 0 0 1 20 0" />
        <path d="M5 12.859a10 10 0 0 1 14 0" />
        <path d="M8.5 16.429a5 5 0 0 1 7 0" />
      </svg>
    ),
    versions: ['WireGuard', 'OpenVPN'],
  },
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
              <div className="text-[var(--foreground)] mb-3">{platform.icon}</div>
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
