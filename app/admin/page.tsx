'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    const token = localStorage.getItem('token');
    
    try {
      // دریافت سفارشات
      const ordersRes = await fetch(`${apiUrl}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const orders = await ordersRes.json();
      
      // دریافت محصولات
      const productsRes = await fetch(`${apiUrl}/api/products`);
      const products = await productsRes.json();
      
      // محاسبه درآمد
      const revenue = orders
        .filter((order: any) => order.status === 'delivered' || order.status === 'payment_verified')
        .reduce((sum: number, order: any) => sum + order.totalAmount, 0);
      
      setStats({
        totalOrders: orders.length,
        totalProducts: products.length,
        totalRevenue: revenue
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="container-custom py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">🎛️ پنل مدیریت</h1>
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            خروج
          </button>
        </div>
      </div>
      
      <div className="container-custom py-8">
        {/* آمار کارت‌ها */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl mb-2">📦</div>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <div className="text-gray-600">کل سفارشات</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl mb-2">🛍️</div>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <div className="text-gray-600">کل محصولات</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-4xl mb-2">💰</div>
            <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} افغانی</div>
            <div className="text-gray-600">درآمد کل</div>
          </div>
        </div>
        
        {/* منوی مدیریت */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/admin/products" className="bg-blue-600 text-white p-6 rounded-lg text-center hover:bg-blue-700 transition">
            <div className="text-3xl mb-2">📦</div>
            <div className="font-bold">مدیریت محصولات</div>
          </Link>
          <Link href="/admin/orders" className="bg-green-600 text-white p-6 rounded-lg text-center hover:bg-green-700 transition">
            <div className="text-3xl mb-2">📋</div>
            <div className="font-bold">مدیریت سفارشات</div>
          </Link>
          <Link href="/admin/settings" className="bg-purple-600 text-white p-6 rounded-lg text-center hover:bg-purple-700 transition">
            <div className="text-3xl mb-2">⚙️</div>
            <div className="font-bold">تنظیمات سایت</div>
          </Link>
        </div>
      </div>
    </div>
  );
}