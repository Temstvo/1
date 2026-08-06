'use client';

import { useTranslations } from '@/lib/i18n';

const platforms = [
  {
    name: 'Windows',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
      </svg>
    ),
    clients: [
      { name: 'v2rayN', link: 'https://github.com/2dust/v2rayN/releases/latest', desc: 'Рекомендуется' },
    ],
  },
  {
    name: 'macOS',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
    clients: [
      { name: 'V2Box', link: 'https://apps.apple.com/app/v2box/id6446817712', desc: 'App Store' },
      { name: 'Streisand', link: 'https://apps.apple.com/app/streisand/id6450534064', desc: 'App Store' },
    ],
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
      </svg>
    ),
    clients: [
      { name: 'v2rayA', link: 'https://github.com/v2rayA/v2rayA/releases/latest', desc: 'Веб-интерфейс' },
    ],
  },
  {
    name: 'Android',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z" />
      </svg>
    ),
    clients: [
      { name: 'v2rayNG', link: 'https://github.com/2dust/v2rayNG/releases/latest', desc: 'Google Play / APK' },
    ],
  },
  {
    name: 'iOS',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
    clients: [
      { name: 'Streisand', link: 'https://apps.apple.com/app/streisand/id6450534064', desc: 'App Store' },
      { name: 'V2Box', link: 'https://apps.apple.com/app/v2box/id6446817712', desc: 'App Store' },
    ],
  },
];

export default function DownloadsPage() {
  const { t } = useTranslations();

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('downloads_title')}</h1>
        <p className="text-sm text-gray-500 mt-1">Установите клиент и импортируйте конфигурацию.</p>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white mb-1">Как подключиться</h2>
        <ol className="text-xs text-gray-400 space-y-1.5 list-decimal list-inside">
          <li>Скачайте клиент для вашей платформы</li>
          <li>Перейдите в раздел <a href="/vpn" className="text-purple-400 hover:text-purple-300">Конфиги VPN</a> и скопируйте конфигурацию</li>
          <li>Импортируйте конфигурацию в клиент (вставьте URI или отсканируйте QR-код)</li>
          <li>Нажмите «Подключить»</li>
        </ol>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform) => (
          <div key={platform.name} className="bg-[#111] border border-white/5 rounded-2xl p-5">
            <div className="text-purple-400 mb-3">{platform.icon}</div>
            <h3 className="font-semibold text-white mb-3">{platform.name}</h3>
            <div className="space-y-2">
              {platform.clients.map((client) => (
                <a
                  key={client.name}
                  href={client.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-4 py-3 min-h-[44px] bg-[#0a0a0a] border border-white/5 rounded-xl text-sm text-gray-300 hover:bg-purple-600/10 hover:border-purple-500/30 hover:text-purple-400 transition-all"
                >
                  <div>
                    <span className="font-medium">{client.name}</span>
                    <span className="text-xs text-gray-600 ml-2">{client.desc}</span>
                  </div>
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
