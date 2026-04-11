'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  createdAt: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  // بررسی وضعیت لاگین
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
      try {
        const userData = JSON.parse(user);
        setUserName(userData.name || 'کاربر');
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  // دریافت محصولات
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    fetch(`${apiUrl}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* هدر */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container-custom py-4 flex justify-between items-center flex-wrap gap-4">
          <Link href="/" className="text-2xl font-bold text-red-600">
            🛍️ فروشگاه افغانستان
          </Link>
          
          <nav className="flex gap-6">
            <Link href="/" className="hover:text-blue-600">خانه</Link>
            <Link href="/products" className="hover:text-blue-600">محصولات</Link>
            <Link href="/orders" className="hover:text-blue-600">سفارشات من</Link>
            <Link href="/cart" className="hover:text-blue-600">🛒 سبد خرید</Link>
          </nav>
          
          <div className="flex gap-4 items-center">
            {isLoggedIn ? (
              <>
                <span className="text-gray-600">خوش آمدی {userName}!</span>
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  خروج
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-blue-600 hover:underline">ورود</Link>
                <Link href="/auth/register" className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
                  ثبت نام
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* محتوای اصلی */}
      <main className="container-custom py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-12 text-center text-white mb-12">
          <h1 className="text-4xl font-bold mb-4">🛍️ به فروشگاه افغانستان خوش آمدید!</h1>
          <p className="text-xl mb-6">بهترین محصولات با بهترین قیمت، ارسال سریع به سراسر افغانستان</p>
          <Link href="/products" className="bg-orange-500 hover:bg-orange-600 px-8 py-3 rounded-full font-bold inline-block transition">
            شروع خرید
          </Link>
        </div>

        {/* محصولات */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 pr-3 border-r-4 border-red-600">آخرین محصولات</h2>
        
        {products.length === 0 ? (
          <p className="text-center py-12 text-gray-500">هیچ محصولی یافت نشد</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="bg-gray-100 h-48 flex items-center justify-center">
                  <span className="text-6xl">📦</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-2 truncate">{product.name}</h3>
                  <div className="text-xl font-bold text-green-600 mb-2">{product.price.toLocaleString()} افغانی</div>
                  <div className="inline-block bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600 mb-3">
                    {product.category}
                  </div>
                  <Link 
                    href={`/products/${product._id}`} 
                    className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                  >
                    مشاهده جزئیات
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* فوتر */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">فروشگاه افغانستان</h3>
              <p className="text-gray-300">بزرگترین فروشگاه آنلاین در افغانستان</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">لینک‌های سریع</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-300 hover:text-white">خانه</Link></li>
                <li><Link href="/products" className="text-gray-300 hover:text-white">محصولات</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white">تماس با ما</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">خدمات مشتریان</h4>
              <ul className="space-y-2">
                <li><Link href="/faq" className="text-gray-300 hover:text-white">سوالات متداول</Link></li>
                <li><Link href="/returns" className="text-gray-300 hover:text-white">بازگرداندن کالا</Link></li>
                <li><Link href="/shipping" className="text-gray-300 hover:text-white">روش‌های ارسال</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">تماس با ما</h4>
              <ul className="space-y-2 text-gray-300">
                <li>📞 ۰۷۹۹ ۱۲۳ ۴۵۶۷</li>
                <li>✉️ info@shop.af</li>
                <li>📍 کابل، افغانستان</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 فروشگاه آنلاین افغانستان. تمام حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}