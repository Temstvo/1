import type { NextConfig } from 'next';
import { withSerwist } from '@serwist/next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withSerwist({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  ...nextConfig,
});
