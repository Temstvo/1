'use client';

import Link from 'next/link';

const isTauri = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_TAURI === 'true';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(222,14%,6%)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href={isTauri ? '#' : '/'} className="inline-flex items-center gap-2 text-xl font-bold text-white">
            <img src="/logo.png" alt="APPI VPN" className="w-7 h-7" />
            APPI VPN
          </Link>
        </div>
        <div className="bg-[hsl(222,14%,12%)] rounded-2xl p-8">
          {children}
        </div>
        {!isTauri && (
          <p className="text-center text-xs text-[hsl(222,10%,40%)] mt-6">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </p>
        )}
      </div>
    </div>
  );
}
