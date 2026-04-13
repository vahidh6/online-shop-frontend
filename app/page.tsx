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

const categoriesList = [
  { id: 1, name: 'قطعات و تعمیرات موبایل', icon: '🔧' },
  { id: 2, name: 'باتری و شارژ', icon: '🔋' },
  { id: 3, name: 'محافظ و جانبی', icon: '🛡️' },
  { id: 4, name: 'صدا و تصویر', icon: '🎧' },
  { id: 5, name: 'سایر', icon: '📦' },
];

// اسلایدهای تبلیغاتی
const bannerSlides = [
  { id: 1, title: 'تخفیف ویژه تا ۵۰٪', description: 'بهترین محصولات با بهترین قیمت', image: '🎁', bgColor: '#3b82f6' },
  { id: 2, title: 'ارسال رایگان', description: 'برای خرید بالای ۱۰۰۰۰ افغانی', image: '🚚', bgColor: '#10b981' },
  { id: 3, title: 'محصولات اصل', description: 'ضمانت اصالت کالا', image: '✅', bgColor: '#f59e0b' },
  { id: 4, title: 'پرداخت در محل', description: 'امکان پرداخت هنگام تحویل', image: '💰', bgColor: '#8b5cf6' },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('همه');
  const [currentBannerSlide, setCurrentBannerSlide] = useState(0);
  const [currentProductSlide, setCurrentProductSlide] = useState(0);
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

  // اسکرول خودکار بنر تبلیغاتی
  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setCurrentBannerSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(bannerInterval);
  }, []);

  // اسکرول خودکار محصولات
  useEffect(() => {
    if (filteredProducts.length === 0) return;
    
    const productInterval = setInterval(() => {
      setCurrentProductSlide((prev) => {
        const maxSlides = Math.ceil(filteredProducts.length / 4);
        return (prev + 1) % maxSlides;
      });
    }, 6000);
    return () => clearInterval(productInterval);
  }, [filteredProducts.length]);

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

  // جستجو و فیلتر
  useEffect(() => {
    if (products.length === 0) return;
    
    let results = [...products];
    
    if (selectedCategory !== 'همه') {
      results = results.filter(p => p.category === selectedCategory);
    }
    
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      results = results.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.description && p.description.toLowerCase().includes(term))
      );
    }
    
    setFilteredProducts(results);
    setCurrentProductSlide(0);
  }, [products, searchTerm, selectedCategory]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  const goToBannerSlide = (index: number) => {
    setCurrentBannerSlide(index);
  };

  const goToProductSlide = (index: number) => {
    setCurrentProductSlide(index);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedCategory('همه');
  };

  // دریافت محصولات برای اسلاید جاری
  const getCurrentProducts = () => {
    const start = currentProductSlide * 4;
    const end = start + 4;
    return filteredProducts.slice(start, end);
  };

  const totalProductSlides = Math.ceil(filteredProducts.length / 4);

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

      <main className="container-custom py-8">
        {/* بنر اسلایدر */}
        <div className="relative mb-12 rounded-2xl overflow-hidden shadow-lg h-80">
          {bannerSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center justify-center text-white p-8 ${
                index === currentBannerSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              style={{ backgroundColor: slide.bgColor }}
            >
              <div className="text-center">
                <div className="text-7xl mb-4">{slide.image}</div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">{slide.title}</h2>
                <p className="text-lg md:text-xl">{slide.description}</p>
              </div>
            </div>
          ))}
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
            {bannerSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToBannerSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentBannerSlide ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* جستجو */}
        <div className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="جستجوی محصولات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 pr-12 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:border-transparent"
            />
            <span className="absolute left-3 top-3 text-gray-400 text-xl">🔍</span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          
          {searchTerm && (
            <div className="text-center mt-2 text-sm text-gray-500">
              <span>{filteredProducts.length} نتیجه یافت شد</span>
            </div>
          )}
        </div>

        {/* دسته‌بندی */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory('همه')}
              className={`px-5 py-2 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === 'همه' 
                  ? 'text-white shadow-md' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              style={selectedCategory === 'همه' ? { backgroundColor: settings.primaryColor } : {}}
            >
              همه محصولات
            </button>
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-5 py-2 rounded-full font-medium transition-all duration-200 flex items-center gap-1 ${
                  selectedCategory === cat.name 
                    ? 'text-white shadow-md' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                style={selectedCategory === cat.name ? { backgroundColor: settings.primaryColor } : {}}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* محصولات اسلایدر */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg">هیچ محصولی با این مشخصات یافت نشد</p>
            <button
              onClick={clearSearch}
              className="mt-4 px-6 py-2 rounded-lg text-white"
              style={{ backgroundColor: settings.primaryColor }}
            >
              حذف فیلترها
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedCategory === 'همه' ? 'محصولات ویژه' : `محصولات ${selectedCategory}`}
              </h2>
              <Link href="/products" className="text-sm hover:underline" style={{ color: settings.primaryColor }}>
                مشاهده همه ←
              </Link>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {getCurrentProducts().map((product) => (
                  <div key={product._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col h-full">
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
              
              {/* دکمه‌های ناوبری اسلایدر محصولات */}
              {totalProductSlides > 1 && (
                <>
                  <button
                    onClick={() => goToProductSlide((currentProductSlide - 1 + totalProductSlides) % totalProductSlides)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white rounded-full shadow-lg p-2 hover:bg-gray-100 transition z-10"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => goToProductSlide((currentProductSlide + 1) % totalProductSlides)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white rounded-full shadow-lg p-2 hover:bg-gray-100 transition z-10"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  {/* نقطه‌های ناوبری */}
                  <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: totalProductSlides }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToProductSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentProductSlide ? 'w-6' : ''
                        }`}
                        style={{ 
                          backgroundColor: index === currentProductSlide ? settings.primaryColor : '#cbd5e0',
                          width: index === currentProductSlide ? '24px' : '8px'
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

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
    </div>
  );
}