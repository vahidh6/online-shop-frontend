'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface User {
  name: string;
  email: string;
}

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    setIsLoggedIn(!!token);
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    // دریافت تعداد آیتم‌های سبد خرید
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.length);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setIsLoggedIn(false);
    setUser(null);
    router.push('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom py-4">
        <div className="flex justify-between items-center">
          {/* لوگو */}
          <Link href="/" className="text-2xl font-bold text-red-600 hover:text-red-700 transition-colors">
            🛍️ فروشگاه افغانستان
          </Link>

          {/* دسکتاپ نویگیشن */}
          <nav className="hidden md:flex gap-8 items-center">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              خانه
            </Link>
            <Link href="/products" className="hover:text-blue-600 transition-colors">
              محصولات
            </Link>
            <Link href="/cart" className="hover:text-blue-600 transition-colors relative">
              سبد خرید
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {isLoggedIn ? (
              <div className="flex gap-4 items-center">
                <span className="text-gray-700">
                  سلام {user?.name || 'کاربر'} 👋
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  خروج
                </button>
              </div>
            ) : (
              <div className="flex gap-4">
                <Link
                  href="/auth/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ورود
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  ثبت‌نام
                </Link>
              </div>
            )}
          </nav>

          {/* دکمه منوی موبایل */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            ☰
          </button>
        </div>

        {/* منوی موبایل */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t">
            <nav className="flex flex-col gap-4">
              <Link
                href="/"
                className="hover:text-blue-600 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                خانه
              </Link>
              <Link
                href="/products"
                className="hover:text-blue-600 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                محصولات
              </Link>
              <Link
                href="/cart"
                className="hover:text-blue-600 transition-colors py-2 relative"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                سبد خرید
                {cartCount > 0 && (
                  <span className="mr-2 bg-red-600 text-white text-xs rounded-full px-2 py-1">
                    {cartCount}
                  </span>
                )}
              </Link>
              {isLoggedIn ? (
                <>
                  <span className="text-gray-700 py-2">
                    سلام {user?.name || 'کاربر'} 👋
                  </span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-right"
                  >
                    خروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ورود
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    ثبت‌نام
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}