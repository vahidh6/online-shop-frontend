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
    console.log('=== AdminLayout Debug ===');
    console.log('1. Current pathname:', pathname);
    
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    console.log('2. Token exists:', !!token);
    console.log('3. User string:', userStr);
    
    // صفحه لاگین - اجازه دسترسی
    if (pathname === '/admin/login') {
      console.log('4. On login page - allowing access');
      setLoading(false);
      return;
    }

    // بررسی توکن
    if (!token) {
      console.log('5. No token - redirecting to home');
      router.replace('/');
      return;
    }

    // بررسی نقش ادمین
    try {
      const userData = JSON.parse(userStr || '{}');
      console.log('6. User role:', userData.role);
      
      if (userData.role !== 'admin') {
        console.log('7. Role is not admin - redirecting to home');
        router.replace('/');
        return;
      }
    } catch (e) {
      console.log('8. Error parsing user:', e);
      router.replace('/');
      return;
    }
    
    console.log('9. Access granted - showing admin panel');
    setLoading(false);
  }, [router, pathname]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">در حال بارگذاری...</div>;
  }

  return <>{children}</>;
}