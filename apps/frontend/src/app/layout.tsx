import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'APPI VPN - Private Internet. Without Limits.',
  description: 'Premium VPN service with WireGuard, OpenVPN, Xray Reality. Fast, secure, unlimited.',
  keywords: ['vpn', 'wireguard', 'openvpn', 'privacy', 'security', 'proxy'],
  authors: [{ name: 'APPI VPN' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'APPI VPN',
    title: 'APPI VPN - Private Internet. Without Limits.',
    description: 'Premium VPN service with WireGuard, OpenVPN, Xray Reality.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
