'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        email: form.email,
        password: form.password,
      });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      router.push('/vpn');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Create account</h2>
        <p className="mt-1 text-[hsl(222,10%,55%)] text-sm">Join APPI VPN for private internet access</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm text-[hsl(222,10%,55%)] mb-1.5">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full px-4 py-3 bg-[hsl(222,14%,8%)] border border-[hsl(222,14%,20%)] rounded-xl text-white placeholder:text-[hsl(222,10%,40%)] focus:outline-none focus:border-[hsl(267,80%,60%)] transition-colors"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm text-[hsl(222,10%,55%)] mb-1.5">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="w-full px-4 py-3 bg-[hsl(222,14%,8%)] border border-[hsl(222,14%,20%)] rounded-xl text-white placeholder:text-[hsl(222,10%,40%)] focus:outline-none focus:border-[hsl(267,80%,60%)] transition-colors"
            placeholder="Min 8 characters"
          />
          <p className="mt-1 text-xs text-[hsl(222,10%,40%)]">Uppercase, lowercase, number, special character</p>
        </div>
        <div>
          <label className="block text-sm text-[hsl(222,10%,55%)] mb-1.5">Confirm Password</label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
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
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[hsl(222,10%,55%)]">
        Already have an account?{' '}
        <Link href="/login" className="text-[hsl(267,80%,60%)] hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </>
  );
}
