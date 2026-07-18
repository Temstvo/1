'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';
import api from '@/lib/api';

type Step = 'plan' | 'details' | 'payment' | 'processing' | 'success';
type PaymentMethod = 'yookassa' | 'sbp' | 'crypto' | 'trial';

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

function formatTraffic(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024 * 1024) return 'Unlimited';
  if (bytes >= 1024 * 1024 * 1024) return `${Math.round(bytes / (1024 * 1024 * 1024))} GB`;
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))} MB`;
  return `${bytes} B`;
}

function formatDuration(days: number): string {
  if (days >= 360) return `${Math.round(days / 360)} year`;
  if (days >= 30) return `${Math.round(days / 30)} month`;
  return `${days} days`;
}

export default function CheckoutPage() {
  const { t } = useTranslations();
  const [step, setStep] = useState<Step>('plan');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('yookassa');
  const [email, setEmail] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    api.get('/plans')
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data) ? data : data.plans || [];
        setPlans(list.filter((p: Plan) => p.isActive !== false));
        if (list.length > 0) setSelectedPlan(list[0].id);
      })
      .catch(() => {
        setPlans([
          { id: 'trial', name: 'Trial', price: 0, currency: 'RUB', duration: 1, trafficLimit: 10 * 1024 * 1024 * 1024, deviceLimit: 2, features: ['24h access', 'All servers'] },
          { id: 'monthly', name: '1 Month', price: 499, currency: 'RUB', duration: 30, trafficLimit: 50 * 1024 * 1024 * 1024, deviceLimit: 3, features: ['All protocols', 'All servers'] },
          { id: 'quarterly', name: '3 Months', price: 1199, currency: 'RUB', duration: 90, trafficLimit: 200 * 1024 * 1024 * 1024, deviceLimit: 5, features: ['All protocols', 'All servers', 'Save 20%'] },
          { id: 'annual', name: '1 Year', price: 3999, currency: 'RUB', duration: 365, trafficLimit: 1024 * 1024 * 1024 * 1024 * 100, deviceLimit: 10, features: ['All protocols', 'All servers', 'Dedicated IP', 'Save 33%'] },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const plan = plans.find((p) => p.id === selectedPlan);
  const finalPrice = plan ? Math.max(0, plan.price - discount) : 0;
  const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('accessToken');

  const handlePromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const res = await api.post('/coupons/validate', { code: promoCode, planId: selectedPlan, amount: plan?.price || 0 });
      if (res.data.valid) {
        setPromoApplied(true);
        setDiscount(res.data.discount?.amount || 0);
      } else {
        setError('Invalid promo code');
        setTimeout(() => setError(''), 3000);
      }
    } catch {
      setPromoApplied(false);
      setDiscount(0);
      setError('Invalid promo code');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleStartTrial = async () => {
    if (!isLoggedIn) {
      window.location.href = '/register?redirect=/checkout';
      return;
    }
    setProcessing(true);
    try {
      const res = await api.post('/subscriptions/trial');
      if (res.data.subscription) {
        setStep('success');
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to start trial');
      setTimeout(() => setError(''), 4000);
    } finally {
      setProcessing(false);
    }
  };

  const handlePay = async () => {
    if (!isLoggedIn) {
      window.location.href = '/register?redirect=/checkout';
      return;
    }

    if (paymentMethod === 'trial') {
      await handleStartTrial();
      return;
    }

    setProcessing(true);
    setError('');

    try {
      if (paymentMethod === 'yookassa' || paymentMethod === 'sbp') {
        const res = await api.post('/payments/checkout/yookassa', {
          planId: selectedPlan,
          couponCode: promoApplied ? promoCode : undefined,
        });
        const { confirmationUrl } = res.data;
        if (confirmationUrl) {
          window.location.href = confirmationUrl;
        } else {
          setError('Payment URL not received');
          setProcessing(false);
        }
      } else if (paymentMethod === 'crypto') {
        const res = await api.post('/payments/checkout/cryptomus', {
          planId: selectedPlan,
          couponCode: promoApplied ? promoCode : undefined,
        });
        const { paymentUrl } = res.data;
        if (paymentUrl) {
          window.location.href = paymentUrl;
        } else {
          setError('Payment URL not received');
          setProcessing(false);
        }
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col">
      <header className="border-b border-white/5 bg-[#0d0d0d]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="APPI VPN" className="w-7 h-7" />
            <span className="font-bold">APPI VPN</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors">{t('checkout_signin')}</Link>
            <Link href="/register" className="text-gray-400 hover:text-white transition-colors">{t('checkout_register')}</Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center py-12 px-6">
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-center gap-2 mb-10">
            {(['plan', 'details', 'payment'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s ? 'bg-purple-600 text-white' : i < ['plan', 'details', 'payment'].indexOf(step) ? 'bg-purple-600/20 text-purple-400' : 'bg-white/5 text-gray-600'
                }`}>
                  {i < ['plan', 'details', 'payment'].indexOf(step) ? '✓' : i + 1}
                </div>
                {i < 2 && <div className={`w-12 h-0.5 ${i < ['plan', 'details', 'payment'].indexOf(step) ? 'bg-purple-600/40' : 'bg-white/5'}`} />}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {step === 'plan' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-2 text-center">{t('checkout_step_plan')}</h1>
              <p className="text-gray-400 text-center mb-8">{t('checkout_step_plan_sub')}</p>

              <button
                onClick={() => { setSelectedPlan('trial'); setPaymentMethod('trial'); setStep('payment'); }}
                className="w-full mb-3 p-5 rounded-xl border border-green-500/30 bg-green-500/5 hover:bg-green-500/10 transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm">
                      24h
                    </div>
                    <div>
                      <div className="font-semibold text-white">Free Trial</div>
                      <div className="text-xs text-gray-500">No card required · 10 GB · 2 devices</div>
                    </div>
                  </div>
                  <span className="text-green-400 font-bold">Free</span>
                </div>
              </button>

              <div className="space-y-3">
                {loading ? (
                  <>
                    <div className="h-[72px] bg-white/5 rounded-xl animate-pulse" />
                    <div className="h-[72px] bg-white/5 rounded-xl animate-pulse" />
                    <div className="h-[72px] bg-white/5 rounded-xl animate-pulse" />
                  </>
                ) : plans.filter(p => p.price > 0).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`w-full flex items-center justify-between p-5 rounded-xl border transition-all text-left ${
                      selectedPlan === p.id
                        ? 'border-purple-500 bg-purple-500/5'
                        : 'border-white/5 bg-[#141414] hover:border-white/10'
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
                          {formatTraffic(p.trafficLimit)} · {p.deviceLimit} devices · {formatDuration(p.duration)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-white">₽{p.price.toLocaleString()}</span>
                      <span className="text-xs text-gray-500">/{formatDuration(p.duration)}</span>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep('details')} className="w-full mt-6 py-3.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-sm transition-colors" disabled={!selectedPlan || processing}>
                {t('checkout_continue')}
              </button>
            </div>
          )}

          {step === 'details' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-2 text-center">{t('checkout_details_title')}</h1>
              <p className="text-gray-400 text-center mb-8">{t('checkout_details_sub')}</p>
              <div className="bg-[#141414] border border-white/5 rounded-xl p-6">
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">{t('checkout_email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep('plan')} className="flex-1 py-3.5 border border-white/10 rounded-xl text-sm font-semibold text-gray-400 hover:bg-white/5 transition-colors">
                  {t('checkout_back')}
                </button>
                <button onClick={() => setStep('payment')} className="flex-1 py-3.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-sm transition-colors">
                  {t('checkout_continue')}
                </button>
              </div>
            </div>
          )}

          {step === 'payment' && plan && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-2 text-center">{t('checkout_payment_title')}</h1>
              <p className="text-gray-400 text-center mb-8">{t('checkout_payment_sub')}</p>

              <div className="bg-[#141414] border border-white/5 rounded-xl p-5 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">{t('checkout_plan')}</span>
                  <span className="text-white font-medium">{plan.name}</span>
                </div>
                {plan.price > 0 && (
                  <>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">{t('checkout_price')}</span>
                      <span className="text-white">₽{plan.price.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm mb-2 text-green-400">
                        <span>Discount</span>
                        <span>-₽{discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-white/5 pt-2 mt-2 flex justify-between">
                      <span className="font-semibold text-white">{t('checkout_total')}</span>
                      <span className="font-bold text-lg text-white">₽{finalPrice.toLocaleString()}</span>
                    </div>
                  </>
                )}
                {plan.price === 0 && (
                  <div className="border-t border-white/5 pt-2 mt-2 flex justify-between">
                    <span className="font-semibold text-white">{t('checkout_total')}</span>
                    <span className="font-bold text-lg text-green-400">Free</span>
                  </div>
                )}
              </div>

              {plan.price > 0 && (
                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod('yookassa')}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      paymentMethod === 'yookassa' ? 'border-purple-500 bg-purple-500/5' : 'border-white/5 bg-[#141414] hover:border-white/10'
                    }`}
                  >
                    <span className="text-2xl">💳</span>
                    <div className="text-left">
                      <div className="font-medium text-white text-sm">Bank Card</div>
                      <div className="text-xs text-gray-500">MIR, Visa, Mastercard</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('sbp')}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      paymentMethod === 'sbp' ? 'border-purple-500 bg-purple-500/5' : 'border-white/5 bg-[#141414] hover:border-white/10'
                    }`}
                  >
                    <span className="text-2xl">⚡</span>
                    <div className="text-left">
                      <div className="font-medium text-white text-sm">СБП</div>
                      <div className="text-xs text-gray-500">Система быстрых платежей</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('crypto')}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      paymentMethod === 'crypto' ? 'border-purple-500 bg-purple-500/5' : 'border-white/5 bg-[#141414] hover:border-white/10'
                    }`}
                  >
                    <span className="text-2xl">₿</span>
                    <div className="text-left">
                      <div className="font-medium text-white text-sm">Crypto</div>
                      <div className="text-xs text-gray-500">USDT, BTC, ETH</div>
                    </div>
                  </button>
                </div>
              )}

              <div className="bg-[#141414] border border-white/5 rounded-xl p-4 mt-4">
                <label className="text-xs text-gray-500 mb-2 block">Promo code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-1 bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <button onClick={handlePromo} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors">
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <p className="mt-2 text-xs text-green-400 flex items-center justify-between">
                    <span>Promo applied: -₽{discount.toLocaleString()}</span>
                    <button onClick={() => { setPromoCode(''); setPromoApplied(false); setDiscount(0); }} className="text-gray-500 hover:text-white">✕</button>
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep('details')} className="flex-1 py-3.5 border border-white/10 rounded-xl text-sm font-semibold text-gray-400 hover:bg-white/5 transition-colors" disabled={processing}>
                  {t('checkout_back')}
                </button>
                <button onClick={handlePay} className="flex-1 py-3.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50" disabled={processing}>
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Processing...
                    </span>
                  ) : plan.price === 0 ? t('checkout_get_free') : `Pay ₽${finalPrice.toLocaleString()}`}
                </button>
              </div>

              <p className="text-center text-xs text-gray-600 mt-4">🔒 Secure payment via YooKassa / Cryptomus</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{t('checkout_success')}</h1>
              <p className="text-gray-400 mb-8">{t('checkout_success_sub')}</p>
              <div className="flex gap-3 justify-center">
                <Link href="/vpn" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-semibold transition-colors">
                  Go to VPN Dashboard
                </Link>
                <Link href="/" className="px-6 py-3 border border-white/10 rounded-xl text-sm font-semibold text-gray-400 hover:bg-white/5 transition-colors">
                  {t('checkout_home')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
