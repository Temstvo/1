import type { NextConfig } from 'next';
import withSerwist from '@serwist/next';

const isTauri = process.env.NEXT_PUBLIC_TAURI === 'true';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isTauri ? { output: 'export', images: { unoptimized: true } } : {}),
};

export default withSerwist({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  reloadOnOnline: true,
})(nextConfig);
