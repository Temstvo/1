'use client';

import { useState } from 'react';

type PaymentMethod = 'card' | 'crypto' | 'telegram';

export default function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [processing, setProcessing] = useState(false);

  const plans = [
    { id: 'basic', name: 'Basic', price: 4.99, duration: '1 month', features: ['3 devices', '5 countries', 'WireGuard'] },
    { id: 'pro', name: 'Pro', price: 9.99, duration: '1 month', features: ['10 devices', 'All countries', 'All protocols', 'Priority support'] },
    { id: 'premium', name: 'Premium', price: 14.99, duration: '1 month', features: ['Unlimited devices', 'All countries', 'All protocols', 'Dedicated IP', '24/7 support'] },
    { id: 'annual', name: 'Annual', price: 99.99, duration: '1 year', features: ['All Pro features', 'Save 17%'] },
  ];

  const plan = plans.find((p) => p.id === selectedPlan)!;
  const finalPrice = Math.max(0, plan.price - discount);

  const handleApplyCoupon = () => {
    if (couponCode === 'SAVE20') {
      setCouponApplied(true);
      setDiscount(plan.price * 0.2);
    } else if (couponCode === 'FIRST10') {
      setCouponApplied(true);
      setDiscount(10);
    } else {
      setCouponApplied(false);
      setDiscount(0);
    }
  };

  const handleCheckout = async () => {
    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setProcessing(false);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>
        <p className="text-muted-foreground">Complete your subscription purchase</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Plan</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {plans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`rounded-lg border p-4 text-left transition-all ${
                    selectedPlan === p.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{p.name}</h3>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${p.price}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{p.duration}</p>
                  <ul className="mt-2 space-y-1">
                    {p.features.map((f) => (
                      <li key={f} className="text-xs text-muted-foreground">• {f}</li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h2>
            <div className="space-y-3">
              {[
                { id: 'card', label: 'Credit/Debit Card', icon: '💳' },
                { id: 'crypto', label: 'Cryptocurrency', icon: '₿' },
                { id: 'telegram', label: 'Telegram Payment', icon: '📱' },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                  className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-all ${
                    paymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700'
                  }`}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Coupon Code</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              <button
                onClick={handleApplyCoupon}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
              >
                Apply
              </button>
            </div>
            {couponApplied && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                Coupon applied! You save ${discount.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium text-gray-900 dark:text-white">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium text-gray-900 dark:text-white">{plan.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">${plan.price.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount</span>
                  <span className="font-medium">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 dark:border-gray-800">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ${finalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={processing}
              className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {processing ? 'Processing...' : `Pay $${finalPrice.toFixed(2)}`}
            </button>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Secure payment. 30-day money-back guarantee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
