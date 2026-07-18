'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CheckoutSuccessPage() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          window.location.href = '/vpn';
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Payment Successful!</h1>
        <p className="text-gray-400 mb-8">
          Your VPN subscription is now active. Redirecting to dashboard in {countdown}s...
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/vpn" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-semibold transition-colors">
            Go to Dashboard
          </Link>
          <Link href="/" className="px-6 py-3 border border-white/10 rounded-xl text-sm font-semibold text-gray-400 hover:bg-white/5 transition-colors">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
