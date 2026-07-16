'use client';

import { useState } from 'react';
import Link from 'next/link';

type Step = 'plan' | 'details' | 'payment' | 'success';
type PaymentMethod = 'card' | 'crypto' | 'telegram';

const plans = [
  { id: 'trial', name: 'Trial', price: 0, period: '7 days', traffic: '10 GB', devices: 2, features: ['WireGuard, OpenVPN', '5 servers', 'Email support'] },
  { id: 'monthly', name: '1 Month', price: 499, period: 'month', traffic: '50 GB', devices: 3, features: ['All protocols', 'All servers', 'Email support'] },
  { id: 'quarterly', name: '3 Months', price: 1199, period: '3 months', traffic: '200 GB', devices: 5, features: ['All protocols', 'All servers', 'Priority support', 'Save 20%'] },
  { id: 'annual', name: '1 Year', price: 3999, period: 'year', traffic: 'Unlimited', devices: 10, features: ['All protocols', 'All servers', '24/7 support', 'Dedicated IP', 'Save 33%'] },
];

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>('plan');
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [email, setEmail] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const plan = plans.find((p) => p.id === selectedPlan)!;
  const discount = promoApplied ? Math.round(plan.price * 0.1) : 0;
  const finalPrice = plan.price - discount;

  const handlePromo = () => {
    if (promoCode.toUpperCase() === 'NEO10' || promoCode.toUpperCase() === 'APP10') {
      setPromoApplied(true);
    }
  };

  const handlePay = async () => {
    if (paymentMethod === 'telegram') {
      window.open(`https://t.me/AppiVPNBot?start=pay_${selectedPlan}`, '_blank');
      return;
    }
    setStep('success');
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0d0d0d]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="APPI VPN" className="w-7 h-7" />
            <span className="font-bold">APPI VPN</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="text-gray-400 hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center py-12 px-6">
        <div className="w-full max-w-2xl">
          {/* Steps indicator */}
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

          {step === 'plan' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-2 text-center">Choose a Plan</h1>
              <p className="text-gray-400 text-center mb-8">Select the plan that suits you</p>
              <div className="space-y-3">
                {plans.map((p) => (
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
                        <div className="text-xs text-gray-500 mt-0.5">{p.traffic} · {p.devices} devices · {p.period}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {p.price === 0 ? (
                        <span className="text-green-400 font-bold">Free</span>
                      ) : (
                        <div>
                          <span className="text-lg font-bold text-white">₽{p.price.toLocaleString()}</span>
                          <span className="text-xs text-gray-500">/{p.period}</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep('details')} className="w-full mt-6 py-3.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-sm transition-colors">
                Continue
              </button>
            </div>
          )}

          {step === 'details' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-2 text-center">Your Details</h1>
              <p className="text-gray-400 text-center mb-8">Enter your email to receive the VPN key</p>
              <div className="bg-[#141414] border border-white/5 rounded-xl p-6 space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter promo code"
                      className="flex-1 bg-[#0d0d0d] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <button onClick={handlePromo} className="px-5 py-3 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors">
                      Apply
                    </button>
                  </div>
                  {promoApplied && <p className="mt-2 text-xs text-green-400">Promo code applied! 10% discount</p>}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep('plan')} className="flex-1 py-3.5 border border-white/10 rounded-xl text-sm font-semibold text-gray-400 hover:bg-white/5 transition-colors">
                  Back
                </button>
                <button onClick={() => setStep('payment')} className="flex-1 py-3.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-sm transition-colors">
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-2 text-center">Payment</h1>
              <p className="text-gray-400 text-center mb-8">Choose a payment method</p>

              {/* Order summary */}
              <div className="bg-[#141414] border border-white/5 rounded-xl p-5 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Plan</span>
                  <span className="text-white font-medium">{plan.name}</span>
                </div>
                {plan.price > 0 && (
                  <>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Price</span>
                      <span className="text-white">₽{plan.price.toLocaleString()}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm mb-2 text-green-400">
                        <span>Discount (10%)</span>
                        <span>-₽{discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-white/5 pt-2 mt-2 flex justify-between">
                      <span className="font-semibold text-white">Total</span>
                      <span className="font-bold text-lg text-white">₽{finalPrice.toLocaleString()}</span>
                    </div>
                  </>
                )}
                {plan.price === 0 && (
                  <div className="border-t border-white/5 pt-2 mt-2 flex justify-between">
                    <span className="font-semibold text-white">Total</span>
                    <span className="font-bold text-lg text-green-400">Free</span>
                  </div>
                )}
              </div>

              {/* Payment methods */}
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    paymentMethod === 'card' ? 'border-purple-500 bg-purple-500/5' : 'border-white/5 bg-[#141414] hover:border-white/10'
                  }`}
                >
                  <span className="text-2xl">💳</span>
                  <div className="text-left">
                    <div className="font-medium text-white text-sm">Bank Card (SBP / Visa / Mastercard)</div>
                    <div className="text-xs text-gray-500">Instant payment via YooKassa</div>
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
                    <div className="font-medium text-white text-sm">Cryptocurrency</div>
                    <div className="text-xs text-gray-500">BTC, ETH, USDT, LTC and other</div>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('telegram')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    paymentMethod === 'telegram' ? 'border-purple-500 bg-purple-500/5' : 'border-white/5 bg-[#141414] hover:border-white/10'
                  }`}
                >
                  <span className="text-2xl">📱</span>
                  <div className="text-left">
                    <div className="font-medium text-white text-sm">Telegram Bot</div>
                    <div className="text-xs text-gray-500">Pay via @AppiVPNBot</div>
                  </div>
                </button>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep('details')} className="flex-1 py-3.5 border border-white/10 rounded-xl text-sm font-semibold text-gray-400 hover:bg-white/5 transition-colors">
                  Back
                </button>
                <button onClick={handlePay} className="flex-1 py-3.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-sm transition-colors">
                  {plan.price === 0 ? 'Get Free Key' : `Pay ₽${finalPrice.toLocaleString()}`}
                </button>
              </div>

              <p className="text-center text-xs text-gray-600 mt-4">Secure payment. 30-day money-back guarantee.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
              <p className="text-gray-400 mb-8">Your VPN key has been sent to <span className="text-white">{email}</span></p>
              <div className="bg-[#141414] border border-white/5 rounded-xl p-6 mb-8 max-w-md mx-auto">
                <div className="text-xs text-gray-500 mb-2">Your VPN Key</div>
                <div className="font-mono text-lg text-purple-400 break-all">appi-xxxx-xxxx-xxxx-xxxx</div>
                <button className="mt-3 text-xs text-gray-400 hover:text-white transition-colors">
                  Copy key
                </button>
              </div>
              <div className="flex gap-3 justify-center">
                <Link href="/login" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-semibold transition-colors">
                  Sign In
                </Link>
                <Link href="/" className="px-6 py-3 border border-white/10 rounded-xl text-sm font-semibold text-gray-400 hover:bg-white/5 transition-colors">
                  Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
