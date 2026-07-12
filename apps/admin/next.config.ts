import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@appi/shared', '@appi/ui'],
};

export default nextConfig;
