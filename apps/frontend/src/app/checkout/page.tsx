'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';
import api from '@/lib/api';

type Step = 'plan' | 'account' | 'payment' | 'processing' | 'success';
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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    api.get('/plans')
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data) ? data : data.plans || [];
        setPlans(list.filter((p: Plan) => p.isActive !== false));
        if (list.length > 0) setSelectedPlan(list[0].id);
      })
      .catch(() => {
        setPlans([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const plan = plans.find((p) => p.id === selectedPlan);
  const finalPrice = plan ? Math.max(0, plan.price - discount) : 0;

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

  const handleCreateAccount = async () => {
    if (password !== confirmPassword) {
      setError(t('checkout_passwords_no_match'));
      return;
    }
    if (password.length < 8) {
      setError(t('checkout_password_short'));
      return;
    }

    setProcessing(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setIsLoggedIn(true);
      setStep('payment');
    } catch (err: any) {
      setError(err.response?.data?.message || t('checkout_account_error'));
    } finally {
      setProcessing(false);
    }
  };

  const isValidPaymentUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      const allowedHosts = [
        'yookassa.ru',
        'yoomoney.ru',
        'cryptomus.com',
        'pay.cryptomus.com',
      ];
      return allowedHosts.some((h) => parsed.hostname === h || parsed.hostname.endsWith('.' + h));
    } catch {
      return false;
    }
  };

  const handlePay = async () => {
    setProcessing(true);
    setError('');

    try {
      if (paymentMethod === 'yookassa' || paymentMethod === 'sbp') {
        const res = await api.post('/payments/checkout/yookassa', {
          planId: selectedPlan,
          couponCode: promoApplied ? promoCode : undefined,
        });
        const { confirmationUrl } = res.data;
        if (confirmationUrl && isValidPaymentUrl(confirmationUrl)) {
          window.location.href = confirmationUrl;
        } else {
          setError('Invalid payment URL');
          setProcessing(false);
        }
      } else if (paymentMethod === 'crypto') {
        const res = await api.post('/payments/checkout/cryptomus', {
          planId: selectedPlan,
          couponCode: promoApplied ? promoCode : undefined,
        });
        const { paymentUrl } = res.data;
        if (paymentUrl && isValidPaymentUrl(paymentUrl)) {
          window.location.href = paymentUrl;
        } else {
          setError('Invalid payment URL');
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
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="APPI VPN" className="w-7 h-7" />
            <span className="font-bold">APPI VPN</span>
          </Link>
          <div className="flex items-center gap-3 md:gap-4 text-sm">
            {isLoggedIn ? (
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">{t('checkout_dashboard')}</Link>
            ) : (
              <>
                <Link href="/login" className="text-gray-400 hover:text-white transition-colors">{t('checkout_signin')}</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center py-6 md:py-12 px-4 md:px-6">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-center gap-2 mb-8">
            {(['plan', 'account', 'payment'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s ? 'bg-purple-600 text-white' : i < (['plan', 'account', 'payment'] as Step[]).indexOf(step as Step) ? 'bg-purple-600/20 text-purple-400' : 'bg-white/5 text-gray-600'
                }`}>
                  {i < (['plan', 'account', 'payment'] as Step[]).indexOf(step as Step) ? '✓' : i + 1}
                </div>
                {i < 2 && <div className={`w-12 h-0.5 ${i < (['plan', 'account', 'payment'] as Step[]).indexOf(step as Step) ? 'bg-purple-600/40' : 'bg-white/5'}`} />}
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
              <h1 className="text-2xl font-bold text-white mb-1 text-center">{t('checkout_plan_title')}</h1>
              <p className="text-gray-400 text-center mb-6 text-sm">{t('checkout_plan_sub')}</p>

              <div className="space-y-3">
                {!loading && plans.length === 0 && (
                  <div className="text-center text-gray-500 py-8">{t('checkout_no_plans')}</div>
                )}
                {loading ? (
                  <>
                    <div className="h-[72px] bg-white/5 rounded-xl animate-pulse" />
                    <div className="h-[72px] bg-white/5 rounded-xl animate-pulse" />
                    <div className="h-[72px] bg-white/5 rounded-xl animate-pulse" />
                  </>
                ) : plans.map((p) => (
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
              <button onClick={() => setStep(isLoggedIn ? 'payment' : 'account')} className="w-full mt-6 py-3.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-sm transition-colors" disabled={!selectedPlan || loading || processing}>
                {t('checkout_continue')}
              </button>
              <p className="text-center text-xs text-gray-600 mt-3">🔒 30-day money-back guarantee</p>
            </div>
          )}

          {step === 'account' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-1 text-center">{t('checkout_account_title')}</h1>
              <p className="text-gray-400 text-center mb-6 text-sm">{t('checkout_account_sub')}</p>

              <div className="bg-[#141414] border border-white/5 rounded-xl p-5 space-y-4">
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
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">{t('checkout_password')}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">{t('checkout_confirm_password')}</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep('plan')} className="flex-1 py-3.5 border border-white/10 rounded-xl text-sm font-semibold text-gray-400 hover:bg-white/5 transition-colors">
                  {t('checkout_back')}
                </button>
                <button onClick={handleCreateAccount} className="flex-1 py-3.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50" disabled={processing || !email || !password}>
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      {t('checkout_creating')}
                    </span>
                  ) : t('checkout_create_pay')}
                </button>
              </div>
              <p className="text-center text-xs text-gray-600 mt-3">Already have an account? <Link href="/login" className="text-purple-400 hover:text-purple-300">Sign in</Link></p>
            </div>
          )}

          {step === 'payment' && plan && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-1 text-center">{t('checkout_payment_title')}</h1>
              <p className="text-gray-400 text-center mb-6 text-sm">{t('checkout_payment_sub')}</p>

              <div className="bg-[#141414] border border-white/5 rounded-xl p-5 mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">{t('checkout_plan')}</span>
                  <span className="text-white font-medium">{plan.name}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">{t('checkout_duration')}</span>
                  <span className="text-white">{formatDuration(plan.duration)}</span>
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
              </div>

              <p className="text-xs text-gray-500 mb-3 px-1">{t('checkout_payment_method')}</p>
              <div className="space-y-2.5">
                <button
                  onClick={() => setPaymentMethod('yookassa')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    paymentMethod === 'yookassa' ? 'border-purple-500 bg-purple-500/5' : 'border-white/5 bg-[#141414] hover:border-white/10'
                  }`}
                >
                  <span className="text-xl">💳</span>
                  <div className="text-left flex-1">
                    <div className="font-medium text-white text-sm">{t('checkout_card')}</div>
                    <div className="text-xs text-gray-500">MIR, Visa, Mastercard</div>
                  </div>
                  {paymentMethod === 'yookassa' && <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white" /></div>}
                </button>

                <button
                  onClick={() => setPaymentMethod('sbp')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    paymentMethod === 'sbp' ? 'border-purple-500 bg-purple-500/5' : 'border-white/5 bg-[#141414] hover:border-white/10'
                  }`}
                >
                  <span className="text-xl">⚡</span>
                  <div className="text-left flex-1">
                    <div className="font-medium text-white text-sm">{t('checkout_sbp')}</div>
                    <div className="text-xs text-gray-500">{t('checkout_sbp_desc')}</div>
                  </div>
                  {paymentMethod === 'sbp' && <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white" /></div>}
                </button>

                <button
                  onClick={() => setPaymentMethod('crypto')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    paymentMethod === 'crypto' ? 'border-purple-500 bg-purple-500/5' : 'border-white/5 bg-[#141414] hover:border-white/10'
                  }`}
                >
                  <span className="text-xl">₿</span>
                  <div className="text-left flex-1">
                    <div className="font-medium text-white text-sm">{t('checkout_crypto')}</div>
                    <div className="text-xs text-gray-500">{t('checkout_crypto_desc')}</div>
                  </div>
                  {paymentMethod === 'crypto' && <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white" /></div>}
                </button>
              </div>

              <div className="bg-[#141414] border border-white/5 rounded-xl p-4 mt-4">
                <label className="text-xs text-gray-500 mb-2 block">{t('checkout_promo')}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder={t('checkout_promo_enter')}
                    className="flex-1 bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <button onClick={handlePromo} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors">
                    {t('checkout_promo_apply')}
                  </button>
                </div>
                {promoApplied && (
                  <p className="mt-2 text-xs text-green-400 flex items-center justify-between">
                    <span>{t('checkout_promo_ok')}</span>
                    <button onClick={() => { setPromoCode(''); setPromoApplied(false); setDiscount(0); }} className="text-gray-500 hover:text-white">✕</button>
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(isLoggedIn ? 'plan' : 'account')} className="flex-1 py-3.5 border border-white/10 rounded-xl text-sm font-semibold text-gray-400 hover:bg-white/5 transition-colors" disabled={processing}>
                  {t('checkout_back')}
                </button>
                <button onClick={handlePay} className="flex-1 py-3.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50" disabled={processing}>
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      {t('checkout_processing')}
                    </span>
                  ) : `Pay ₽${finalPrice.toLocaleString()}`}
                </button>
              </div>

              <p className="text-center text-xs text-gray-600 mt-4">🔒 {t('checkout_secure')}</p>
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
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/downloads" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-semibold transition-colors">
                  {t('checkout_download_app')}
                </Link>
                <Link href="/dashboard" className="px-6 py-3 border border-white/10 rounded-xl text-sm font-semibold text-gray-400 hover:bg-white/5 transition-colors">
                  {t('checkout_dashboard')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
