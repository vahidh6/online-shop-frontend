import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from './context/ThemeContext'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'فروشگاه آنلاین افغانستان',
  description: 'بزرگترین فروشگاه تخصصی در افغانستان',
  manifest: '/manifest.json',
  themeColor: '#e53e3e',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'فروشگاه افغانستان',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="فروشگاه افغانستان" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-TileColor" content="#e53e3e" />
      </head>
      <body className="bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
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
  )
}