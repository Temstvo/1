'use client';

import { useTranslations } from '@/lib/i18n';

const plans = [
  {
    id: 'free',
    name: 'Free Trial',
    price: '₽0',
    duration: '7 days',
    traffic: '10 GB',
    devices: '2',
    protocols: ['WireGuard', 'OpenVPN'],
    current: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '₽499',
    duration: '/mo',
    traffic: '50 GB',
    devices: '3',
    protocols: ['WireGuard', 'OpenVPN'],
    current: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₽1199',
    duration: '/mo',
    traffic: '200 GB',
    devices: '5',
    protocols: ['All'],
    current: true,
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: '₽3999',
    duration: '/mo',
    traffic: '1 TB',
    devices: '10',
    protocols: ['All'],
    current: false,
  },
];

export default function SubscriptionPage() {
  const { t } = useTranslations();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">{t('sub_title')}</h1>

      {/* Current Plan */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
        <div className="text-center py-4">
          <div className="text-xs text-[var(--muted-foreground)] mb-1">{t('sub_current_plan')}</div>
          <div className="text-lg font-medium text-[var(--muted-foreground)]">{t('sub_no_active') || 'No active subscription'}</div>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h2 className="happ-section-header">{t('sub_available')}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-[var(--card)] border rounded-xl p-5 transition-all ${
                plan.current
                  ? 'border-[var(--primary)] ring-1 ring-[var(--primary)]/20'
                  : 'border-[var(--border)] hover:border-[var(--primary)]/30'
              }`}
            >
              {plan.popular && (
                <div className="text-xs text-[var(--primary)] mb-2">{t('sub_popular')}</div>
              )}
              <h3 className="font-semibold text-[var(--foreground)] mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-xl font-bold text-[var(--foreground)]">{plan.price}</span>
                <span className="text-xs text-[var(--muted-foreground)]">{plan.duration}</span>
              </div>
              <div className="space-y-2 text-xs text-[var(--muted-foreground)]">
                <div>{plan.traffic} traffic</div>
                <div>{plan.devices} devices</div>
                <div>{plan.protocols.join(', ')}</div>
              </div>
              <button
                className={`mt-4 w-full py-2 rounded-lg text-xs font-medium transition-colors ${
                  plan.current
                    ? 'bg-[var(--muted)] text-[var(--muted-foreground)] cursor-default'
                    : 'bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90'
                }`}
                disabled={plan.current}
              >
                {plan.current ? t('sub_current') : t('sub_select')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
