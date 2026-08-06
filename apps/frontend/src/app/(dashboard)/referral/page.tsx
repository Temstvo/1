'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n';
import api from '@/lib/api';

interface Referral {
  id: string;
  email?: string;
  status: string;
  createdAt: string;
}

interface ReferralStats {
  total?: number;
  active?: number;
  earnings?: number;
  balance?: number;
}

export default function ReferralPage() {
  const { t } = useTranslations();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/referrals').catch(() => ({ data: [] })),
      api.get('/referrals/stats').catch(() => ({ data: null })),
      api.get('/referrals/link').catch(() => ({ data: { url: '' } })),
    ]).then(([refsRes, statsRes, linkRes]) => {
      setReferrals(Array.isArray(refsRes.data) ? refsRes.data : refsRes.data?.referrals || []);
      setStats(statsRes.data);
      setLink(linkRes.data?.url || '');
    }).finally(() => setLoading(false));
  }, []);

  const copyLink = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('referral_title')}</h1>
        <p className="text-sm text-gray-500 mt-1">Приглашайте друзей и получайте бонусы</p>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
        <div className="text-xs text-gray-500 mb-2">Ваша реферальная ссылка</div>
        <div className="flex gap-2">
          <input
            readOnly
            value={link}
            placeholder="https://appi-vpn.com/ref/..."
            className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none"
          />
          <button
            onClick={copyLink}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-medium transition-colors"
          >
            {copied ? 'Скопировано!' : 'Копировать'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
          <div className="text-xs text-gray-500 mb-2">Рефералов</div>
          <div className="text-xl font-bold text-white">{stats?.total ?? referrals.length}</div>
        </div>
        <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
          <div className="text-xs text-gray-500 mb-2">Активных</div>
          <div className="text-xl font-bold text-green-400">{stats?.active ?? 0}</div>
        </div>
        <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
          <div className="text-xs text-gray-500 mb-2">Баланс</div>
          <div className="text-xl font-bold text-purple-400">₽{(stats?.balance ?? 0).toLocaleString()}</div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3">История</h3>
        {referrals.length === 0 ? (
          <div className="bg-[#111] border border-white/5 rounded-2xl p-8 text-center">
            <div className="text-3xl mb-3">🤝</div>
            <p className="text-sm text-gray-400">Пока нет рефералов. Поделитесь ссылкой!</p>
          </div>
        ) : (
          <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
            {referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-4 border-b border-white/5 last:border-0">
                <div>
                  <div className="text-sm font-medium text-white">{r.email || 'Пользователь'}</div>
                  <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
                <span className="text-xs text-gray-400">{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
