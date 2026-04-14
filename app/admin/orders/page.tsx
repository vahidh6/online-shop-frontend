'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Order {
  _id: string;
  orderNumber: string;
  customerId: {
    name: string;
    email: string;
    phone: string;
  };
  totalAmount: number;
  status: string;
  paymentMethod: string;
  province: string;
  paymentReceipt?: {
    referenceNumber: string;
    bankName: string;
    senderName: string;
    amount: number;
    exchangeName: string;
    uploadedAt: string;
  };
  createdAt: string;
}

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

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
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(id);
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    try {
      const res = await fetch(`${apiUrl}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        await fetchOrders();
        alert('وضعیت سفارش با موفقیت تغییر کرد');
      } else {
        const error = await res.json();
        alert(error.message || 'خطا در تغییر وضعیت');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('خطا در ارتباط با سرور');
    } finally {
      setUpdating(null);
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

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      pending_payment: 'در انتظار پرداخت',
      payment_uploaded: 'رسید ارسال شده',
      payment_verified: 'پرداخت تایید شده',
      processing: 'در حال پردازش',
      shipped: 'ارسال شده',
      delivered: 'تحویل داده شده',
      cancelled: 'لغو شده'
    };
    return texts[status] || status;
  };

  const getPaymentMethodText = (method: string) => {
    const methods: { [key: string]: string } = {
      cash_on_delivery: 'نقدی هنگام تحویل',
      card_to_card: 'کارت به کارت',
      exchange_hawala: 'حواله صرافی'
    };
    return methods[method] || method;
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
      {/* دکمه برگشت */}
      <div className="mb-6">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>بازگشت به داشبورد</span>
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">📋 مدیریت سفارشات</h1>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-right">شماره سفارش</th>
              <th className="p-3 text-right">مشتری</th>
              <th className="p-3 text-right">مبلغ</th>
              <th className="p-3 text-right">وضعیت</th>
              <th className="p-3 text-right">روش پرداخت</th>
              <th className="p-3 text-right">نام صرافی/بانک</th>
              <th className="p-3 text-right">شماره پیگیری</th>
              <th className="p-3 text-right">تاریخ</th>
              <th className="p-3 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-mono text-sm">{order.orderNumber || order._id.slice(-8)}</td>
                <td className="p-3">{order.customerId?.name || '-'}</td>
                <td className="p-3 font-bold text-green-600">{order.totalAmount.toLocaleString()} افغانی</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td className="p-3 text-sm">{getPaymentMethodText(order.paymentMethod)}</td>
                <td className="p-3">
                  {order.paymentReceipt?.exchangeName && (
                    <div className="text-sm">{order.paymentReceipt.exchangeName}</div>
                  )}
                  {order.paymentReceipt?.bankName && (
                    <div className="text-sm">{order.paymentReceipt.bankName}</div>
                  )}
                  {!order.paymentReceipt?.exchangeName && !order.paymentReceipt?.bankName && (
                    <span className="text-gray-400 text-sm">---</span>
                  )}
                </td>
                <td className="p-3">
                  {order.paymentReceipt?.referenceNumber ? (
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {order.paymentReceipt.referenceNumber}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">---</span>
                  )}
                </td>
                <td className="p-3 text-sm">{new Date(order.createdAt).toLocaleDateString('fa-IR')}</td>
                <td className="p-3">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    disabled={updating === order._id}
                    className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {orders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">هیچ سفارشی یافت نشد</p>
          </div>
        )}
      </div>
    </div>
  );
}