'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // مسیرهایی که نیاز به لاگین ندارند
  const publicPaths = ['/admin/login'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    // اگر در صفحه لاگین هستیم، اجازه دسترسی بده
    if (publicPaths.includes(pathname)) {
      setLoading(false);
      return;
    }

    // بررسی وجود توکن
    if (!token) {
      router.push('/admin/login');
      return;
    }

    // بررسی نقش ادمین
    try {
      const userData = JSON.parse(user || '{}');
      if (userData.role !== 'admin') {
        router.push('/admin/login');
        return;
      }
      setIsAuthorized(true);
    } catch (e) {
      router.push('/admin/login');
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

  // اگر در صفحه لاگین هستیم یا مجاز نیستیم، فقط کودکان را نمایش بده
  if (publicPaths.includes(pathname) || !isAuthorized) {
    return <>{children}</>;
  }

  return <>{children}</>;
}