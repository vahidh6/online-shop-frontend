'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Settings {
  deliveryFeeKabul: number;
  deliveryFeeOther: number;
  freeDeliveryThreshold: number;
  primaryColor: string;
  secondaryColor: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProvince, setUserProvince] = useState<string>('کابل');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    deliveryFeeKabul: 50000,
    deliveryFeeOther: 100000,
    freeDeliveryThreshold: 0,
    primaryColor: '#e53e3e',
    secondaryColor: '#3182ce'
  });

  // دریافت تنظیمات و اطلاعات کاربر
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    // دریافت تنظیمات
    fetch(`${apiUrl}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data) setSettings(data);
      })
      .catch(err => console.error('Error fetching settings:', err));

    // بررسی لاگین و دریافت استان کاربر
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      setIsLoggedIn(true);
      try {
        const user = JSON.parse(userStr);
        if (user.province) setUserProvince(user.province);
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  // دریافت سبد خرید
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setLoading(false);
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    const newCart = cart.map(item => 
      item._id === id ? { ...item, quantity } : item
    );
    saveCart(newCart);
  };

  const removeItem = (id: string) => {
    const newCart = cart.filter(item => item._id !== id);
    saveCart(newCart);
  };

  // محاسبه هزینه ارسال بر اساس استان
  const getDeliveryFee = () => {
    if (userProvince === 'کابل') {
      return settings.deliveryFeeKabul;
    }
    return settings.deliveryFeeOther;
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? getDeliveryFee() : 0;
  const totalPrice = subtotal + deliveryFee;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // بررسی ارسال رایگان
  const isFreeDelivery = settings.freeDeliveryThreshold > 0 && subtotal >= settings.freeDeliveryThreshold;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container-custom py-8 text-center">
        {/* دکمه برگشت به صفحه اصلی */}
        <div className="mb-6 text-right">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>بازگشت به صفحه اصلی</span>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-12 max-w-md mx-auto">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold mb-4">سبد خرید خالی است</h1>
          <p className="text-gray-500 mb-6">هنوز محصولی به سبد خرید خود اضافه نکرده‌اید.</p>
          <Link 
            href="/products" 
            className="inline-block text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
            style={{ backgroundColor: settings.primaryColor }}
          >
            شروع خرید
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* دکمه برگشت به صفحه اصلی */}
      <div className="mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>بازگشت به صفحه اصلی</span>
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">🛒 سبد خرید</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {cart.map(item => (
            <div key={item._id} className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-2xl">
                    📦
                  </div>
                )}
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="text-green-600 font-bold">{item.price.toLocaleString()} افغانی</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition"
                >
                  +
                </button>
              </div>
              <div className="min-w-[120px] text-right">
                <p className="font-bold text-lg">{(item.price * item.quantity).toLocaleString()} افغانی</p>
                <button 
                  onClick={() => removeItem(item._id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 h-fit sticky top-20">
          <h2 className="font-bold text-lg mb-4">خلاصه سبد خرید</h2>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">تعداد اقلام:</span>
              <span className="font-medium">{totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">جمع سبد خرید:</span>
              <span>{subtotal.toLocaleString()} افغانی</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">هزینه ارسال:</span>
              <div className="text-right">
                {isFreeDelivery ? (
                  <span className="text-green-600">رایگان</span>
                ) : (
                  <span>{deliveryFee.toLocaleString()} افغانی</span>
                )}
              </div>
            </div>
            {!isLoggedIn && (
              <div className="text-xs text-gray-400 mt-1">
                <Link href="/auth/login" className="text-blue-600 hover:underline">
                  وارد شوید
                </Link> تا هزینه ارسال بر اساس استان شما محاسبه شود
              </div>
            )}
            {isLoggedIn && userProvince && (
              <div className="text-xs text-gray-500">
                استان شما: {userProvince}
              </div>
            )}
            {!isFreeDelivery && settings.freeDeliveryThreshold > 0 && (
              <div className="text-xs text-blue-600">
                {Math.max(0, settings.freeDeliveryThreshold - subtotal).toLocaleString()} افغانی دیگر برای ارسال رایگان
              </div>
            )}
          </div>
          
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between text-xl font-bold">
              <span>جمع کل:</span>
              <span className="text-green-600">
                {(isFreeDelivery ? subtotal : totalPrice).toLocaleString()} افغانی
              </span>
            </div>
          </div>
          
          <Link 
            href="/checkout" 
            className="block text-center text-white py-3 rounded-lg mt-4 transition hover:opacity-90"
            style={{ backgroundColor: settings.primaryColor }}
          >
            ادامه فرآیند خرید
          </Link>
          
          <Link 
            href="/products" 
            className="block text-center text-gray-600 py-2 rounded-lg mt-2 hover:bg-gray-50 transition"
          >
            + افزودن محصولات بیشتر
          </Link>
        </div>
      </div>
    </div>
  );
}