// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  images?: string[];
}

interface Banner {
  _id: string;
  title: string;
  description: string;
  image: string;
  bgColor: string;
  link?: string;
  buttonText?: string;
  buttonLink?: string;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  is_active: boolean;
}

export default function Home() {
  const settings = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('همه');
  const [currentBannerSlide, setCurrentBannerSlide] = useState(0);
  const [currentProductSlide, setCurrentProductSlide] = useState(0);

  // ============ دریافت محصولات، بنرها و دسته‌بندی‌ها ============
  useEffect(() => {
    const fetchData = async () => {
      try {
        // دریافت محصولات
        const productsRes = await api.products.getAll();
        const productsData = await productsRes.json();
        if (Array.isArray(productsData)) {
          setProducts(productsData);
        } else {
          setProducts([]);
        }

        // دریافت بنرها
        const bannersRes = await api.banners.getAll();
        const bannersData = await bannersRes.json();
        if (bannersData && bannersData.length > 0) {
          setBanners(bannersData);
        } else {
          setBanners([
            { _id: '1', title: 'تخفیف ویژه تا ۵۰٪', description: 'بهترین محصولات با بهترین قیمت', image: '🎁', bgColor: '#3b82f6' },
            { _id: '2', title: 'ارسال رایگان', description: 'برای خرید بالای ۱۰۰۰۰ افغانی', image: '🚚', bgColor: '#10b981' },
            { _id: '3', title: 'محصولات اصل', description: 'ضمانت اصالت کالا', image: '✅', bgColor: '#f59e0b' },
            { _id: '4', title: 'پرداخت در محل', description: 'امکان پرداخت هنگام تحویل', image: '💰', bgColor: '#8b5cf6' },
          ]);
        }

        // دریافت دسته‌بندی‌ها
        const categoriesRes = await api.categories.getAll();
        const categoriesData = await categoriesRes.json();
        if (Array.isArray(categoriesData)) {
          // فقط دسته‌بندی‌های فعال را نمایش بده
          const activeCategories = categoriesData.filter((cat: Category) => cat.is_active !== false);
          setCategories(activeCategories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setProducts([]);
        setCategories([]);
        setBanners([
          { _id: '1', title: 'تخفیف ویژه تا ۵۰٪', description: 'بهترین محصولات با بهترین قیمت', image: '🎁', bgColor: '#3b82f6' },
          { _id: '2', title: 'ارسال رایگان', description: 'برای خرید بالای ۱۰۰۰۰ افغانی', image: '🚚', bgColor: '#10b981' },
          { _id: '3', title: 'محصولات اصل', description: 'ضمانت اصالت کالا', image: '✅', bgColor: '#f59e0b' },
          { _id: '4', title: 'پرداخت در محل', description: 'امکان پرداخت هنگام تحویل', image: '💰', bgColor: '#8b5cf6' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ============ اسکرول خودکار بنرها ============
  useEffect(() => {
    if (banners.length === 0) return;
    const bannerInterval = setInterval(() => {
      setCurrentBannerSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(bannerInterval);
  }, [banners.length]);

  // ============ فیلتر محصولات ============
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'همه' || product?.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      (product?.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product?.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalProductSlides = Math.ceil((filteredProducts?.length || 0) / 4);
  const currentProducts = filteredProducts?.slice(
    currentProductSlide * 4, 
    (currentProductSlide * 4) + 4
  ) || [];

  useEffect(() => {
    if (filteredProducts.length === 0 || totalProductSlides === 0) return;
    const productInterval = setInterval(() => {
      setCurrentProductSlide((prev) => (prev + 1) % totalProductSlides);
    }, 6000);
    return () => clearInterval(productInterval);
  }, [filteredProducts.length, totalProductSlides]);

  // ============ توابع کمکی ============
  const goToBannerSlide = (index: number) => setCurrentBannerSlide(index);
  const goToProductSlide = (index: number) => setCurrentProductSlide(index);
  const clearSearch = () => {
    setSearchTerm('');
    setSelectedCategory('همه');
    setCurrentProductSlide(0);
  };

  // ============ رندر ============
  if (!settings) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (settings.isMaintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">🔧</div>
          <h1 className="text-2xl font-bold mb-2">{settings.siteName || 'فروشگاه'}</h1>
          <p className="text-gray-600">{settings.maintenanceMessage || 'در حال بروزرسانی، به زودی بازمی‌گردیم'}</p>
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

  const primaryColor = settings?.primaryColor || '#e53e3e';
  const secondaryColor = settings?.secondaryColor || '#3182ce';

  // دسته‌بندی‌های پیش‌فرض در صورت عدم دریافت از دیتابیس
  const displayCategories = categories.length > 0 ? categories : [
    { id: 1, name: 'قطعات و تعمیرات موبایل', icon: '🔧', is_active: true },
    { id: 2, name: 'باتری و شارژ', icon: '🔋', is_active: true },
    { id: 3, name: 'محافظ و جانبی', icon: '🛡️', is_active: true },
    { id: 4, name: 'صدا و تصویر', icon: '🎧', is_active: true },
    { id: 5, name: 'سایر', icon: '📦', is_active: true },
  ];

  return (
    <div>
      <main className="container-custom py-8">
        {/* ============ اسلایدر تبلیغاتی ============ */}
        {banners.length > 0 && (
          <div className="relative mb-12 rounded-2xl overflow-hidden shadow-lg h-64 md:h-80">
            {banners.map((slide, index) => (
              <div
                key={slide._id}
                className={`absolute inset-0 transition-all duration-700 ease-in-out transform flex items-center justify-center text-white p-8 ${
                  index === currentBannerSlide 
                    ? 'opacity-100 translate-x-0 z-10' 
                    : index < currentBannerSlide 
                      ? 'opacity-0 -translate-x-full z-0' 
                      : 'opacity-0 translate-x-full z-0'
                }`}
                style={{ backgroundColor: slide.bgColor || '#3b82f6' }}
              >
                <div className="text-center">
                  <div className="text-6xl md:text-7xl mb-4">{slide.image || '🎯'}</div>
                  <h2 className="text-2xl md:text-4xl font-bold mb-2">{slide.title || 'بنر'}</h2>
                  <p className="text-base md:text-xl">{slide.description || ''}</p>
                  {slide.buttonLink && (
                    <Link
                      href={slide.buttonLink}
                      className="inline-block mt-4 px-6 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition"
                    >
                      {slide.buttonText || 'مشاهده بیشتر'}
                    </Link>
                  )}
                </div>
              </div>
            ))}
            
            {banners.length > 1 && (
              <>
                <button
                  onClick={() => goToBannerSlide((currentBannerSlide - 1 + banners.length) % banners.length)}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full p-2 transition-all duration-300 hover:scale-110"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => goToBannerSlide((currentBannerSlide + 1) % banners.length)}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full p-2 transition-all duration-300 hover:scale-110"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToBannerSlide(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentBannerSlide 
                          ? 'bg-white w-6 md:w-8 h-2' 
                          : 'bg-white/50 w-2 h-2 hover:bg-white/80 hover:w-4'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ============ جستجو ============ */}
        <div className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="جستجوی محصولات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 pr-12 border-2 rounded-full focus:outline-none focus:ring-2 transition"
              style={{
                borderColor: primaryColor,
              }}
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
        </div>

        {/* ============ دسته‌بندی ============ */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory('همه')}
              className={`px-5 py-2 rounded-full font-medium transition-all duration-200 ${
                selectedCategory === 'همه' 
                  ? 'text-white shadow-md' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              style={selectedCategory === 'همه' ? { backgroundColor: primaryColor } : {}}
            >
              همه محصولات
            </button>
            {displayCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-5 py-2 rounded-full font-medium transition-all duration-200 flex items-center gap-1 ${
                  selectedCategory === cat.name 
                    ? 'text-white shadow-md' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                style={selectedCategory === cat.name ? { backgroundColor: primaryColor } : {}}
              >
                <span>{cat.icon || '📦'}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ============ اسلایدر محصولات ============ */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg">هیچ محصولی با این مشخصات یافت نشد</p>
            <button
              onClick={clearSearch}
              className="mt-4 px-6 py-2 rounded-lg text-white"
              style={{ backgroundColor: primaryColor }}
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
              <Link 
                href="/products" 
                className="text-sm hover:underline"
                style={{ color: primaryColor }}
              >
                مشاهده همه ←
              </Link>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentProducts.map((product) => (
                  <div 
                    key={product?.id || Math.random()} 
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col h-full group"
                  >
                    <div className="bg-gray-100 h-48 flex items-center justify-center overflow-hidden">
                      {product?.images && product.images.length > 0 && product.images[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product?.name || 'محصول'}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<span class="text-6xl">📦</span>';
                            }
                          }}
                        />
                      ) : (
                        <span className="text-6xl transition-transform duration-500 group-hover:scale-110">📦</span>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 min-h-12 group-hover:text-blue-600 transition-colors">
                        {product?.name || 'بدون نام'}
                      </h3>
                      <div className="text-xl font-bold text-green-600 mb-2">
                        {(product?.price || 0).toLocaleString()} افغانی
                      </div>
                      <div className="inline-block bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600 mb-3 w-fit">
                        {product?.category || 'سایر'}
                      </div>
                      <Link 
                        href={`/products/${product?.id}`} 
                        className="block text-center text-white py-2 rounded-lg transition-all duration-300 mt-auto hover:shadow-md"
                        style={{ backgroundColor: secondaryColor }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.backgroundColor = primaryColor; 
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.backgroundColor = secondaryColor; 
                        }}
                      >
                        مشاهده جزئیات
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              {totalProductSlides > 1 && (
                <>
                  <button
                    onClick={() => goToProductSlide((currentProductSlide - 1 + totalProductSlides) % totalProductSlides)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white rounded-full shadow-lg p-2 hover:bg-gray-100 transition-all duration-300 hover:scale-110 z-10"
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => goToProductSlide((currentProductSlide + 1) % totalProductSlides)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white rounded-full shadow-lg p-2 hover:bg-gray-100 transition-all duration-300 hover:scale-110 z-10"
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: totalProductSlides }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToProductSlide(index)}
                        className={`transition-all duration-300 rounded-full ${
                          index === currentProductSlide ? 'w-6 h-2' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                        }`}
                        style={{ 
                          backgroundColor: index === currentProductSlide ? primaryColor : '#cbd5e0' 
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
    </div>
  );
}