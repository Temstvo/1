'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n';
import api from '@/lib/api';
import Link from 'next/link';

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: number;
  trafficLimit: number;
  deviceLimit: number;
  features: string[];
}

interface Subscription {
  id: string;
  planId: string;
  status: string;
  plan: Plan;
  expiresAt: string;
  autoRenew: boolean;
  paymentMethod: string;
}

export default function SubscriptionPage() {
  const { t } = useTranslations();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/subscriptions/current').catch(() => ({ data: null })),
      api.get('/plans').catch(() => ({ data: [] })),
    ]).then(([subRes, plansRes]) => {
      setSubscription(subRes.data);
      const list = Array.isArray(plansRes.data) ? plansRes.data : plansRes.data.plans || [];
      setPlans(list.filter((p: Plan) => p.price > 0));
    }).finally(() => setLoading(false));
  }, []);

  const handleCancel = async () => {
    if (!confirm(t('sub_confirm_cancel'))) return;
    try {
      await api.post('/subscriptions/cancel');
      setSubscription(null);
    } catch {}
  };

  const handleChangePlan = async (planId: string) => {
    try {
      const res = await api.post('/subscriptions/change-plan', { planId });
      setSubscription(res.data.subscription);
    } catch {}
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">{t('sub_title')}</h1>
        <p className="text-sm text-gray-500">{t('sub_subtitle')}</p>
      </div>

      {subscription ? (
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">{t('sub_current_plan')}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              subscription.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' :
              subscription.status === 'TRIAL' ? 'bg-blue-500/10 text-blue-400' :
              'bg-gray-500/10 text-gray-400'
            }`}>
              {subscription.status === 'ACTIVE' ? t('sub_active') : subscription.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">{t('sub_plan')}</div>
              <div className="text-sm text-white font-medium">{subscription.plan.name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">{t('sub_price')}</div>
              <div className="text-sm text-white font-medium">₽{subscription.plan.price.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">{t('sub_expires')}</div>
              <div className="text-sm text-white font-medium">{new Date(subscription.expiresAt).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">{t('sub_devices')}</div>
              <div className="text-sm text-white font-medium">{subscription.plan.deviceLimit}</div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/checkout" className="px-4 py-2.5 min-h-[44px] bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors">
              {t('sub_change')}
            </Link>
            <button onClick={handleCancel} className="px-4 py-2.5 min-h-[44px] border border-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/5 transition-colors">
              {t('sub_cancel')}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">🔑</div>
          <h3 className="text-lg font-semibold text-white mb-2">{t('sub_no_active')}</h3>
          <p className="text-sm text-gray-400 mb-6">{t('sub_get_started')}</p>
          <Link href="/checkout" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-semibold transition-colors">
            {t('sub_get_subscription')}
          </Link>
        </div>
      )}

      {plans.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">{t('sub_available')}</h3>
          <div className="grid gap-3">
            {plans.map((p) => (
              <div key={p.id} className={`bg-[#141414] border rounded-xl p-4 flex items-center justify-between ${
                subscription?.plan?.id === p.id ? 'border-purple-500/30' : 'border-white/5'
              }`}>
                <div>
                  <div className="text-sm font-medium text-white">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.deviceLimit} {t('sub_devices').toLowerCase()} · {Math.round(p.duration / 30) || 1} months</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white">₽{p.price.toLocaleString()}</span>
                  {subscription?.plan?.id !== p.id && (
                    <button onClick={() => handleChangePlan(p.id)} className="px-4 py-2.5 min-h-[44px] bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-gray-300 hover:bg-white/10 transition-colors">
                      {t('sub_switch')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
