import Link from 'next/link';

const DOWNLOADS: { platform: string; links: { text: string; href: string }[] }[] = [
  {
    platform: 'iOS',
    links: [
      { text: 'App Store', href: 'https://apps.apple.com/us/app/happ-proxy-utility/id6504287215' },
      { text: 'TestFlight', href: 'https://testflight.apple.com/join/XMls6Ckd' },
    ],
  },
  {
    platform: 'Android',
    links: [
      { text: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.happproxy' },
      {
        text: 'APK',
        href: 'https://github.com/Happ-proxy/happ-android/releases/latest/download/Happ.apk',
      },
    ],
  },
  {
    platform: 'Desktop',
    links: [
      {
        text: 'Windows x64',
        href: 'https://github.com/Happ-proxy/happ-desktop/releases/latest/download/setup-Happ.x64.exe',
      },
      {
        text: 'macOS',
        href: 'https://github.com/Happ-proxy/happ-desktop/releases/latest/download/Happ.macOS.universal.dmg',
      },
      {
        text: 'Linux deb',
        href: 'https://github.com/Happ-proxy/happ-desktop/releases/latest/download/Happ.linux.x64.deb',
      },
    ],
  },
  {
    platform: 'TV',
    links: [
      { text: 'Android TV', href: 'https://play.google.com/store/apps/details?id=com.happproxy' },
      {
        text: 'Apple TV',
        href: 'https://apps.apple.com/us/app/happ-proxy-utility-for-tv/id6748297274',
      },
    ],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ===== NAV ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="APPI VPN" className="w-8 h-8" />
            <span className="font-bold text-lg tracking-tight">APPI·VPN</span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm text-gray-400">
            <a href="#download" className="hover:text-white transition-colors">
              Скачать
            </a>
            <a href="#how" className="hover:text-white transition-colors">
              Как подключить
            </a>
          </div>
          <a
            href="https://t.me/AppiVPNBot"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary px-5 py-2 text-sm"
          >
            Открыть бота
          </a>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="pt-40 pb-16 md:pb-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-[1.05] tracking-tight">
            APPI VPN
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-9 max-w-xl mx-auto">
            Бесплатный VPN без оплат и лимитов. Серверы выдаёт Telegram-бот, подключение — через
            приложение Happ.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://t.me/AppiVPNBot"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-8 py-4 text-base"
            >
              Получить подписку в боте
            </a>
            <a href="#download" className="btn-outline px-8 py-4 text-base">
              Скачать Happ
            </a>
          </div>
        </div>
      </section>

      {/* ===== HOW ===== */}
      <section id="how" className="py-20 md:py-24 px-4 md:px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Три шага. Около трёх минут.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                num: '1',
                title: 'Открой бота',
                desc: 'Нажми «🚀 Импорт в Happ» — получишь персональную ссылку-подписку.',
              },
              {
                num: '2',
                title: 'Установи Happ',
                desc: 'iOS, Android, Windows, macOS, Linux и TV. Ссылки ниже.',
              },
              {
                num: '3',
                title: 'Подключись',
                desc: 'Вставь ссылку в Happ и нажми кнопку подключения.',
              },
            ].map((s) => (
              <div key={s.num} className="card p-8">
                <div className="w-12 h-12 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center text-xl font-bold mb-5">
                  {s.num}
                </div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DOWNLOADS (как happ.su) ===== */}
      <section id="download" className="py-20 md:py-24 px-4 md:px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Скачать Happ</h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto">
              Кроссплатформенное приложение на ядре Xray. Протоколы: VLESS, VMess, Trojan,
              Shadowsocks, Hysteria2.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DOWNLOADS.map((d) => (
              <div key={d.platform} className="card p-8">
                <h3 className="text-xl font-bold mb-5">{d.platform}</h3>
                <div className="space-y-2.5">
                  {d.links.map((l) => (
                    <a
                      key={l.text}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline block text-center py-2.5 text-sm"
                    >
                      {l.text}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-600 mt-8">
            Happ не предоставляет серверы — серверы бесплатно выдаёт бот APPI VPN.
          </p>
        </div>
      </section>

      {/* ===== TELEGRAM FLOAT ===== */}
      <a
        href="https://t.me/AppiVPNBot"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Открыть бота в Telegram"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 sm:px-5 py-3.5 rounded-full bg-[#229ED9] hover:bg-[#1B8BC0] text-white font-semibold text-sm"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
        <span className="hidden sm:inline">Открыть бота</span>
      </a>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/10 py-14 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="APPI VPN" className="w-7 h-7" />
              <span className="font-bold text-lg tracking-tight">APPI·VPN</span>
            </div>
            <div className="flex flex-wrap gap-10 text-sm">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                  Сервис
                </h4>
                <div className="space-y-2 text-gray-400">
                  <a href="#download" className="block hover:text-white transition-colors">
                    Скачать Happ
                  </a>
                  <a href="#how" className="block hover:text-white transition-colors">
                    Как подключить
                  </a>
                  <a
                    href="https://t.me/AppiVPNBot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:text-white transition-colors"
                  >
                    Telegram-бот
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                  Документы
                </h4>
                <div className="space-y-2 text-gray-400">
                  <Link href="/terms" className="block hover:text-white transition-colors">
                    Условия использования
                  </Link>
                  <Link href="/privacy" className="block hover:text-white transition-colors">
                    Политика конфиденциальности
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-600">
            <span>© 2026 APPI VPN · Бесплатно и без лимитов</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
