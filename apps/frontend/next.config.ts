import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@appi/ui', '@appi/shared'],
  experimental: {
    optimizePackageImports: ['@appi/ui', 'lucide-react'],
  },
};

export default nextConfig;
