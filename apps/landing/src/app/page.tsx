'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { t, type Locale } from '@/lib/i18n';

const FRONTEND = 'https://appi-frontend.vercel.app';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

export default function Home() {
  const [lang, setLang] = useState<Locale>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Locale;
    if (saved) setLang(saved);
  }, []);

  const switchLang = () => {
    const next = lang === 'en' ? 'ru' : 'en';
    setLang(next);
    localStorage.setItem('lang', next);
  };

  const features = [
    { icon: '\u26A1', key: 'speed' },
    { icon: '\uD83D\uDEE1\uFE0F', key: 'security' },
    { icon: '\uD83D\uDCF1', key: 'devices' },
    { icon: '\uD83D\uDCAC', key: 'support' },
  ];

  const protocols = [
    { key: 'vless', color: 'from-blue-500 to-cyan-400' },
    { key: 'trojan', color: 'from-purple-500 to-pink-400' },
    { key: 'ss', color: 'from-green-500 to-emerald-400' },
  ];

  const plans = [
    { name: 'Basic', price: '$4.99', features: ['3 devices', '5 countries', 'VLESS Reality'] },
    { name: 'Pro', price: '$9.99', features: ['10 devices', 'All countries', 'All protocols', 'Priority support'], popular: true },
    { name: 'Premium', price: '$14.99', features: ['Unlimited devices', 'All countries', 'All protocols', 'Dedicated IP', '24/7 support'] },
  ];

  const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-gray-900/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="APPI VPN" className="h-9 w-9" />
            <span className="text-xl font-bold text-white">APPI VPN</span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">{t(lang, 'features.title')}</a>
            <a href="#protocols" className="text-sm text-gray-300 hover:text-white transition-colors">{t(lang, 'protocols.title')}</a>
            <a href="#pricing" className="text-sm text-gray-300 hover:text-white transition-colors">{t(lang, 'pricing.title')}</a>
            <a href="#faq" className="text-sm text-gray-300 hover:text-white transition-colors">{t(lang, 'faq.title')}</a>
            <button onClick={switchLang} className="text-xs font-medium text-gray-400 hover:text-white border border-white/20 rounded px-2 py-1 transition-colors">
              {lang === 'en' ? 'RU' : 'EN'}
            </button>
            <a href={`${FRONTEND}/login`} className="text-sm text-gray-300 hover:text-white">{t(lang, 'nav.login')}</a>
            <a href={`${FRONTEND}/register`} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors">{t(lang, 'nav.getStarted')}</a>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden md:hidden border-t border-white/10">
              <div className="flex flex-col gap-3 px-6 py-4">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white">{t(lang, 'features.title')}</a>
                <a href="#protocols" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white">{t(lang, 'protocols.title')}</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white">{t(lang, 'pricing.title')}</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 hover:text-white">{t(lang, 'faq.title')}</a>
                <button onClick={switchLang} className="text-left text-gray-400 hover:text-white">{lang === 'en' ? 'Русский' : 'English'}</button>
                <a href={`${FRONTEND}/register`} className="rounded-lg bg-blue-600 px-4 py-2 text-center font-semibold text-white">{t(lang, 'nav.getStarted')}</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent" />
        <motion.div initial="hidden" animate="visible" variants={stagger} className="relative mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
          <motion.h1 variants={fadeUp} className="text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl whitespace-pre-line">
            {t(lang, 'hero.title')}
          </motion.h1>
          <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-lg text-blue-200 whitespace-pre-line md:text-xl">
            {t(lang, 'hero.subtitle')}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href={`${FRONTEND}/register`} className="rounded-xl bg-blue-600 px-8 py-3.5 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition-all hover:shadow-blue-500/40">
              {t(lang, 'hero.cta')}
            </a>
            <a href="#download" className="rounded-xl border border-white/20 px-8 py-3.5 text-lg font-semibold text-white hover:bg-white/10 transition-colors">
              {t(lang, 'hero.download')}
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-3xl font-bold text-center text-white md:text-4xl">
          {t(lang, 'features.title')}
        </motion.h2>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <motion.div key={f.key} variants={fadeUp} className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-300">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-white">{t(lang, `feature.${f.key}.title`)}</h3>
              <p className="mt-2 text-sm text-gray-400">{t(lang, `feature.${f.key}.desc`)}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Protocols */}
      <section id="protocols" className="mx-auto max-w-6xl px-6 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-center text-white md:text-4xl">{t(lang, 'protocols.title')}</motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-center text-gray-400 text-lg">{t(lang, 'protocols.subtitle')}</motion.p>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mt-14 grid gap-8 md:grid-cols-3">
          {protocols.map((p) => (
            <motion.div key={p.key} variants={fadeUp} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur hover:border-blue-500/30 transition-all duration-300">
              <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${p.color} opacity-20 blur-3xl`} />
              <div className="relative">
                <h3 className="text-xl font-bold text-white">{t(lang, `protocols.${p.key}.title`)}</h3>
                <p className="mt-3 text-gray-400">{t(lang, `protocols.${p.key}.desc`)}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-center text-white md:text-4xl">{t(lang, 'pricing.title')}</motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-center text-gray-400 text-lg">{t(lang, 'pricing.subtitle')}</motion.p>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mt-14 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <motion.div key={plan.name} variants={fadeUp} className={`relative rounded-2xl p-8 border transition-all duration-300 ${plan.popular ? 'border-blue-500/50 bg-blue-600/10 shadow-lg shadow-blue-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">
                  {t(lang, 'pricing.popular')}
                </div>
              )}
              <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
              <p className="mt-4 text-4xl font-bold text-white">{plan.price}<span className="text-lg text-gray-400">{t(lang, 'pricing.monthly')}</span></p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <svg className="h-4 w-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a href={`${FRONTEND}/checkout`} className={`mt-8 block rounded-xl py-3 text-center font-semibold transition-all duration-300 ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/25' : 'border border-white/20 text-white hover:bg-white/10'}`}>
                {t(lang, 'pricing.getStarted')}
              </a>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Download */}
      <section id="download" className="mx-auto max-w-6xl px-6 py-20">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-12 text-center">
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-white md:text-4xl">{t(lang, 'download.title')}</motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-gray-400 text-lg">{t(lang, 'download.subtitle')}</motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={`${FRONTEND}/downloads`} className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-white font-medium hover:bg-white/10 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" /></svg>
              Windows
            </a>
            <a href={`${FRONTEND}/downloads`} className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-white font-medium hover:bg-white/10 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
              macOS
            </a>
            <a href={`${FRONTEND}/downloads`} className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-white font-medium hover:bg-white/10 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z" /></svg>
              Android
            </a>
            <a href={`${FRONTEND}/downloads`} className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-white font-medium hover:bg-white/10 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
              iOS
            </a>
          </motion.div>
          <motion.p variants={fadeUp} className="mt-6 text-sm text-gray-500">
            {t(lang, 'download.hint')}
          </motion.p>
        </motion.div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-20">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-3xl font-bold text-center text-white md:text-4xl">
          {t(lang, 'faq.title')}
        </motion.h2>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mt-14 space-y-3">
          {faqKeys.map((qKey, i) => (
            <motion.div key={qKey} variants={fadeUp} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between px-6 py-4 text-left text-white font-medium hover:bg-white/5 transition-colors">
                <span>{t(lang, `faq.${qKey}`)}</span>
                <svg className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <p className="px-6 pb-4 text-gray-400 text-sm leading-relaxed">{t(lang, `faq.a${i + 1}`)}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="APPI VPN" className="h-6 w-6" />
            <span className="text-sm text-gray-400">&copy; 2026 APPI VPN. {t(lang, 'footer.rights')}</span>
          </div>
          <div className="flex gap-6">
            <a href={`${FRONTEND}/privacy`} className="text-sm text-gray-400 hover:text-white transition-colors">{t(lang, 'footer.privacy')}</a>
            <a href={`${FRONTEND}/terms`} className="text-sm text-gray-400 hover:text-white transition-colors">{t(lang, 'footer.terms')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
