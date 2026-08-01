'use client';

import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function getPlatform(): string {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return 'android';
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/mac/.test(ua)) return 'macos';
  if (/linux/.test(ua)) return 'linux';
  return 'windows';
}

export default function HomePage() {
  const { t } = useTranslations();
  const router = useRouter();
  const [platform, setPlatform] = useState('desktop');

  useEffect(() => {
    setPlatform(getPlatform());
    if (process.env.NEXT_PUBLIC_TAURI === 'true') {
      const token = localStorage.getItem('accessToken');
      router.replace(token ? '/vpn' : '/register');
    }
  }, [router]);

  if (process.env.NEXT_PUBLIC_TAURI === 'true') {
    return (
      <div className="min-h-screen bg-[hsl(222,14%,6%)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const platformNames: Record<string, string> = {
    windows: 'Windows', macos: 'macOS', linux: 'Linux', android: 'Android', ios: 'iOS', desktop: 'Windows',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav — Surfshark style: logo + Download + Get VPN */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="APPI VPN" className="w-8 h-8" />
            <span className="font-bold text-lg">APPI VPN</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors">{t('nav_features')}</a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">{t('nav_pricing')}</a>
            <Link href="/downloads" className="text-gray-400 hover:text-white transition-colors">{t('nav_download')}</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">{t('nav_signin')}</Link>
            <Link href="/checkout" className="px-5 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-semibold transition-colors">
              {t('nav_get_vpn')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — Surfshark exact pattern: headline + subtitle + single CTA + guarantee */}
      <section className="pt-28 md:pt-40 pb-20 md:pb-28 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] md:w-[900px] h-[500px] md:h-[900px] bg-purple-600/5 rounded-full blur-[200px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1]">
            {t('hero_title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            {t('hero_desc')}
          </p>
          <Link href="/checkout" className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-600/25">
            {t('hero_cta')}
          </Link>
          <div className="mt-5 flex items-center justify-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
            {t('hero_guarantee')}
          </div>
        </div>
      </section>

      {/* Trust bar — Surfshark style: numbers + awards */}
      <section className="border-y border-white/5 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '10K+', label: t('trust_users') },
              { value: '50+', label: t('trust_countries') },
              { value: '10 Gbps', label: t('trust_speed') },
              { value: '30 days', label: t('trust_guarantee') },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-2xl md:text-3xl font-bold text-white">{item.value}</div>
                <div className="text-sm text-gray-500 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — Surfshark style: 3 cards with icons */}
      <section id="features" className="py-20 md:py-28 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">{t('features_title')}</h2>
          <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">{t('features_desc')}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '\u26A1', title: t('f1_title'), desc: t('f1_desc') },
              { icon: '\uD83D\uDEE1\uFE0F', title: t('f2_title'), desc: t('f2_desc') },
              { icon: '\uD83C\uDF10', title: t('f3_title'), desc: t('f3_desc') },
            ].map((f, i) => (
              <div key={i} className="bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-purple-500/20 transition-colors">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — Surfshark style: simple steps */}
      <section className="py-20 md:py-28 px-4 md:px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">{t('steps_title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '1', title: t('step1_title'), desc: t('step1_desc') },
              { num: '2', title: t('step2_title'), desc: t('step2_desc') },
              { num: '3', title: t('step3_title'), desc: t('step3_desc') },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center text-xl font-bold mx-auto mb-4">{s.num}</div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download — auto-detect, one button */}
      <section className="py-20 md:py-28 px-4 md:px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('download_title')}</h2>
          <p className="text-gray-400 mb-8">{t('download_desc')}</p>
          <Link href="/downloads" className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            {t('download_cta')} {platformNames[platform]}
          </Link>
        </div>
      </section>

      {/* Pricing — on landing like NordVPN/Windscribe */}
      <section id="pricing" className="py-20 md:py-28 px-4 md:px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">{t('pricing_title')}</h2>
          <p className="text-gray-400 text-center mb-10">{t('pricing_desc')}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Basic', price: '$4.99', period: '/mo', features: ['3 devices', '5 countries', 'VLESS Reality'], popular: false },
              { name: 'Pro', price: '$9.99', period: '/mo', features: ['10 devices', 'All countries', 'All protocols', 'Priority support'], popular: true },
              { name: 'Premium', price: '$14.99', period: '/mo', features: ['Unlimited devices', 'All countries', 'All protocols', 'Dedicated IP', '24/7 support'], popular: false },
            ].map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl p-6 border transition-all ${plan.popular ? 'border-purple-500/50 bg-purple-600/5 shadow-lg shadow-purple-500/10 scale-[1.02]' : 'border-white/5 bg-[#111]'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 rounded-full text-xs font-semibold whitespace-nowrap">
                    {t('pricing_popular')}
                  </div>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-3 mb-5">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/checkout" className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${plan.popular ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'border border-white/10 hover:bg-white/5 text-white'}`}>
                  {t('pricing_cta')}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">{t('pricing_guarantee')}</p>
        </div>
      </section>

      {/* FAQ — Surfshark style: accordion */}
      <section className="py-20 md:py-28 px-4 md:px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">{t('faq_title')}</h2>
          <div className="space-y-3">
            {[
              { q: t('faq_q1'), a: t('faq_a1') },
              { q: t('faq_q2'), a: t('faq_a2') },
              { q: t('faq_q3'), a: t('faq_a3') },
              { q: t('faq_q4'), a: t('faq_a4') },
              { q: t('faq_q5'), a: t('faq_a5') },
            ].map((faq, i) => (
              <details key={i} className="bg-[#111] border border-white/5 rounded-xl overflow-hidden group">
                <summary className="px-6 py-4 cursor-pointer text-sm font-medium hover:bg-white/5 transition-colors flex items-center justify-between">
                  {faq.q}
                  <svg className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform shrink-0 ml-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </summary>
                <div className="px-6 pb-4 text-sm text-gray-400 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — Surfshark style: same as hero */}
      <section className="py-20 md:py-28 px-4 md:px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('cta_title')}</h2>
          <p className="text-gray-400 mb-8">{t('cta_desc')}</p>
          <Link href="/checkout" className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-600/25">
            {t('cta_btn')}
          </Link>
          <p className="mt-4 text-sm text-gray-500">{t('cta_guarantee')}</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-4 md:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <img src="/logo.png" alt="APPI VPN" className="w-6 h-6" />
              <span className="font-bold">APPI VPN</span>
            </div>
            <p className="text-sm text-gray-500 max-w-xs">{t('footer_desc')}</p>
          </div>
          <div className="flex gap-12 text-sm">
            <div>
              <h4 className="font-semibold mb-3 text-gray-300">{t('footer_product')}</h4>
              <div className="space-y-2 text-gray-500">
                <a href="#features" className="block hover:text-white transition-colors">{t('nav_features')}</a>
                <a href="#pricing" className="block hover:text-white transition-colors">{t('nav_pricing')}</a>
                <Link href="/downloads" className="block hover:text-white transition-colors">{t('nav_download')}</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-gray-300">{t('footer_account')}</h4>
              <div className="space-y-2 text-gray-500">
                <Link href="/login" className="block hover:text-white transition-colors">{t('nav_signin')}</Link>
                <Link href="/register" className="block hover:text-white transition-colors">{t('footer_register')}</Link>
                <Link href="/checkout" className="block hover:text-white transition-colors">{t('footer_checkout')}</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <span>&copy; 2026 APPI VPN. {t('footer_rights')}</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">{t('footer_privacy')}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{t('footer_terms')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
