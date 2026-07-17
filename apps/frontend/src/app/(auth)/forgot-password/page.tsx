'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(222,14%,6%)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-white">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#8B5CF6"/><path d="M10 16l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            APPI VPN
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6">Reset password</h1>
          <p className="text-[hsl(222,10%,55%)] mt-2">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {sent ? (
          <div className="bg-[hsl(222,14%,12%)] rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
            <p className="text-[hsl(222,10%,55%)] text-sm">
              We sent a password reset link to <span className="text-white">{email}</span>
            </p>
            <Link href="/login" className="inline-block mt-6 text-sm text-[hsl(267,80%,60%)] hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[hsl(222,14%,12%)] rounded-2xl p-8 space-y-4">
            <div>
              <label className="block text-sm text-[hsl(222,10%,55%)] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-[hsl(222,14%,8%)] border border-[hsl(222,14%,20%)] rounded-xl text-white placeholder:text-[hsl(222,10%,40%)] focus:outline-none focus:border-[hsl(267,80%,60%)]"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-[hsl(267,80%,60%)] hover:bg-[hsl(267,80%,55%)] text-white font-semibold rounded-xl transition-colors">
              Send reset link
            </button>
            <p className="text-center text-sm text-[hsl(222,10%,55%)]">
              Remember your password? <Link href="/login" className="text-[hsl(267,80%,60%)] hover:underline">Log in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
