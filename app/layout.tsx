// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from '@/context/SettingsContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Script from 'next/script';

export const viewport: Viewport = {
  themeColor: '#e53e3e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'فروشگاه آنلاین افغانستان',
  description: 'بزرگترین فروشگاه تخصصی در افغانستان',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'فروشگاه افغانستان',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="فروشگاه افغانستان" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-TileColor" content="#e53e3e" />
      </head>
      <body className="bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <SettingsProvider>
          <ThemeProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </ThemeProvider>
        </SettingsProvider>
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js')
                  .then(reg => console.log('Service Worker registered:', reg))
                  .catch(err => console.error('Service Worker registration failed:', err));
              }
            `,
          }}
        />
      </body>
    </html>
  );
}