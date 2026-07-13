import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'APPI VPN - Private Internet. Without Limits.',
  description: 'Premium VPN service with WireGuard, OpenVPN, Xray Reality. Fast, secure, unlimited.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
