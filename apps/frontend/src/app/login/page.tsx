'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await login(email.trim(), password);
      router.push(next);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <form onSubmit={submit} className="card w-full max-w-md p-8 space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Вход</h1>
          <p className="text-gray-400 text-sm mt-1">Войдите в личный кабинет APPI VPN</p>
        </div>
        {err && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {err}
          </div>
        )}
        <label className="block">
          <span className="text-sm text-gray-400">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 outline-none focus:border-white/30"
            placeholder="you@example.com"
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-400">Пароль</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 outline-none focus:border-white/30"
            placeholder="••••••••"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full py-3 disabled:opacity-50"
        >
          {busy ? 'Входим…' : 'Войти'}
        </button>
        <p className="text-sm text-gray-400 text-center">
          Нет аккаунта?{' '}
          <Link
            href={`/register?next=${encodeURIComponent(next)}`}
            className="text-white underline"
          >
            Зарегистрироваться
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
