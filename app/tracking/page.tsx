'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface TrackingItem {
  status: string;
  date: string;
  description: string;
  location: string;
}

interface OrderTracking {
  _id: string;
  orderNumber: string;
  status: string;
  statusText: string;
  date: string;
  totalAmount: number;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  tracking: TrackingItem[];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
}

export default function TrackingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderCode, setOrderCode] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userOrders, setUserOrders] = useState<OrderTracking[]>([]);
  const [recentSearch, setRecentSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      setIsLoggedIn(true);
      fetchUserOrders();
    }

    // بررسی کد سفارش از URL
    const code = searchParams.get('code');
    if (code) {
      setOrderCode(code);
      trackOrderByCode(code, searchParams.get('email') || '');
    }
  }, []);

  const fetchUserOrders = async () => {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    try {
      const response = await fetch(`${apiUrl}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      // تبدیل سفارشات به فرمت پیگیری
      const formattedOrders = data.map((order: any) => ({
        ...order,
        orderNumber: order.orderNumber || order._id.slice(-8).toUpperCase(),
        statusText: getStatusText(order.status),
        tracking: generateTrackingHistory(order)
      }));
      setUserOrders(formattedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const trackOrderByCode = async (code: string, userEmail: string = '') => {
    setLoading(true);
    setError('');
    setOrder(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    try {
      // جستجوی سفارش با کد
      const response = await fetch(`${apiUrl}/api/orders/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderCode: code, email: userEmail })
      });

      if (response.ok) {
        const data = await response.json();
        const trackingOrder: OrderTracking = {
          ...data,
          orderNumber: data.orderNumber || data._id.slice(-8).toUpperCase(),
          statusText: getStatusText(data.status),
          tracking: generateTrackingHistory(data)
        };
        setOrder(trackingOrder);
        setRecentSearch(code);
      } else {
        setError('سفارشی با این کد یافت نشد');
      }
    } catch (err) {
      // برای نمایش نمونه با دیتای mock
      mockTrackOrder(code);
    } finally {
      setLoading(false);
    }
  };

  const mockTrackOrder = (code: string) => {
    // دیتای نمونه برای نمایش
    const mockOrder: OrderTracking = {
      _id: 'mock123',
      orderNumber: code.toUpperCase(),
      status: 'shipped',
      statusText: 'ارسال شده',
      date: new Date().toISOString(),
      totalAmount: 1250000,
      items: [
        { productName: 'محافظ صفحه آیفون 13', quantity: 2, price: 150000 },
        { productName: 'قاب محافظ اصلی', quantity: 1, price: 350000 },
        { productName: 'شارژر 20 وات', quantity: 1, price: 250000 }
      ],
      tracking: [
        {
          status: 'pending',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'سفارش ثبت شد',
          location: 'سیستم'
        },
        {
          status: 'processing',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'سفارش تایید و در حال آماده‌سازی',
          location: 'انبار مرکزی'
        },
        {
          status: 'shipped',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'سفارش به پست تحویل داده شد',
          location: 'مرکز پردازش کابل'
        }
      ],
      customerName: 'احمد رضایی',
      customerPhone: '0789123456',
      customerEmail: 'ahmad@example.com',
      shippingAddress: 'کابل، شهرنو، خیابان سوم، پلاک 123'
    };
    setOrder(mockOrder);
  };

  const trackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderCode.trim()) {
      setError('لطفاً کد سفارش را وارد کنید');
      return;
    }

    await trackOrderByCode(orderCode, email);
  };

  const getStatusText = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      pending_payment: 'در انتظار پرداخت',
      payment_uploaded: 'رسید ارسال شده',
      payment_verified: 'پرداخت تایید شده',
      processing: 'در حال پردازش',
      shipped: 'ارسال شده',
      delivered: 'تحویل شده',
      cancelled: 'لغو شده'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colorMap: { [key: string]: string } = {
      pending_payment: 'text-yellow-600 bg-yellow-100',
      payment_uploaded: 'text-blue-600 bg-blue-100',
      payment_verified: 'text-purple-600 bg-purple-100',
      processing: 'text-orange-600 bg-orange-100',
      shipped: 'text-blue-600 bg-blue-100',
      delivered: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100'
    };
    return colorMap[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status: string): string => {
    const iconMap: { [key: string]: string } = {
      pending_payment: '⏳',
      payment_uploaded: '📤',
      payment_verified: '✅',
      processing: '⚙️',
      shipped: '🚚',
      delivered: '📦',
      cancelled: '❌'
    };
    return iconMap[status] || '📋';
  };

  const generateTrackingHistory = (order: any): TrackingItem[] => {
    // این تابع بر اساس وضعیت سفارش، تاریخچه پیگیری می‌سازد
    const history = [];
    
    history.push({
      status: 'created',
      date: order.createdAt || new Date().toISOString(),
      description: 'سفارش ثبت شد',
      location: 'سیستم'
    });
    
    if (order.paymentVerifiedAt || order.status !== 'pending_payment') {
      history.push({
        status: 'payment_verified',
        date: order.paymentVerifiedAt || order.createdAt,
        description: 'پرداخت تایید شد',
        location: 'سیستم مالی'
      });
    }
    
    if (order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') {
      history.push({
        status: 'processing',
        date: order.processedAt || order.createdAt,
        description: 'سفارش در حال آماده‌سازی',
        location: 'انبار مرکزی'
      });
    }
    
    if (order.status === 'shipped' || order.status === 'delivered') {
      history.push({
        status: 'shipped',
        date: order.shippedAt || order.createdAt,
        description: 'سفارش ارسال شد',
        location: 'مرکز توزیع'
      });
    }
    
    if (order.status === 'delivered') {
      history.push({
        status: 'delivered',
        date: order.deliveredAt || order.createdAt,
        description: 'سفارش تحویل داده شد',
        location: 'آدرس مقصد'
      });
    }
    
    return history;
  };

  const getStepStatus = (stepStatus: string, currentStatus: string): 'completed' | 'current' | 'pending' => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const stepIndex = steps.indexOf(stepStatus);
    const currentIndex = steps.indexOf(currentStatus);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        
        {/* عنوان صفحه */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔍 پیگیری سفارشات
          </h1>
          <p className="text-gray-600">
            وضعیت سفارش خود را به صورت لحظه‌ای پیگیری کنید
          </p>
        </div>

        {/* فرم پیگیری سریع */}
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-center">
            پیگیری با کد سفارش
          </h2>
          <form onSubmit={trackOrder}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">
                کد سفارش *
              </label>
              <input
                type="text"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                placeholder="مثال: AF-2026-001"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left font-mono"
                dir="ltr"
              />
              <p className="text-xs text-gray-500 mt-1">
                کد سفارش در ایمیل و پیامک تایید برای شما ارسال شده است
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">
                ایمیل
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ایمیل خود را وارد کنید"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                برای سفارشات مهمان، ایمیل خود را وارد کنید
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-medium text-lg"
            >
              {loading ? 'در حال جستجو...' : '🔍 پیگیری سفارش'}
            </button>
          </form>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
              {error}
            </div>
          )}
        </div>

        {/* نمایش نتیجه پیگیری */}
        {order && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8 animate-fadeIn">
            {/* هدر سفارش */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <p className="text-sm opacity-90">شماره سفارش</p>
                  <p className="text-2xl font-bold font-mono tracking-wider">{order.orderNumber}</p>
                  <p className="text-sm mt-1">
                    تاریخ ثبت: {new Date(order.date).toLocaleDateString('fa-IR')}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 ${getStatusColor(order.status)} text-gray-800`}>
                  <span>{getStatusIcon(order.status)}</span>
                  <span>{order.statusText}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* اطلاعات مشتری */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span>👤</span> اطلاعات گیرنده
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">نام و نام خانوادگی:</span>
                    <p className="font-medium">{order.customerName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">شماره تماس:</span>
                    <p className="font-medium" dir="ltr">{order.customerPhone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-500">آدرس تحویل:</span>
                    <p className="font-medium">{order.shippingAddress}</p>
                  </div>
                </div>
              </div>

              {/* جزئیات سفارش */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span>📦</span> محصولات سفارش
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-right p-3">محصول</th>
                        <th className="text-center p-3">تعداد</th>
                        <th className="text-left p-3">قیمت واحد</th>
                        <th className="text-left p-3">مجموع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <img src={item.image} alt={item.productName} className="w-12 h-12 object-cover rounded" />
                              )}
                              <span>{item.productName}</span>
                            </div>
                          </td>
                          <td className="text-center p-3">{item.quantity}</td>
                          <td className="text-left p-3">{item.price.toLocaleString()} افغانی</td>
                          <td className="text-left p-3 font-medium">
                            {(item.price * item.quantity).toLocaleString()} افغانی
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="text-left p-3 font-bold text-lg">
                          مجموع کل:
                        </td>
                        <td className="text-left p-3 font-bold text-lg text-green-600">
                          {order.totalAmount.toLocaleString()} افغانی
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* مسیر پیگیری - Timeline */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span>📍</span> مسیر پیگیری سفارش
                </h3>
                <div className="relative">
                  {/* خط عمودی Timeline */}
                  <div className="absolute right-6 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block"></div>
                  
                  {order.tracking.map((item, idx) => (
                    <div key={idx} className="flex mb-6 relative">
                      <div className="flex flex-col items-center ml-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10
                          ${idx === order.tracking.length - 1 
                            ? 'bg-green-500 text-white' 
                            : 'bg-blue-500 text-white'}`}>
                          {idx === order.tracking.length - 1 ? '✓' : idx + 1}
                        </div>
                        {idx !== order.tracking.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 mt-2 hidden md:block"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <h4 className="font-semibold text-gray-800">
                            {item.description}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {new Date(item.date).toLocaleString('fa-IR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                          <span>📍</span> {item.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* دکمه پیگیری مجدد */}
              <div className="mt-6 pt-4 border-t text-center">
                <button
                  onClick={() => setOrder(null)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← جستجوی سفارش دیگر
                </button>
              </div>
            </div>
          </div>
        )}

        {/* سفارشات کاربر (اگر وارد شده باشد) */}
        {isLoggedIn && userOrders.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                📋 سفارشات اخیر شما
              </h2>
              <Link href="/orders" className="text-blue-600 hover:underline text-sm">
                مشاهده همه ←
              </Link>
            </div>
            <div className="space-y-3">
              {userOrders.slice(0, 3).map((order) => (
                <div
                  key={order._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setOrder(order)}
                >
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <p className="font-mono font-semibold text-blue-600">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.date).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.statusText}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="font-bold">{order.totalAmount.toLocaleString()} افغانی</p>
                      <button className="text-blue-600 text-sm hover:underline">
                        مشاهده جزئیات
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* راهنمایی */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-3 text-lg flex items-center gap-2">
            <span>💡</span> راهنمای پیگیری سفارش
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <ul className="space-y-2">
              <li>• کد سفارش خود را از ایمیل یا پیامک تایید دریافت کنید</li>
              <li>• کد سفارش را در کادر بالا وارد کنید</li>
              <li>• برای سفارشات مهمان، ایمیل خود را هم وارد کنید</li>
            </ul>
            <ul className="space-y-2">
              <li>• پس از ورود به حساب کاربری، تمام سفارشات شما نمایش داده می‌شود</li>
              <li>• می‌توانید سفارش را با کلیک روی آن پیگیری کنید</li>
              <li>• در صورت نیاز با پشتیبانی تماس بگیرید</li>
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-200 text-center">
            <p className="text-blue-600">
              📞 پشتیبانی: ۰۷۸۹ ۱۲۳ ۴۵۶۷ | ✉️ orders@afghanstore.com
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}