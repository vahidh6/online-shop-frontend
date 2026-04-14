'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingBagIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  CubeIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  PlusCircleIcon,
  DocumentTextIcon,
  TagIcon,
  PhotoIcon,
  ChartBarSquareIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

interface Stats {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStock: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStock: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token) {
      router.push('/admin/login');
      return;
    }
    
    try {
      const userData = JSON.parse(user || '{}');
      if (userData.role !== 'admin') {
        router.push('/');
        return;
      }
      setUserName(userData.name || 'مدیر');
    } catch (e) {
      router.push('/admin/login');
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
      
      // دریافت محصولات
      const productsRes = await fetch(`${apiUrl}/api/products`);
      
      // دریافت کاربران (با مدیریت خطا)
      let users: any[] = [];
      try {
        const usersRes = await fetch(`${apiUrl}/api/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (Array.isArray(usersData)) {
            users = usersData;
          } else {
            console.error('Users data is not an array:', usersData);
          }
        } else {
          console.error('Failed to fetch users:', usersRes.status, usersRes.statusText);
        }
      } catch (userError) {
        console.error('Error fetching users:', userError);
      }
      
      // پردازش سفارشات
      let orders: any[] = [];
      if (ordersRes.ok) {
        orders = await ordersRes.json();
      }
      
      // پردازش محصولات
      let products: any[] = [];
      if (productsRes.ok) {
        products = await productsRes.json();
      }
      
      const revenue = orders
        .filter((order: any) => order.status === 'delivered' || order.status === 'payment_verified')
        .reduce((sum: number, order: any) => sum + order.totalAmount, 0);
      
      const pendingOrders = orders.filter((order: any) => 
        order.status === 'pending_payment' || order.status === 'payment_uploaded'
      ).length;
      
      setStats({
        totalOrders: orders.length,
        totalProducts: products.length,
        totalUsers: users.length || 0,
        totalRevenue: revenue,
        pendingOrders: pendingOrders,
        lowStock: 0
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
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // منوی اصلی
  const menuItems = [
    { title: 'مدیریت محصولات', icon: CubeIcon, href: '/admin/products', color: 'bg-blue-500', description: 'افزودن، ویرایش و حذف محصولات' },
    { title: 'مدیریت سفارشات', icon: ShoppingBagIcon, href: '/admin/orders', color: 'bg-green-500', description: 'مشاهده و بروزرسانی وضعیت سفارشات' },
    { title: 'مدیریت کاربران', icon: UserGroupIcon, href: '/admin/users', color: 'bg-purple-500', description: 'مدیریت کاربران و دسترسی‌ها' },
    { title: 'مدیریت موجودی', icon: DocumentTextIcon, href: '/admin/inventory', color: 'bg-yellow-500', description: 'بروزرسانی موجودی انبار' },
    { title: 'مدیریت دسته‌بندی‌ها', icon: TagIcon, href: '/admin/categories', color: 'bg-indigo-500', description: 'افزودن، ویرایش و حذف دسته‌بندی محصولات' },
    { title: 'مدیریت بنرها', icon: PhotoIcon, href: '/admin/banners', color: 'bg-pink-500', description: 'مدیریت اسلایدرهای صفحه اصلی' },
    { title: 'گزارشات فروش', icon: ChartBarSquareIcon, href: '/admin/reports', color: 'bg-teal-500', description: 'مشاهده و خروجی گرفتن از گزارشات' },
    { title: 'تنظیمات سایت', icon: Cog6ToothIcon, href: '/admin/settings', color: 'bg-gray-500', description: 'ویرایش اطلاعات فروشگاه' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* هدر */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🎛️ پنل مدیریت</h1>
            <p className="text-sm text-gray-500">خوش آمدید، {userName}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span>خروج</span>
          </button>
        </div>
      </header>

      <div className="p-6">
        {/* آمار کارت‌ها */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">کل سفارشات</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalOrders}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <ShoppingBagIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-400">
              {stats.pendingOrders} سفارش در انتظار
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">کل محصولات</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalProducts}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CubeIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">کل کاربران</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalUsers}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <UserGroupIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">درآمد کل</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.totalRevenue.toLocaleString()} افغانی</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">میانگین سفارش</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {stats.totalOrders > 0 
                    ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString() 
                    : 0} افغانی
                </p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">نرخ تکمیل</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {stats.totalOrders > 0 
                    ? Math.round((stats.totalOrders - stats.pendingOrders) / stats.totalOrders * 100) 
                    : 0}%
                </p>
              </div>
              <div className="bg-teal-100 p-3 rounded-lg">
                <ChartBarIcon className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </div>
        </div>

        {/* منوی اصلی */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div className={`${item.color} p-3 rounded-xl text-white group-hover:scale-110 transition`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg">{item.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* اقدامات سریع */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">⚡ اقدامات سریع</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <PlusCircleIcon className="w-4 h-4" />
              افزودن محصول جدید
            </Link>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              <ShoppingBagIcon className="w-4 h-4" />
              مشاهده سفارشات جدید
            </Link>
            <Link
              href="/admin/inventory"
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
            >
              <DocumentTextIcon className="w-4 h-4" />
              بروزرسانی موجودی
            </Link>
            <Link
              href="/admin/categories"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
            >
              <TagIcon className="w-4 h-4" />
              مدیریت دسته‌بندی‌ها
            </Link>
            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              گزارشات فروش
            </Link>
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              <Cog6ToothIcon className="w-4 h-4" />
              تنظیمات سایت
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}