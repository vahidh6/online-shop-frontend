'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // بعد از 3 ثانیه به صفحه اصلی برمی‌گردد
    const timeout = setTimeout(() => {
      router.push('/');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="text-center">
        <div className="text-9xl mb-4">🔍</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">صفحه مورد نظر یافت نشد</h2>
        <p className="text-gray-500 mb-8">متأسفیم، صفحه‌ای که به دنبال آن هستید وجود ندارد.</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            بازگشت به صفحه اصلی
          </Link>
        </div>
        <p className="text-gray-400 text-sm mt-8">در حال انتقال به صفحه اصلی...</p>
      </div>
    </div>
  );
}