// app/shipping/page.tsx
'use client';

import { useSettings } from '@/context/SettingsContext';

export default function ShippingPage() {
  const settings = useSettings();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6" style={{ color: settings?.primaryColor || '#e53e3e' }}>
        🚚 اطلاعات ارسال و روش‌های تحویل
      </h1>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-4xl mb-3">📍</div>
          <h3 className="font-bold text-lg mb-2">ارسال به کابل</h3>
          <p className="text-gray-600">هزینه ارسال: {settings?.deliveryFeeKabul?.toLocaleString() || '۵۰,۰۰۰'} افغانی</p>
          <p className="text-sm text-gray-500 mt-2">زمان تحویل: ۱-۳ روز کاری</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-4xl mb-3">🏙️</div>
          <h3 className="font-bold text-lg mb-2">ارسال به سایر استان‌ها</h3>
          <p className="text-gray-600">هزینه ارسال: {settings?.deliveryFeeOther?.toLocaleString() || '۱۰۰,۰۰۰'} افغانی</p>
          <p className="text-sm text-gray-500 mt-2">زمان تحویل: ۳-۷ روز کاری</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-4xl mb-3">🎁</div>
          <h3 className="font-bold text-lg mb-2">ارسال رایگان</h3>
          <p className="text-gray-600">
            برای خرید بالای {settings?.freeDeliveryThreshold?.toLocaleString() || '۰'} افغانی
          </p>
          <p className="text-sm text-green-600 mt-2">✨ ارسال رایگان برای خرید‌های بالای حد نصاب</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">📋 روش‌های پرداخت</h2>
        <ul className="space-y-3">
          <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">🏦</span>
            <div>
              <span className="font-medium">حواله صرافی</span>
              <p className="text-sm text-gray-500">پرداخت از طریق صرافی‌های معتبر</p>
            </div>
          </li>
          <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">💳</span>
            <div>
              <span className="font-medium">کارت به کارت</span>
              <p className="text-sm text-gray-500">انتقال از طریق کارت‌های بانکی</p>
            </div>
          </li>
          <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">💵</span>
            <div>
              <span className="font-medium">پرداخت در محل</span>
              <p className="text-sm text-gray-500">پرداخت هنگام تحویل کالا</p>
            </div>
          </li>
          <li className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">₿</span>
            <div>
              <span className="font-medium">ارز دیجیتال</span>
              <p className="text-sm text-gray-500">پرداخت از طریق رمز ارزها (USDT, BTC)</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}