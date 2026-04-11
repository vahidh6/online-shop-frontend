'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function MyOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login?redirect=/orders');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    fetch(`${apiUrl}/api/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, [router]);

  const getStatusText = (status: string) => {
    const statuses: { [key: string]: string } = {
      pending_payment: '⏳ در انتظار پرداخت',
      payment_uploaded: '📤 رسید ارسال شده',
      payment_verified: '✅ پرداخت تایید شده',
      processing: '⚙️ در حال پردازش',
      shipped: '🚚 ارسال شده',
      delivered: '📦 تحویل داده شده',
      cancelled: '❌ لغو شده'
    };
    return statuses[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold mb-6">📋 سفارشات من</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">شما هنوز سفارشی ثبت نکرده‌اید</p>
          <Link href="/products" className="bg-blue-600 text-white px-6 py-2 rounded-lg inline-block">
            شروع خرید
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center border-b pb-3 mb-3">
                <div>
                  <span className="font-bold">شماره سفارش:</span> {order.orderNumber || order._id.slice(-8)}
                  <br />
                  <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('fa-IR')}</span>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                  {getStatusText(order.status)}
                </div>
              </div>
              
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2">
                  <span>{item.productName} × {item.quantity}</span>
                  <span>{(item.price * item.quantity).toLocaleString()} افغانی</span>
                </div>
              ))}
              
              <div className="border-t pt-3 mt-3 flex justify-between font-bold">
                <span>جمع کل:</span>
                <span className="text-green-600">{order.totalAmount.toLocaleString()} افغانی</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}