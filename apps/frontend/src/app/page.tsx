'use client';

import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';

export default function HomePage() {
  const { t } = useTranslations();

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0d0d0d]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="APPI VPN" className="w-8 h-8" />
            <span className="font-bold text-lg">APPI VPN</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">{t('landing_features')}</a>
            <a href="#servers" className="hover:text-white transition-colors">{t('landing_servers')}</a>
            <a href="#download" className="hover:text-white transition-colors">{t('landing_download')}</a>
            <a href="#faq" className="hover:text-white transition-colors">{t('landing_faq')}</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">{t('landing_signin')}</Link>
            <Link href="/checkout" className="px-5 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors">
              {t('landing_get_key')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {t('landing_hero_title')}<br />
            <span className="text-purple-400">{t('landing_hero_accent')}</span>
          </h1>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            {t('landing_hero_desc')}
          </p>
          <div className="flex gap-4 justify-center mb-16">
            <Link href="/checkout" className="px-8 py-3.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
              {t('landing_get_key')}
            </Link>
            <Link href="/register" className="px-8 py-3.5 border border-white/10 rounded-xl font-semibold text-sm text-gray-300 hover:bg-white/5 transition-all">
              {t('landing_try_free')}
            </Link>
          </div>
          <div className="flex justify-center gap-12 text-center">
            <div>
              <div className="text-3xl font-bold">10M+</div>
              <div className="text-sm text-gray-500">{t('landing_users')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold">4.9</div>
              <div className="text-sm text-gray-500">{t('landing_rating')}</div>
            </div>
            <div>
              <div className="text-3xl font-bold">50+</div>
              <div className="text-sm text-gray-500">{t('landing_countries')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">{t('landing_features_title')}</h2>
          <p className="text-gray-400 text-center mb-12">{t('landing_features_desc')}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '⚡', title: t('landing_feature1_title'), desc: t('landing_feature1_desc') },
              { icon: '📱', title: t('landing_feature2_title'), desc: t('landing_feature2_desc') },
              { icon: '∞', title: t('landing_feature3_title'), desc: t('landing_feature3_desc') },
              { icon: '🔒', title: t('landing_feature4_title'), desc: t('landing_feature4_desc') },
              { icon: '🌍', title: t('landing_feature5_title'), desc: t('landing_feature5_desc') },
              { icon: '🛡️', title: t('landing_feature6_title'), desc: t('landing_feature6_desc') },
            ].map((f, i) => (
              <div key={i} className="bg-[#141414] border border-white/5 rounded-2xl p-6 hover:border-purple-500/20 transition-colors">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Servers */}
      <section id="servers" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">{t('landing_servers_title')}</h2>
          <p className="text-gray-400 text-center mb-12">{t('landing_servers_desc')}</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { code: 'us', name: 'USA', cities: 'New York, Los Angeles', ping: '15ms', speed: '25 Gbps', uptime: '99.9%' },
              { code: 'gb', name: 'UK', cities: 'London, Manchester', ping: '12ms', speed: '25 Gbps', uptime: '99.8%' },
              { code: 'de', name: 'Germany', cities: 'Frankfurt, Berlin', ping: '8ms', speed: '25 Gbps', uptime: '99.9%' },
              { code: 'jp', name: 'Japan', cities: 'Tokyo, Osaka', ping: '25ms', speed: '25 Gbps', uptime: '99.7%' },
              { code: 'sg', name: 'Singapore', cities: 'Singapore', ping: '18ms', speed: '25 Gbps', uptime: '99.9%' },
              { code: 'ca', name: 'Canada', cities: 'Toronto, Vancouver', ping: '20ms', speed: '25 Gbps', uptime: '99.8%' },
            ].map((s, i) => (
              <div key={i} className="bg-[#141414] border border-white/5 rounded-2xl p-5 hover:border-purple-500/20 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-white/10">
                    <img src={`https://flagcdn.com/w80/${s.code}.png`} alt={s.name} className="w-full h-full object-cover" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{s.name}</h3>
                    <p className="text-xs text-gray-500">{s.cities}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="bg-white/5 rounded-lg py-2">
                    <div className="text-gray-500">{t('landing_ping')}</div>
                    <div className="font-medium text-green-400">{s.ping}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg py-2">
                    <div className="text-gray-500">{t('landing_speed')}</div>
                    <div className="font-medium">{s.speed}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg py-2">
                    <div className="text-gray-500">{t('landing_uptime')}</div>
                    <div className="font-medium">{s.uptime}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs text-green-400">{t('landing_online')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download */}
      <section id="download" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">{t('landing_download_title')}</h2>
          <p className="text-gray-400 text-center mb-12">{t('landing_download_desc')}</p>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {[
              { icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" /></svg>, name: 'Windows', note: 'Windows 10/11 (x64)', href: '#', primary: true },
              { icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>, name: 'macOS', note: 'macOS 11+ (Intel/M1)', href: '#', primary: true },
              { icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>, name: 'iOS', note: 'iOS 14+ (iPhone/iPad)', href: '#', primary: true },
              { icon: <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z" /></svg>, name: 'Android', note: 'Android 8+ (ARM/x86)', href: '#', primary: true },
              { icon: <svg className="w-10 h-10" viewBox="0 0 100 100" fill="currentColor"><ellipse cx="50" cy="62" rx="28" ry="35" /><ellipse cx="50" cy="30" rx="18" ry="18" /><ellipse cx="50" cy="70" rx="16" ry="12" fill="hsl(267,80%,60%,0.3)" /><circle cx="43" cy="27" r="3" fill="white" /><circle cx="57" cy="27" r="3" fill="white" /><circle cx="43" cy="27" r="1.5" /><circle cx="57" cy="27" r="1.5" /><ellipse cx="50" cy="33" rx="5" ry="3" fill="hsl(267,80%,50%)" /><ellipse cx="30" cy="55" rx="8" ry="14" transform="rotate(-15 30 55)" /><ellipse cx="70" cy="55" rx="8" ry="14" transform="rotate(15 70 55)" /><ellipse cx="40" cy="92" rx="10" ry="4" transform="rotate(-5 40 92)" /><ellipse cx="60" cy="92" rx="10" ry="4" transform="rotate(5 60 92)" /></svg>, name: 'Linux', note: 'Ubuntu, Debian, CentOS', href: '#', primary: true },
            ].map((p, i) => (
              <a key={i} href={p.href} className="bg-[#141414] border border-white/5 rounded-2xl p-5 text-center hover:border-purple-500/20 transition-colors group">
                <div className="text-purple-400 mb-3 flex justify-center">{p.icon}</div>
                <h3 className="font-semibold mb-1">{p.name}</h3>
                <p className="text-xs text-gray-500 mb-4">{p.note}</p>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-400 group-hover:text-purple-300 transition-colors">
                  {t('landing_download_btn')}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('landing_faq_title')}</h2>
          <div className="space-y-4">
            {[
              { q: t('landing_faq_q1'), a: t('landing_faq_a1') },
              { q: t('landing_faq_q2'), a: t('landing_faq_a2') },
              { q: t('landing_faq_q3'), a: t('landing_faq_a3') },
              { q: t('landing_faq_q4'), a: t('landing_faq_a4') },
              { q: t('landing_faq_q5'), a: t('landing_faq_a5') },
            ].map((faq, i) => (
              <details key={i} className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden group">
                <summary className="px-6 py-4 cursor-pointer text-sm font-medium hover:bg-white/5 transition-colors flex items-center justify-between">
                  {faq.q}
                  <svg className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform shrink-0 ml-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-sm text-gray-400 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{t('landing_cta_title')}</h2>
          <p className="text-gray-400 mb-8">{t('landing_cta_desc')}</p>
          <Link href="/checkout" className="inline-flex px-10 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]">
            {t('landing_get_key')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img src="/logo.svg" alt="APPI VPN" className="w-7 h-7" />
              <span className="font-bold">APPI VPN</span>
            </div>
            <p className="text-sm text-gray-500">{t('landing_footer_desc')}</p>
          </div>
          <div className="flex gap-12 text-sm">
            <div>
              <h4 className="font-semibold mb-3">{t('landing_footer_product')}</h4>
              <div className="space-y-2 text-gray-400">
                <a href="#features" className="block hover:text-white transition-colors">{t('landing_footer_features')}</a>
                <a href="#servers" className="block hover:text-white transition-colors">{t('landing_footer_servers')}</a>
                <a href="#download" className="block hover:text-white transition-colors">{t('landing_footer_downloads')}</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">{t('landing_footer_account')}</h4>
              <div className="space-y-2 text-gray-400">
                <Link href="/login" className="block hover:text-white transition-colors">{t('landing_footer_login')}</Link>
                <Link href="/checkout" className="block hover:text-white transition-colors">{t('landing_footer_checkout')}</Link>
                <Link href="/register" className="block hover:text-white transition-colors">{t('landing_footer_register')}</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-white/5 text-center text-xs text-gray-600">
          {t('landing_footer_copy')}
        </div>
      </footer>
    </div>
  );
}
