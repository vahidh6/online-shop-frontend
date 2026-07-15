// components/Footer.tsx
'use client';

import Link from 'next/link';
import { useSettings } from '@/context/SettingsContext';

export default function Footer() {
  const settings = useSettings();
  const currentYear = new Date().getFullYear();

  if (!settings) {
    return <div className="bg-gray-900 h-16"></div>;
  }

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: settings.primaryColor }}>
              {settings.siteName}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">{settings.siteDescription}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">لینک‌های سریع</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors">درباره ما</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">تماس با ما</Link></li>
              <li><Link href="/faq" className="text-gray-300 hover:text-white transition-colors">سوالات متداول</Link></li>
              <li><Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">حریم خصوصی</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">دسته‌بندی‌ها</h3>
            <ul className="space-y-2">
              <li><Link href="/products?category=الکترونیک" className="text-gray-300 hover:text-white transition-colors">الکترونیک</Link></li>
              <li><Link href="/products?category=پوشاک" className="text-gray-300 hover:text-white transition-colors">پوشاک</Link></li>
              <li><Link href="/products?category=کتاب" className="text-gray-300 hover:text-white transition-colors">کتاب‌ها</Link></li>
              <li><Link href="/products?category=خانه" className="text-gray-300 hover:text-white transition-colors">خانه و آشپزخانه</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">ارتباط با ما</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>📞 {settings.phone}</li>
              <li>✉️ {settings.email}</li>
              <li>📍 {settings.address}</li>
              <li>🕐 {settings.workingHours}</li>
            </ul>
            <div className="flex gap-4 mt-4">
              {settings.facebook && (
                <a href={settings.facebook} className="text-gray-300 hover:text-white text-2xl" target="_blank">📘</a>
              )}
              {settings.instagram && (
                <a href={settings.instagram} className="text-gray-300 hover:text-white text-2xl" target="_blank">📷</a>
              )}
              {settings.telegram && (
                <a href={settings.telegram} className="text-gray-300 hover:text-white text-2xl" target="_blank">💬</a>
              )}
              {settings.whatsapp && (
                <a href={settings.whatsapp} className="text-gray-300 hover:text-white text-2xl" target="_blank">📱</a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            {settings.footerText || `© ${currentYear} ${settings.siteName} - تمامی حقوق محفوظ است`}
          </p>
        </div>
      </div>
    </footer>
  );
}