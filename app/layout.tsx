import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'فروشگاه آنلاین افغانستان',
  description: 'بزرگترین فروشگاه آنلاین در افغانستان',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  )
}