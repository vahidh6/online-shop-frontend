// app/checkout/success/SuccessContent.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';

interface Order {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  customerInfo: {
    name: string;
    phone: string;
    province: string;
    address: string;
  };
}

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const settings = useSettings();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login?redirect=/checkout/success');
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await api.orders.getOne(orderId, token);
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('سفارش یافت نشد');
          }
          throw new Error('خطا در دریافت اطلاعات سفارش');
        }
        
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError(err.message || 'خطا در دریافت اطلاعات سفارش');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  // ============ رندر ============
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-custom py-8 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-red-600 mb-4">{error || 'خطا در دریافت سفارش'}</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          بازگشت به صفحه اصلی
        </Link>
      </div>
    );
  }

  // ============ وضعیت سفارش ============
  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending_payment: 'در انتظار پرداخت',
      payment_uploaded: 'رسید ارسال شده',
      payment_verified: 'پرداخت تایید شده',
      processing: 'در حال پردازش',
      shipped: 'ارسال شده',
      delivered: 'تحویل داده شده',
      cancelled: 'لغو شده'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      pending_payment: 'text-yellow-600 bg-yellow-100',
      payment_uploaded: 'text-blue-600 bg-blue-100',
      payment_verified: 'text-green-600 bg-green-100',
      processing: 'text-purple-600 bg-purple-100',
      shipped: 'text-indigo-600 bg-indigo-100',
      delivered: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100'
    };
    return colorMap[status] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-2xl mx-auto">
        {/* ============ پیام موفقیت ============ */}
        <div className="bg-green-100 border border-green-400 text-green-700 p-6 rounded-lg mb-6 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-2">سفارش شما با موفقیت ثبت شد!</h1>
          <p className="text-gray-600">
            شماره سفارش: <strong className="font-mono">{order.orderNumber || order._id.slice(-8).toUpperCase()}</strong>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {new Date(order.createdAt).toLocaleDateString('fa-IR')} - {new Date(order.createdAt).toLocaleTimeString('fa-IR')}
          </p>
        </div>

        {/* ============ اطلاعات سفارش ============ */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">📋 جزئیات سفارش</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">وضعیت</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">روش پرداخت</p>
              <p className="font-medium">
                {order.paymentMethod === 'cash_on_delivery' && 'نقدی هنگام تحویل'}
                {order.paymentMethod === 'card_to_card' && 'حواله بانکی'}
                {order.paymentMethod === 'exchange_hawala' && 'حواله صرافی'}
              </p>
            </div>
          </div>

          <h3 className="font-semibold mb-2">محصولات</h3>
          <div className="space-y-2 border-t pt-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.productName} × {item.quantity}</span>
                <span>{(item.price * item.quantity).toLocaleString()} افغانی</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between font-bold text-lg">
              <span>جمع کل:</span>
              <span className="text-green-600">{order.totalAmount.toLocaleString()} افغانی</span>
            </div>
          </div>
        </div>

        {/* ============ اطلاعات دریافت کننده ============ */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">👤 اطلاعات دریافت کننده</h2>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-500">نام:</span> {order.customerInfo?.name || '-'}</p>
            <p><span className="text-gray-500">شماره تماس:</span> {order.customerInfo?.phone || '-'}</p>
            <p><span className="text-gray-500">ولایت:</span> {order.customerInfo?.province || '-'}</p>
            <p><span className="text-gray-500">آدرس:</span> {order.customerInfo?.address || '-'}</p>
          </div>
        </div>

        {/* ============ دکمه‌ها ============ */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-2 text-white rounded-lg transition hover:opacity-90"
            style={{ backgroundColor: settings?.primaryColor || '#e53e3e' }}
          >
            بازگشت به فروشگاه
          </Link>
          <Link
            href="/orders"
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            مشاهده سفارشات من
          </Link>
          {order.status === 'pending_payment' && order.paymentMethod !== 'cash_on_delivery' && (
            <Link
              href={`/checkout/upload-payment?orderId=${order._id}`}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              📤 ارسال رسید پرداخت
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}