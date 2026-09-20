import type { Metadata, Viewport } from 'next';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './globals.css';
import './site.css';
import './modern.css';
import './workspace.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Appi VPN — персональное подключение',
  description:
    'Персональный VPN с VLESS Reality. Управляйте подпиской и подключением в одном кабинете. Попробуйте кабинет без регистрации.',
  icons: {
    icon: { url: '/icon.svg', type: 'image/svg+xml' },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'APPI VPN',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#101411',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-background antialiased overscroll-none">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
