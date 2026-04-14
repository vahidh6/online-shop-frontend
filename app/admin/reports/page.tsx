'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, ArrowDownTrayIcon, CalendarIcon, CurrencyDollarIcon, ShoppingBagIcon, UserGroupIcon, TruckIcon } from '@heroicons/react/24/outline';

interface Order {
  _id: string;
  orderNumber: string;
  customerId: { name: string; phone: string; province: string };
  totalAmount: number;
  status: string;
  paymentMethod: string;
  province: string;
  createdAt: string;
  items: Array<{ productName: string; quantity: number; price: number }>;
}

export default function AdminReports() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    // تنظیم تاریخ پیش‌فرض (30 روز اخیر)
    const today = new Date().toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setStartDate(monthAgo);
    setEndDate(today);
    
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
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    let filtered = [...orders];
    
    if (startDate) {
      filtered = filtered.filter(o => new Date(o.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(o => new Date(o.createdAt) <= new Date(endDate));
    }
    
    return filtered;
  };

  const getStats = () => {
    const filtered = getFilteredOrders();
    const delivered = filtered.filter(o => o.status === 'delivered');
    const pending = filtered.filter(o => o.status === 'pending_payment' || o.status === 'payment_uploaded');
    const cancelled = filtered.filter(o => o.status === 'cancelled');
    
    return {
      totalOrders: filtered.length,
      totalRevenue: delivered.reduce((sum, o) => sum + o.totalAmount, 0),
      totalPending: pending.reduce((sum, o) => sum + o.totalAmount, 0),
      totalCancelled: cancelled.reduce((sum, o) => sum + o.totalAmount, 0),
      deliveredCount: delivered.length,
      pendingCount: pending.length,
      cancelledCount: cancelled.length,
      avgOrderValue: delivered.length > 0 ? Math.round(delivered.reduce((sum, o) => sum + o.totalAmount, 0) / delivered.length) : 0
    };
  };

  const getSalesByProvince = () => {
    const filtered = getFilteredOrders().filter(o => o.status === 'delivered');
    const provinceMap = new Map<string, { count: number; amount: number }>();
    
    filtered.forEach(order => {
      const province = order.province || 'نامشخص';
      const existing = provinceMap.get(province) || { count: 0, amount: 0 };
      provinceMap.set(province, {
        count: existing.count + 1,
        amount: existing.amount + order.totalAmount
      });
    });
    
    return Array.from(provinceMap.entries())
      .map(([province, data]) => ({ province, ...data }))
      .sort((a, b) => b.amount - a.amount);
  };

  const getTopProducts = () => {
    const filtered = getFilteredOrders().filter(o => o.status === 'delivered');
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    
    filtered.forEach(order => {
      order.items?.forEach(item => {
        const existing = productMap.get(item.productName) || { name: item.productName, quantity: 0, revenue: 0 };
        productMap.set(item.productName, {
          name: item.productName,
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + (item.price * item.quantity)
        });
      });
    });
    
    return Array.from(productMap.entries())
      .map(([_, data]) => data)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  const exportToCSV = () => {
    const filtered = getFilteredOrders();
    const headers = ['شماره سفارش', 'مشتری', 'شماره تماس', 'استان', 'مبلغ', 'وضعیت', 'روش پرداخت', 'تاریخ'];
    const rows = filtered.map(order => [
      order.orderNumber || order._id.slice(-8),
      order.customerId?.name || '-',
      order.customerId?.phone || '-',
      order.province,
      order.totalAmount,
      order.status,
      order.paymentMethod,
      new Date(order.createdAt).toLocaleDateString('fa-IR')
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `orders_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const stats = getStats();
  const salesByProvince = getSalesByProvince();
  const topProducts = getTopProducts();

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

      <h1 className="text-2xl font-bold mb-6">📊 گزارشات فروش</h1>

      {/* انتخاب بازه زمانی */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">از تاریخ</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">تا تاریخ</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            onClick={exportToCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            خروجی CSV
          </button>
        </div>
      </div>

      {/* کارت‌های آمار */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">کل فروش</p>
              <p className="text-2xl font-bold mt-1">{stats.totalRevenue.toLocaleString()} افغانی</p>
            </div>
            <CurrencyDollarIcon className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">تعداد سفارشات</p>
              <p className="text-2xl font-bold mt-1">{stats.totalOrders}</p>
            </div>
            <ShoppingBagIcon className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-yellow-100 text-sm">میانگین ارزش سفارش</p>
              <p className="text-2xl font-bold mt-1">{stats.avgOrderValue.toLocaleString()} افغانی</p>
            </div>
            <TruckIcon className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm">سفارشات تحویل شده</p>
              <p className="text-2xl font-bold mt-1">{stats.deliveredCount}</p>
            </div>
            <UserGroupIcon className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* فروش بر اساس استان */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">📊 فروش بر اساس استان</h2>
        <div className="space-y-3">
          {salesByProvince.map((item) => (
            <div key={item.province} className="flex items-center gap-4">
              <div className="w-32 font-medium">{item.province}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full transition-all"
                  style={{ width: `${(item.amount / stats.totalRevenue) * 100}%` }}
                />
              </div>
              <div className="w-32 text-left text-sm text-gray-600">
                {item.amount.toLocaleString()} افغانی ({item.count} سفارش)
              </div>
            </div>
          ))}
          {salesByProvince.length === 0 && (
            <p className="text-gray-500 text-center">هیچ داده‌ای موجود نیست</p>
          )}
        </div>
      </div>

      {/* محصولات پرفروش */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4">🏆 محصولات پرفروش</h2>
        <div className="space-y-3">
          {topProducts.map((product, index) => (
            <div key={product.name} className="flex items-center gap-4">
              <div className="w-8 text-center font-bold text-gray-500">{index + 1}</div>
              <div className="flex-1">
                <div className="font-medium">{product.name}</div>
                <div className="text-xs text-gray-500">
                  {product.quantity} عدد | {product.revenue.toLocaleString()} افغانی
                </div>
              </div>
            </div>
          ))}
          {topProducts.length === 0 && (
            <p className="text-gray-500 text-center">هیچ داده‌ای موجود نیست</p>
          )}
        </div>
      </div>
    </div>
  );
}