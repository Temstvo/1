'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api, { apiErrorMessage } from '@/lib/api';

type Step = 'plan' | 'account' | 'payment' | 'success';
type PaymentMethod = 'yookassa' | 'sbp' | 'crypto';

interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  duration: number;
  trafficLimit: number;
  deviceLimit: number;
  features: string[];
  isActive?: boolean;
}

const LOCAL_PLANS: Plan[] = [
  {
    id: 'personal', name: 'Личный', price: 99, currency: 'RUB', duration: 30,
    trafficLimit: 1099511627776, deviceLimit: 2,
    features: ['До 1 Гбит/с, TLS 1.3', '305 серверов в 7 странах', 'VLESS · Hysteria2'],
  },
  {
    id: 'advanced', name: 'Продвинутый', price: 199, currency: 'RUB', duration: 30,
    trafficLimit: 1099511627776, deviceLimit: 4,
    features: ['Всё из «Личного»', 'VLESS-XHTTP — приоритетный канал', 'Приоритетная поддержка'],
  },
  {
    id: 'family', name: 'Семья', price: 299, currency: 'RUB', duration: 30,
    trafficLimit: 1099511627776, deviceLimit: 8,
    features: ['Всё из «Продвинутого»', 'Управление членами через Telegram', 'Family-режим'],
  },
];

function formatDuration(days: number): string {
  if (days >= 360) return `${Math.round(days / 30)} мес.`;
  if (days >= 30) return `${Math.round(days / 30)} мес.`;
  return `${days} дн.`;
}

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>('plan');
  const [plans, setPlans] = useState<Plan[]>(LOCAL_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<string>('advanced');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('yookassa');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    api.get('/plans')
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data) ? data : data.plans || [];
        const active = list.filter((p: Plan) => p.isActive !== false);
        if (active.length > 0) {
          setPlans(active);
          setSelectedPlan(active[Math.floor(active.length / 2)]?.id || active[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const plan = plans.find((p) => p.id === selectedPlan);

  const isValidPaymentUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      const allowed = ['yookassa.ru', 'yoomoney.ru', 'cryptomus.com', 'pay.cryptomus.com'];
      return allowed.some((h) => parsed.hostname === h || parsed.hostname.endsWith('.' + h));
    } catch { return false; }
  };

  const handleCreateAccount = async () => {
    if (password !== confirmPassword) { setError('Пароли не совпадают'); return; }
    if (password.length < 8) { setError('Минимум 8 символов'); return; }
    setProcessing(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setIsLoggedIn(true);
      setStep('payment');
    } catch (err: any) {
      setError(apiErrorMessage(err, 'Ошибка регистрации'));
    } finally { setProcessing(false); }
  };

  const handlePay = async () => {
    setProcessing(true);
    setError('');
    try {
      if (paymentMethod === 'yookassa' || paymentMethod === 'sbp') {
        const res = await api.post('/payments/checkout/yookassa', {
          planId: selectedPlan,
          couponCode: promoCode || undefined,
        });
        const { confirmationUrl } = res.data;
        if (confirmationUrl && isValidPaymentUrl(confirmationUrl)) {
          window.location.href = confirmationUrl;
        } else {
          setError('Не удалось получить ссылку на оплату');
          setProcessing(false);
        }
      } else if (paymentMethod === 'crypto') {
        const res = await api.post('/payments/checkout/cryptomus', {
          planId: selectedPlan,
          couponCode: promoCode || undefined,
        });
        const { paymentUrl } = res.data;
        if (paymentUrl && isValidPaymentUrl(paymentUrl)) {
          window.location.href = paymentUrl;
        } else {
          setError('Не удалось получить ссылку на оплату');
          setProcessing(false);
        }
      }
    } catch (e: any) {
      setError(apiErrorMessage(e, 'Ошибка оплаты. Попробуйте ещё раз.'));
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <header className="border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="APPI VPN" className="w-7 h-7" />
            <span className="font-bold tracking-tight">APPI·VPN</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {isLoggedIn ? (
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Кабинет</Link>
            ) : (
              <Link href="/login" className="text-gray-400 hover:text-white transition-colors">Войти</Link>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center py-8 md:py-14 px-4">
        <div className="w-full max-w-md">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">{error}</div>
          )}

          {/* ===== ШАГ 1: ТАРИФ ===== */}
          {step === 'plan' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-1 text-center">Выберите тариф</h1>
              <p className="text-gray-400 text-center mb-8 text-sm">Платите за месяц или год. Возврат — 7 дней без вопросов.</p>

              <div className="space-y-3">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`w-full flex items-center justify-between p-5 rounded-xl border transition-all text-left ${
                      selectedPlan === p.id
                        ? 'border-purple-500 bg-purple-500/5 shadow-lg shadow-purple-500/5'
                        : 'border-white/5 bg-[#111] hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        selectedPlan === p.id ? 'border-purple-500 bg-purple-500' : 'border-gray-600'
                      }`}>
                        {selectedPlan === p.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{p.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {p.deviceLimit} устройства · {formatDuration(p.duration)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-purple-400">₽{p.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-500">/мес</span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(isLoggedIn ? 'payment' : 'account')}
                className="w-full mt-6 py-3.5 bg-purple-600 hover:bg-purple-500 rounded-full font-semibold text-sm transition-colors"
                disabled={!selectedPlan || loading}
              >
                Продолжить
              </button>

              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  Возврат 7 дней
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  Без скрытых платежей
                </span>
              </div>
            </div>
          )}

          {/* ===== ШАГ 2: АККАУНТ ===== */}
          {step === 'account' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-1 text-center">Создайте аккаунт</h1>
              <p className="text-gray-400 text-center mb-6 text-sm">Email и пароль — для входа в кабинет.</p>

              <div className="bg-[#111] border border-white/5 rounded-xl p-5 space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Пароль</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Минимум 8 символов"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Повторите пароль</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep('plan')} className="flex-1 py-3.5 border border-white/10 rounded-full text-sm font-semibold text-gray-400 hover:bg-white/5 transition-colors">
                  Назад
                </button>
                <button
                  onClick={handleCreateAccount}
                  className="flex-1 py-3.5 bg-purple-600 hover:bg-purple-500 rounded-full font-semibold text-sm transition-colors disabled:opacity-50"
                  disabled={processing || !email || !password}
                >
                  {processing ? 'Создание...' : 'Создать и оплатить'}
                </button>
              </div>

              <p className="text-center text-xs text-gray-600 mt-3">
                Уже есть аккаунт? <Link href="/login" className="text-purple-400 hover:text-purple-300">Войти</Link>
              </p>
            </div>
          )}

          {/* ===== ШАГ 3: ОПЛАТА ===== */}
          {step === 'payment' && plan && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-1 text-center">Оплата</h1>
              <p className="text-gray-400 text-center mb-6 text-sm">Выберите способ оплаты.</p>

              <div className="bg-[#111] border border-white/5 rounded-xl p-5 mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Тариф</span>
                  <span className="text-white font-medium">{plan.name}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Устройств</span>
                  <span className="text-white">{plan.deviceLimit}</span>
                </div>
                <div className="border-t border-white/5 pt-2 mt-2 flex justify-between">
                  <span className="font-semibold text-white">Итого</span>
                  <span className="font-bold text-lg text-purple-400">₽{plan.price.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-3 px-1">Способ оплаты</p>
              <div className="space-y-2.5">
                {[
                  { id: 'yookassa' as PaymentMethod, icon: '💳', title: 'Карта', desc: 'Visa, Mastercard, МИР' },
                  { id: 'sbp' as PaymentMethod, icon: '⚡', title: 'СБП', desc: 'Без комиссии, из вашего банка' },
                  { id: 'crypto' as PaymentMethod, icon: '₮', title: 'USDT', desc: 'BSC · TON · TRON' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      paymentMethod === m.id ? 'border-purple-500 bg-purple-500/5' : 'border-white/5 bg-[#111] hover:border-white/10'
                    }`}
                  >
                    <span className="text-xl w-8 text-center">{m.icon}</span>
                    <div className="text-left flex-1">
                      <div className="font-medium text-white text-sm">{m.title}</div>
                      <div className="text-xs text-gray-500">{m.desc}</div>
                    </div>
                    {paymentMethod === m.id && <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white" /></div>}
                  </button>
                ))}
              </div>

              <div className="bg-[#111] border border-white/5 rounded-xl p-4 mt-4">
                <label className="text-xs text-gray-500 mb-2 block">Промокод</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Введите промокод"
                    className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(isLoggedIn ? 'plan' : 'account')} className="flex-1 py-3.5 border border-white/10 rounded-full text-sm font-semibold text-gray-400 hover:bg-white/5 transition-colors" disabled={processing}>
                  Назад
                </button>
                <button onClick={handlePay} className="flex-1 py-3.5 bg-purple-600 hover:bg-purple-500 rounded-full font-semibold text-sm transition-colors disabled:opacity-50" disabled={processing}>
                  {processing ? 'Обработка...' : `Оплатить ₽${plan.price.toLocaleString()}`}
                </button>
              </div>

              <p className="text-center text-xs text-gray-600 mt-4">🔒 Безопасная оплата · 7 дней на возврат</p>
            </div>
          )}

          {/* ===== УСПЕХ ===== */}
          {step === 'success' && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Оплата прошла!</h1>
              <p className="text-gray-400 mb-8">Ваш тариф активирован. Приятного пользования.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/downloads" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-full text-sm font-semibold transition-colors">Скачать приложение</Link>
                <Link href="/dashboard" className="px-6 py-3 border border-white/10 rounded-full text-sm font-semibold text-gray-400 hover:bg-white/5 transition-colors">Кабинет</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
