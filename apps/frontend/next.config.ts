import type { NextConfig } from 'next';
import { resolve } from 'path';

const isTauri = process.env.NEXT_PUBLIC_TAURI === 'true';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(process.env.BUILD_STANDALONE === 'true'
    ? { output: 'standalone', outputFileTracingRoot: resolve(__dirname, '../..') }
    : {}),
  ...(isTauri ? { output: 'export', images: { unoptimized: true } } : {}),
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
