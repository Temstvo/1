'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReveal } from '@/hooks/useReveal';

const CITIES = [
  'Франкфурт',
  'Амстердам',
  'Эйгельсховен',
  'Москва',
  'Санкт-Петербург',
  'Хельсинки',
  'Варшава',
  'Атланта',
  'Стамбул',
];

const PLANS = {
  month: [
    { id: 'personal', name: 'Личный', price: '99', deviceCount: 2, popular: false, features: ['До 1 Гбит/с, TLS 1.3', '305 серверов в 7 странах', 'VLESS · Hysteria2'] },
    { id: 'advanced', name: 'Продвинутый', price: '199', deviceCount: 4, popular: true, features: ['Всё из «Личного»', 'VLESS-XHTTP — приоритетный канал', 'Приоритетная поддержка'] },
    { id: 'family', name: 'Семья', price: '299', deviceCount: 8, popular: false, features: ['Всё из «Продвинутого»', 'Управление членами через Telegram', 'Family-режим, раздельные подключения'] },
  ],
  year: [
    { id: 'personal', name: 'Личный', price: '949', deviceCount: 2, popular: false, features: ['До 1 Гбит/с, TLS 1.3', '305 серверов в 7 странах', 'VLESS · Hysteria2'] },
    { id: 'advanced', name: 'Продвинутый', price: '1899', deviceCount: 4, popular: true, features: ['Всё из «Личного»', 'VLESS-XHTTP — приоритетный канал', 'Приоритетная поддержка'] },
    { id: 'family', name: 'Семья', price: '2849', deviceCount: 8, popular: false, features: ['Всё из «Продвинутого»', 'Управление членами через Telegram', 'Family-режим, раздельные подключения'] },
  ],
};

const FAQS = [
  {
    q: 'Сколько серверов и где они?',
    a: '305 серверов в 7 странах: Германия (Франкфурт), Нидерланды (Амстердам, Эйгельсховен), Россия (Москва, Санкт-Петербург), Финляндия (Хельсинки), Польша (Варшава), США (Атланта), Турция (Стамбул). Маршрут выбирается автоматически по минимальной задержке.',
  },
  {
    q: 'Что значит «без логов» на практике?',
    a: 'Журнал доступа пишется в /dev/null. Мы не храним IP-адреса, DNS-запросы, метки времени и посещённые домены. Системный администратор не может посмотреть, что вы делали — потому что данных физически нет.',
  },
  {
    q: 'Работает в РФ?',
    a: 'Да. Используем VLESS-XHTTP и Hysteria2 — современные протоколы, устойчивые к DPI. Если один протокол блокируется — клиент автоматически переключается на запасной.',
  },
  {
    q: 'Как происходит возврат?',
    a: 'В течение 7 дней с момента оплаты. Напишите в поддержку — средства вернутся тем же способом, которым была произведена оплата.',
  },
  {
    q: 'Какими способами можно оплатить?',
    a: 'Картой (Visa, Mastercard, МИР), через Систему Быстрых Платежей в рублях или USDT в трёх сетях (BSC, TON, TRON). Криптой деньги зачисляются за минуту, СБП — без комиссии.',
  },
  {
    q: 'Сколько устройств можно подключить?',
    a: 'Личный — 2, Продвинутый — 4, Семья — 8. Устройство можно отвязать в любой момент через личный кабинет.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [billing, setBilling] = useState<'month' | 'year'>('month');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [platform, setPlatform] = useState('desktop');
  const revealRef = useReveal<HTMLDivElement>();

  useEffect(() => {
    setPlatform(getPlatform());
    if (process.env.NEXT_PUBLIC_TAURI === 'true') {
      const token = localStorage.getItem('accessToken');
      router.replace(token ? '/vpn' : '/register');
    }
  }, [router]);

  useEffect(() => {
    const t = setTimeout(() => {
      document.querySelectorAll('.reveal').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) el.classList.add('reveal-visible');
      });
    }, 100);
    return () => clearTimeout(t);
  }, []);

  if (process.env.NEXT_PUBLIC_TAURI === 'true') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div ref={revealRef} className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* ===== NAV ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="APPI VPN" className="w-8 h-8" />
            <span className="font-bold text-lg tracking-tight">APPI·VPN</span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Возможности</a>
            <a href="#how" className="hover:text-white transition-colors">Как работает</a>
            <a href="#pricing" className="hover:text-white transition-colors">Тарифы</a>
            <a href="#faq" className="hover:text-white transition-colors">Вопросы</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">Войти</Link>
            <Link href="/register" className="px-5 py-2 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors">
              Начать
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="pt-36 md:pt-44 pb-16 md:pb-20 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] md:w-[900px] h-[500px] md:h-[800px] bg-purple-600/8 rounded-full blur-[180px] pointer-events-none animate-hero-glow" />
        <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.05] tracking-tight animate-fade-up">
            Интернет без&nbsp;границ.
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-9 max-w-xl mx-auto animate-fade-up" style={{ animationDelay: '0.1s' }}>
            VPN-сервис для тех, кто ценит честные цифры и тихую работу.
            Скорость до 1&nbsp;Гбит/с, 305&nbsp;серверов в 7&nbsp;странах.
          </p>
          <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-full font-semibold text-base transition-all hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-purple-600/25">
              Попробовать за 10&nbsp;₽
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
            <div className="mt-4">
              <a href="#how" className="text-sm text-gray-500 hover:text-white transition-colors underline underline-offset-4 decoration-gray-700">
                Как это работает
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TICKER ===== */}
      <section className="border-y border-white/5 py-4 overflow-hidden select-none">
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-1 px-6">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-ticker-dot shrink-0" />
          Все серверы онлайн
        </div>
        <div className="relative overflow-hidden">
          <div className="flex whitespace-nowrap animate-marquee w-max">
            {[...CITIES, ...CITIES].map((city, i) => (
              <span key={i} className="flex items-center text-sm text-gray-600">
                <span className="px-4">{city}</span>
                <svg className="w-3 h-3 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.9 6.9L22 12l-7.1 3.1L12 22l-2.9-6.9L2 12l7.1-3.1L12 2z" /></svg>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW WE PROTECT ===== */}
      <section className="py-20 md:py-24 px-4 md:px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 reveal">
            <div className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-3">Как защищаем</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Зашифрованный канал.</h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
              Ваш трафик идёт через TLS&nbsp;1.3 c современными шифрами. Никто посередине не видит,
              что внутри — даже мы сами.
            </p>
          </div>

          {/* Flow diagram */}
          <div className="grid md:grid-cols-3 gap-3 items-stretch reveal">
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[140px]">
              <div className="text-sm text-gray-400">Ваше устройство</div>
              <div className="mt-2 text-xs text-gray-600">DPI · блокировки</div>
            </div>
            <div className="bg-purple-600/10 border border-purple-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[140px] relative">
              <svg className="w-8 h-8 text-purple-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
              <div className="text-sm text-purple-300 font-medium">Шифрование</div>
              <div className="mt-2 text-xs text-gray-500">TLS 1.3 · VLESS-XHTTP</div>
            </div>
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[140px]">
              <div className="text-sm text-gray-400">Серверы APPI</div>
              <div className="mt-2 text-xs text-gray-600">7 стран · 305 нод</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-3 reveal">
            {[
              { value: 'TLS 1.3', label: 'Протокол шифрования' },
              { value: '< 30 ms', label: 'Средняя задержка' },
              { value: '99.95%', label: 'Аптайм за 30 суток' },
            ].map((s) => (
              <div key={s.label} className="bg-[#111] border border-white/5 rounded-2xl p-6 text-center">
                <div className="text-xl md:text-2xl font-bold text-purple-400">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-20 md:py-24 px-4 md:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 reveal">
            <div className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-3">Возможности</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Что делает APPI другим, чем остальные.</h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto">Меньше серверов, больше пропускной способности. Цифры — настоящие, замерены iperf3.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Speed */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-8 reveal">
              <div className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-2">Скорость</div>
              <h3 className="text-2xl font-bold mb-3">Без буфера. Без ограничений.</h3>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-5xl font-bold text-purple-400">850</span>
                <span className="text-xl text-gray-500 mb-1">Мбит/с</span>
              </div>
              <p className="text-sm text-gray-500">P95 за последние 30 суток (iperf3). Каждый сервер — собственный 1 Гбит/с канал.</p>
            </div>

            {/* Geography */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-8 reveal">
              <div className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-2">География</div>
              <h3 className="text-2xl font-bold mb-3">305 серверов. 7 стран.</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Германия, Нидерланды, Россия, Финляндия, Польша, США, Турция. Маршрут — по минимальной задержке.</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {['DE', 'NL', 'RU', 'FI', 'PL', 'US', 'TR'].map((c) => (
                  <span key={c} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400">{c}</span>
                ))}
              </div>
            </div>

            {/* Encryption */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-8 reveal">
              <div className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-2">Шифрование</div>
              <h3 className="text-2xl font-bold mb-4">TLS 1.3, без логов</h3>
              <pre className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 text-xs text-green-400 font-mono leading-relaxed overflow-x-auto">{`tls       = 1.3
cipher    = chacha20_poly1305
log_to    = /dev/null`}</pre>
              <p className="text-sm text-gray-500 mt-4">Современные шифры TLS 1.3 (ChaCha20-Poly1305, AES-128-GCM). Логи пишутся в /dev/null — данных физически нет.</p>
            </div>

            {/* Protocols */}
            <div className="bg-[#111] border border-white/5 rounded-2xl p-8 reveal">
              <div className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-2">Протоколы</div>
              <h3 className="text-2xl font-bold mb-4">Авто-обход DPI</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm">
                  <span>VLESS-XHTTP</span>
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm">
                  <span>Hysteria2</span>
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm">
                  <span>Reality</span>
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                </div>
              </div>
              <p className="text-sm text-gray-500">Клиент сам переключается при блокировке.</p>
            </div>
          </div>

          {/* Payment methods */}
          <div className="mt-4 bg-[#111] border border-white/5 rounded-2xl p-8 reveal">
            <div className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-2">Оплата</div>
            <h3 className="text-2xl font-bold mb-4">Любым удобным способом.</h3>
            <div className="flex flex-wrap items-center gap-3">
              {['Карта', 'СБП ₽', 'USDT BSC', 'USDT TON', 'USDT TRON'].map((m) => (
                <span key={m} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300">{m}</span>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">Карты (Visa / Mastercard / МИР), СБП без комиссии или USDT в трёх сетях.</p>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="py-20 md:py-24 px-4 md:px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 reveal">
            <div className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-3">Как это работает</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Три шага. Около трёх минут.</h2>
            <p className="text-gray-400 mt-4">От первой оплаты до защищённого соединения — меньше времени, чем уходит на кофе.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { num: '1', title: 'Выберите тариф', desc: 'Личный, Продвинутый или Семья. Можно начать с трёхдневного триала за 10 ₽ — отменить можно в любой момент.' },
              { num: '2', title: 'Установите приложение', desc: 'Готовые сборки под iOS, Android, Windows, macOS и Linux. QR-код подключения — на экране.' },
              { num: '3', title: 'Подключитесь', desc: 'Один тап. Шифрование включается до того, как первый пакет покинет устройство.' },
            ].map((s, i) => (
              <div key={i} className="bg-[#111] border border-white/5 rounded-2xl p-8 reveal">
                <div className="w-12 h-12 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center text-xl font-bold mb-5">{s.num}</div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-20 md:py-24 px-4 md:px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 reveal">
            <div className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-3">Тарифы</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Без скрытых платежей, отмена в один клик.</h2>
            <p className="text-gray-400 mt-4">Платите за месяц или год. В течение семи дней можно вернуть деньги — без вопросов.</p>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mb-10 reveal">
            <button onClick={() => setBilling('month')} className={`px-5 py-2 rounded-full text-sm transition-colors ${billing === 'month' ? 'bg-white text-black font-semibold' : 'text-gray-400 hover:text-white'}`}>Месяц</button>
            <button onClick={() => setBilling('year')} className={`px-5 py-2 rounded-full text-sm transition-colors ${billing === 'year' ? 'bg-white text-black font-semibold' : 'text-gray-400 hover:text-white'}`}>Год <span className="text-green-400 font-semibold ml-1">−20%</span></button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {PLANS[billing].map((plan, i) => (
              <div key={plan.name} className={`relative rounded-2xl p-8 border transition-all hover:-translate-y-1 ${plan.popular ? 'border-purple-500/50 bg-purple-600/5 shadow-xl shadow-purple-500/10' : 'border-white/5 bg-[#111]'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 rounded-full text-xs font-semibold whitespace-nowrap">
                    Популярный
                  </div>
                )}
                <div className="text-xs text-gray-500 mb-1">{i + 1} / {plan.name}</div>
                <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                <div className="text-3xl font-bold text-purple-400">
                  {plan.price}
                  <span className="text-sm text-gray-500 font-normal"> ₽/{billing === 'month' ? 'месяц' : 'год'}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2 mb-5">{plan.deviceCount} устройства · {billing === 'month' ? '30' : '365'} дней</div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`block text-center py-3 rounded-full font-semibold text-sm transition-all ${plan.popular ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'border border-white/10 hover:bg-white/5 text-white'}`}>
                  {plan.popular ? 'Купить →' : 'Выбрать'}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center text-sm text-gray-500 mt-8 reveal">
            <div className="mb-1"><span className="text-green-400 font-semibold">Возврат: 7 дней без вопросов</span></div>
            <div>Оплата: Карта · СБП · USDT (BSC · TON · TRON)</div>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-20 md:py-24 px-4 md:px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 reveal">
            <div className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-3">Вопросы</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Часто задаваемое.</h2>
            <p className="text-gray-400 mt-4">Не нашли ответа — напишите в <a href="https://t.me/AppiVPNBot" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline underline-offset-4">Telegram-бота</a>, отвечаем в течение часа.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className={`bg-[#111] border rounded-xl overflow-hidden transition-colors ${activeFaq === i ? 'border-purple-500/30' : 'border-white/5'}`}>
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full px-6 py-4 flex items-center justify-between text-left">
                  <span className="text-sm font-medium">{faq.q}</span>
                  <span className="text-xs text-gray-600 mr-3 shrink-0">0{i + 1}</span>
                  <svg className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-5 text-sm text-gray-400 leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-24 md:py-28 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-600/5 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Начать<br />за 10&nbsp;₽.
          </h2>
          <p className="text-gray-400 mb-8">3 дня за 10 ₽, потом автопродление по тарифу. Отменить можно в любой момент.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-full font-semibold transition-all hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-purple-600/25">
            Активировать триал
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          </Link>
          <div className="mt-4">
            <a href="#pricing" className="text-sm text-gray-500 hover:text-white transition-colors underline underline-offset-4 decoration-gray-700">Все тарифы</a>
          </div>
        </div>
      </section>

      {/* ===== TELEGRAM FLOAT ===== */}
      <a
        href="https://t.me/AppiVPNBot"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Поддержка в Telegram"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 sm:px-5 py-3.5 rounded-full bg-[#229ED9] hover:bg-[#1B8BC0] text-white font-semibold text-sm shadow-xl shadow-blue-500/25 transition-all hover:scale-105 active:scale-95"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
        <span className="hidden sm:inline">Поддержка в Telegram</span>
      </a>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-14 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="APPI VPN" className="w-7 h-7" />
              <span className="font-bold text-lg tracking-tight">APPI·VPN</span>
            </div>
            <div className="flex flex-wrap gap-10 text-sm">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Контакты</h4>
                <div className="space-y-2">
                  <a href="mailto:support@appivpn.com" className="block text-gray-400 hover:text-white transition-colors">support@appivpn.com</a>
                  <a href="https://t.me/AppiVPNBot" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-white transition-colors">Telegram · @AppiVPNBot</a>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Продукт</h4>
                <div className="space-y-2 text-gray-400">
                  <a href="#features" className="block hover:text-white transition-colors">Возможности</a>
                  <a href="#how" className="block hover:text-white transition-colors">Как работает</a>
                  <a href="#pricing" className="block hover:text-white transition-colors">Тарифы</a>
                  <a href="#faq" className="block hover:text-white transition-colors">Вопросы</a>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Документы</h4>
                <div className="space-y-2 text-gray-400">
                  <Link href="/terms" className="block hover:text-white transition-colors">Условия использования</Link>
                  <Link href="/privacy" className="block hover:text-white transition-colors">Политика конфиденциальности</Link>
                  <Link href="/refund" className="block hover:text-white transition-colors">Возврат средств</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-600">
            <span>© 2026 APPI VPN · Издание 2.0</span>
            <span>made on dry land</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function getPlatform(): string {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return 'android';
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/mac/.test(ua)) return 'macos';
  if (/linux/.test(ua)) return 'linux';
  return 'windows';
}
