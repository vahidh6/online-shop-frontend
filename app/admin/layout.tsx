'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    // صفحه لاگین - اجازه دسترسی
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    // بررسی توکن
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // بررسی نقش ادمین
    try {
      const userData = JSON.parse(user || '{}');
      if (userData.role !== 'admin') {
        // به جای خطا، به صفحه اصلی هدایت کن
        router.push('/');
        return;
      }
    } catch (e) {
      router.push('/');
      return;
    } finally {
      setLoading(false);
    }
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // صفحه لاگین
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return <>{children}</>;
}