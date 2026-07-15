'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// کامپوننت داخلی که useSearchParams استفاده می‌کنه
function TrackingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderCode, setOrderCode] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);

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
  }, [searchParams]);

  const fetchUserOrders = async () => {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    try {
      const response = await fetch(`${apiUrl}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      const formattedOrders = data.map((order: any) => ({
        ...order,
        orderNumber: order.orderNumber || order._id.slice(-8).toUpperCase(),
        statusText: getStatusText(order.status),
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
      const response = await fetch(`${apiUrl}/api/orders/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderCode: code, email: userEmail })
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        // دیتای نمونه برای نمایش
        mockTrackOrder(code);
      }
    } catch (err) {
      mockTrackOrder(code);
    } finally {
      setLoading(false);
    }
  };

  const mockTrackOrder = (code: string) => {
    setOrder({
      _id: 'mock123',
      orderNumber: code.toUpperCase(),
      status: 'shipped',
      statusText: 'ارسال شده',
      date: new Date().toISOString(),
      totalAmount: 1250000,
      items: [
        { productName: 'محافظ صفحه آیفون 13', quantity: 2, price: 150000 },
        { productName: 'قاب محافظ اصلی', quantity: 1, price: 350000 },
      ],
      customerName: 'احمد رضایی',
      customerPhone: '0789123456',
      customerEmail: 'ahmad@example.com',
      shippingAddress: 'کابل، شهرنو، خیابان سوم، پلاک 123',
    });
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* عنوان صفحه */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🔍 پیگیری سفارشات</h1>
          <p className="text-gray-600">وضعیت سفارش خود را به صورت لحظه‌ای پیگیری کنید</p>
        </div>

        {/* فرم پیگیری */}
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-center">پیگیری با کد سفارش</h2>
          <form onSubmit={trackOrder}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">کد سفارش *</label>
              <input
                type="text"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                placeholder="مثال: AF-2026-001"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left font-mono"
                dir="ltr"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">ایمیل</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ایمیل خود را وارد کنید"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-medium text-lg"
            >
              {loading ? 'در حال جستجو...' : '🔍 پیگیری سفارش'}
            </button>
          </form>
          {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">{error}</div>}
        </div>

        {/* نمایش نتیجه */}
        {order && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <p className="text-sm opacity-90">شماره سفارش</p>
                  <p className="text-2xl font-bold font-mono">{order.orderNumber}</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 ${getStatusColor(order.status)} text-gray-800`}>
                  <span>{getStatusIcon(order.status)}</span>
                  <span>{getStatusText(order.status)}</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">📦 محصولات سفارش</h3>
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between py-2 border-b">
                    <span>{item.productName} × {item.quantity}</span>
                    <span>{(item.price * item.quantity).toLocaleString()} افغانی</span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 font-bold">
                  <span>جمع کل:</span>
                  <span className="text-green-600">{order.totalAmount?.toLocaleString()} افغانی</span>
                </div>
              </div>
              <button onClick={() => setOrder(null)} className="text-blue-600 hover:text-blue-700">
                ← جستجوی سفارش دیگر
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// کامپوننت اصلی با Suspense
export default function TrackingPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}