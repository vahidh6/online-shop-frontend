'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);
  
  return (
    <header className="bg-white shadow-md">
      <div className="container-custom py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-red-600">
          🛍️ فروشگاه افغانستان
        </Link>
        <nav className="flex gap-6">
          <Link href="/" className="hover:text-blue-600">خانه</Link>
          <Link href="/products" className="hover:text-blue-600">محصولات</Link>
          <Link href="/cart" className="hover:text-blue-600">سبد خرید</Link>
          {isLoggedIn ? (
            <button onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/';
            }} className="text-red-600">خروج</button>
          ) : (
            <Link href="/auth/login" className="hover:text-blue-600">ورود</Link>
          )}
        </nav>
      </div>
    </header>
  );
}