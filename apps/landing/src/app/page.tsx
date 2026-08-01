'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { t, type Locale } from '@/lib/i18n';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Home() {
  const [lang, setLang] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Locale;
    if (saved) setLang(saved);
  }, []);

  const switchLang = () => {
    const next = lang === 'en' ? 'ru' : 'en';
    setLang(next);
    localStorage.setItem('lang', next);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-gray-900/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="APPI VPN" className="h-9 w-9" />
            <span className="text-xl font-bold text-white">APPI VPN</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={switchLang} className="text-xs text-gray-400 hover:text-white border border-white/20 rounded px-2 py-1">
              {lang === 'en' ? 'RU' : 'EN'}
            </button>
            <a href="/login" className="text-sm text-gray-300 hover:text-white">{t(lang, 'nav.login')}</a>
            <a href="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">{t(lang, 'nav.getStarted')}</a>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className="flex min-h-[70vh] flex-col items-center justify-center text-center">
          <motion.h1 variants={fadeUp} className="text-4xl font-bold leading-tight text-white md:text-6xl">
            {t(lang, 'hero.title')}
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-5 max-w-xl text-lg text-blue-200 md:text-xl">
            {t(lang, 'hero.subtitle')}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="/register" className="rounded-xl bg-blue-600 px-8 py-3.5 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition-all">
              {t(lang, 'hero.cta')}
            </a>
            <a href="#pricing" className="rounded-xl border border-white/20 px-8 py-3.5 text-lg font-semibold text-white hover:bg-white/10 transition-colors">
              {t(lang, 'hero.plans')}
            </a>
          </motion.div>
        </motion.div>

        <section id="pricing" className="pb-24">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="grid gap-6 md:grid-cols-3">
            {[
              { name: 'Basic', price: '$4.99', features: ['3 устройства', '5 стран', 'VLESS Reality'] },
              { name: 'Pro', price: '$9.99', features: ['10 устройств', 'Все страны', 'Все протоколы', 'Приоритетная поддержка'], popular: true },
              { name: 'Premium', price: '$14.99', features: ['Безлимит устройств', 'Все страны', 'Все протоколы', 'Выделенный IP', 'Поддержка 24/7'] },
            ].map((plan) => (
              <motion.div key={plan.name} variants={fadeUp} className={`relative rounded-2xl p-8 border transition-all ${plan.popular ? 'border-blue-500/50 bg-blue-600/10' : 'border-white/10 bg-white/5'}`}>
                {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">{t(lang, 'pricing.popular')}</div>}
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                <p className="mt-3 text-4xl font-bold text-white">{plan.price}<span className="text-lg text-gray-400">{t(lang, 'pricing.monthly')}</span></p>
                <ul className="mt-5 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <svg className="h-4 w-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="/register" className={`mt-6 block rounded-xl py-3 text-center font-semibold transition-all ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-500' : 'border border-white/20 text-white hover:bg-white/10'}`}>
                  {t(lang, 'pricing.getStarted')}
                </a>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-sm text-gray-500">
        © 2026 APPI VPN
      </footer>
    </div>
  );
}
