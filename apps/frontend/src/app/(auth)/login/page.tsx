'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api, { apiErrorMessage } from '@/lib/api';
import { useTranslations } from '@/lib/i18n';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslations();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(apiErrorMessage(err, t('login_error')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">{t('login_welcome')}</h2>
        <p className="mt-1 text-[hsl(222,10%,55%)] text-sm">{t('login_subtitle')}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm text-[hsl(222,10%,55%)] mb-1.5">{t('login_email')}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-[hsl(222,14%,8%)] border border-[hsl(222,14%,20%)] rounded-xl text-white placeholder:text-[hsl(222,10%,40%)] focus:outline-none focus:border-[hsl(267,80%,60%)] transition-colors"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm text-[hsl(222,10%,55%)]">{t('login_password')}</label>
            <Link href="/forgot-password" className="text-xs text-[hsl(267,80%,60%)] hover:underline">
              {t('login_forgot')}
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-[hsl(222,14%,8%)] border border-[hsl(222,14%,20%)] rounded-xl text-white placeholder:text-[hsl(222,10%,40%)] focus:outline-none focus:border-[hsl(267,80%,60%)] transition-colors"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[hsl(267,80%,60%)] hover:bg-[hsl(267,80%,55%)] disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
        >
          {loading ? t('login_loading') : t('login_submit')}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[hsl(222,10%,55%)]">
        {t('login_no_account')}{' '}
        <Link href="/register" className="text-[hsl(267,80%,60%)] hover:underline font-medium">
          {t('login_create')}
        </Link>
      </p>
    </>
  );
}
