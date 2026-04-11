'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Order {
  _id: string;
  orderNumber: string;
  customerId: {
    name: string;
  };
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${apiUrl}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    try {
      const res = await fetch(`${apiUrl}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (res.ok) {
        fetchOrders();
        alert('وضعیت سفارش بروزرسانی شد');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      pending_payment: 'bg-yellow-100 text-yellow-800',
      payment_uploaded: 'bg-blue-100 text-blue-800',
      payment_verified: 'bg-green-100 text-green-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📋 مدیریت سفارشات</h1>
        <Link href="/admin" className="text-gray-600">← بازگشت به داشبورد</Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-right">شماره سفارش</th>
              <th className="p-3 text-right">مشتری</th>
              <th className="p-3 text-right">مبلغ</th>
              <th className="p-3 text-right">وضعیت</th>
              <th className="p-3 text-right">تاریخ</th>
              <th className="p-3 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} className="border-t">
                <td className="p-3">{order.orderNumber || order._id.slice(-8)}</td>
                <td className="p-3">{order.customerId?.name || '-'}</td>
                <td className="p-3">{order.totalAmount.toLocaleString()} افغانی</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-3">{new Date(order.createdAt).toLocaleDateString('fa-IR')}</td>
                <td className="p-3">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    <option value="pending_payment">در انتظار پرداخت</option>
                    <option value="payment_uploaded">رسید ارسال شده</option>
                    <option value="payment_verified">پرداخت تایید شده</option>
                    <option value="processing">در حال پردازش</option>
                    <option value="shipped">ارسال شده</option>
                    <option value="delivered">تحویل داده شده</option>
                    <option value="cancelled">لغو شده</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}