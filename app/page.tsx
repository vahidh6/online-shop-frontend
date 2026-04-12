'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  createdAt: string;
  images?: string[];
}

interface Settings {
  siteName: string;
  siteDescription: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  facebook: string;
  instagram: string;
  telegram: string;
  whatsapp: string;
  deliveryFeeKabul: number;
  deliveryFeeOther: number;
  freeDeliveryThreshold: number;
  primaryColor: string;
  secondaryColor: string;
  footerText: string;
  isMaintenance: boolean;
  maintenanceMessage: string;
}

// لیست دسته‌بندی‌ها
const categoriesList = [
  { id: 1, name: 'قطعات و تعمیرات موبایل', icon: '🔧' },
  { id: 2, name: 'باتری و شارژ', icon: '🔋' },
  { id: 3, name: 'محافظ و جانبی', icon: '🛡️' },
  { id: 4, name: 'صدا و تصویر', icon: '🎧' },
  { id: 5, name: 'سایر', icon: '📦' },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [settings, setSettings] = useState<Settings>({
    siteName: 'شرکت همراه افغان',
    siteDescription: 'بزرگترین فروشگاه تخصصی در افغانستان',
    phone: '0799364841 ',
    email: 'info@advance.af',
    address: 'کابل، افغانستان',
    workingHours: 'شنبه تا پنجشنبه ۹:۰۰ - ۱۷:۰۰',
    facebook: '',
    instagram: '',
    telegram: '',
    whatsapp: '',
    deliveryFeeKabul: 50000,
    deliveryFeeOther: 100000,
    freeDeliveryThreshold: 0,
    primaryColor: '#e53e3e',
    secondaryColor: '#3182ce',
    footerText: '© 2026 شرکت همراه افغان - تمامی حقوق محفوظ است',
    isMaintenance: false,
    maintenanceMessage: 'در حال بروزرسانی، به زودی بازمی‌گردیم'
  });

  // رفرنس برای اسکرول هر دسته
  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollLeft = (categoryId: number) => {
    const container = scrollRefs.current[`scroll-${categoryId}`];
    if (container) {
      container.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = (categoryId: number) => {
    const container = scrollRefs.current[`scroll-${categoryId}`];
    if (container) {
      container.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

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

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    fetch(`${apiUrl}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data) setSettings(data);
      })
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

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

  // گروه‌بندی محصولات بر اساس دسته‌بندی و تصادفی کردن داخل هر دسته
  const productsByCategory = categoriesList
    .map(cat => {
      const categoryProducts = products.filter(p => p.category === cat.name);
      // تصادفی کردن محصولات هر دسته
      const shuffledProducts = [...categoryProducts].sort(() => 0.5 - Math.random());
      return {
        ...cat,
        products: shuffledProducts
      };
    })
    .filter(cat => cat.products.length > 0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  if (settings.isMaintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">🔧</div>
          <h1 className="text-2xl font-bold mb-2">{settings.siteName}</h1>
          <p className="text-gray-600">{settings.maintenanceMessage}</p>
        </div>
      </div>
    );
  }

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
          <Link href="/" className="text-2xl font-bold" style={{ color: settings.primaryColor }}>
            🏢 {settings.siteName}
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
        <div className="rounded-2xl p-12 text-center text-white mb-12" style={{ background: `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.secondaryColor} 100%)` }}>
          <h1 className="text-4xl font-bold mb-4">🏢 به {settings.siteName} خوش آمدید!</h1>
          <p className="text-xl mb-6">{settings.siteDescription}</p>
          <Link href="/products" className="bg-orange-500 hover:bg-orange-600 px-8 py-3 rounded-full font-bold inline-block transition">
            شروع خرید
          </Link>
        </div>

        {/* نمایش محصولات به صورت دسته‌بندی افقی با اسکرول تصادفی */}
        {productsByCategory.map((category) => (
          <div key={category.id} className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 pr-3 border-r-4 flex items-center gap-2" style={{ borderRightColor: settings.primaryColor }}>
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </h2>
              <Link href={`/products?category=${encodeURIComponent(category.name)}`} className="text-sm hover:underline" style={{ color: settings.primaryColor }}>
                مشاهده همه ←
              </Link>
            </div>
            
            <div className="relative group">
              {/* دکمه اسکرول به چپ */}
              <button
                onClick={() => scrollLeft(category.id)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* کانتینر اسکرول افقی */}
              <div
                ref={(el) => { scrollRefs.current[`scroll-${category.id}`] = el; }}
                className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {category.products.map((product) => (
                  <div key={product._id} className="min-w-[280px] w-[280px] bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col">
                    <div className="bg-gray-100 h-48 flex items-center justify-center overflow-hidden">
                      {product.images && product.images[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<span class="text-6xl">📦</span>';
                            }
                          }}
                        />
                      ) : (
                        <span className="text-6xl">📦</span>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 min-h-[48px]">{product.name}</h3>
                      <div className="text-xl font-bold text-green-600 mb-2">{product.price.toLocaleString()} افغانی</div>
                      <div className="inline-block bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600 mb-3 w-fit">
                        {product.category}
                      </div>
                      <Link 
                        href={`/products/${product._id}`} 
                        className="block text-center text-white py-2 rounded-lg transition mt-auto" 
                        style={{ backgroundColor: settings.secondaryColor }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = settings.primaryColor; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = settings.secondaryColor; }}
                      >
                        مشاهده جزئیات
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* دکمه اسکرول به راست */}
              <button
                onClick={() => scrollRight(category.id)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* فوتر */}
      <footer className="text-white mt-16" style={{ backgroundColor: '#2d3748' }}>
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4" style={{ color: settings.primaryColor }}>{settings.siteName}</h3>
              <p className="text-gray-300">{settings.siteDescription}</p>
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
                <li>📞 {settings.phone}</li>
                <li>✉️ {settings.email}</li>
                <li>📍 {settings.address}</li>
                <li>🕐 {settings.workingHours}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>{settings.footerText}</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}