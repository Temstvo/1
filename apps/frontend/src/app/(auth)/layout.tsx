'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(222,14%,6%)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-white">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#8B5CF6" />
              <path d="M10 16l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            APPI VPN
          </Link>
        </div>
        <div className="bg-[hsl(222,14%,12%)] rounded-2xl p-8">
          {children}
        </div>
        <p className="text-center text-xs text-[hsl(222,10%,40%)] mt-6">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
