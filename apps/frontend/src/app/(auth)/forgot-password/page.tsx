'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from '@/lib/i18n';
import api, { apiErrorMessage } from '@/lib/api';

export default function ForgotPasswordPage() {
  const { t } = useTranslations();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(apiErrorMessage(err, 'Не удалось отправить ссылку. Попробуйте ещё раз.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(222,14%,6%)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-white">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#8B5CF6"/><path d="M10 16l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            APPI VPN
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6">{t('forgot_title')}</h1>
          <p className="text-[hsl(222,10%,55%)] mt-2">
            {t('forgot_subtitle')}
          </p>
        </div>

        {sent ? (
          <div className="bg-[hsl(222,14%,12%)] rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">{t('forgot_check')}</h2>
            <p className="text-[hsl(222,10%,55%)] text-sm">
              {t('forgot_sent')} <span className="text-white">{email}</span>
            </p>
            <Link href="/login" className="inline-block mt-6 text-sm text-[hsl(267,80%,60%)] hover:underline">
              {t('forgot_back')}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[hsl(222,14%,12%)] rounded-2xl p-8 space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm text-[hsl(222,10%,55%)] mb-1.5">{t('forgot_email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-[hsl(222,14%,8%)] border border-[hsl(222,14%,20%)] rounded-xl text-white placeholder:text-[hsl(222,10%,40%)] focus:outline-none focus:border-[hsl(267,80%,60%)]"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-[hsl(267,80%,60%)] hover:bg-[hsl(267,80%,55%)] text-white font-semibold rounded-xl transition-colors disabled:opacity-50" disabled={loading}>
              {loading ? '...' : t('forgot_submit')}
            </button>
            <p className="text-center text-sm text-[hsl(222,10%,55%)]">
              {t('forgot_remember')} <Link href="/login" className="text-[hsl(267,80%,60%)] hover:underline">{t('forgot_login')}</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
