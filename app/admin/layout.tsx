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
      router.replace('/');
      return;
    }

    // بررسی نقش ادمین
    try {
      const userData = JSON.parse(user || '{}');
      if (userData.role !== 'admin') {
        router.replace('/');
        return;
      }
    } catch (e) {
      router.replace('/');
      return;
    } finally {
      setLoading(false);
    }
  }, [router, pathname]);

  if (loading) {
    return null; // یا یک لودینگ ساده
  }

  // صفحه لاگین
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return <>{children}</>;
}