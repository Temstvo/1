import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'APPI VPN - Private Internet. Without Limits.',
  description: 'Premium VPN service with VLESS Reality, Trojan, Shadowsocks. Fast, secure, unlimited.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">{children}</body>
    </html>
  );
}
