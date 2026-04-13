'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Banner {
  _id: string;
  title: string;
  titleEn: string;
  description: string;
  image: string;
  bgColor: string;
  order: number;
  isActive: boolean;
  link: string;
  buttonText: string;
  startDate: string;
  endDate: string;
}

export default function AdminBanners() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchBanners();
  }, [router]);

  const fetchBanners = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${apiUrl}/api/banners/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBanners(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    try {
      const res = await fetch(`${apiUrl}/api/banners/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      
      if (res.ok) {
        fetchBanners();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('آیا از حذف این بنر مطمئن هستید؟')) return;
    
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    try {
      const res = await fetch(`${apiUrl}/api/banners/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchBanners();
        alert('بنر حذف شد');
      }
    } catch (error) {
      console.error('Error:', error);
    }
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
        <h1 className="text-2xl font-bold">🖼️ مدیریت بنرهای اسلایدر</h1>
        <Link href="/admin/banners/new" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          + افزودن بنر جدید
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner._id} className="bg-white rounded-lg shadow overflow-hidden">
            <div 
              className="h-32 flex items-center justify-center text-white"
              style={{ backgroundColor: banner.bgColor || '#3b82f6' }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold">{banner.title}</div>
                <div className="text-sm opacity-90">{banner.description}</div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  banner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {banner.isActive ? 'فعال' : 'غیرفعال'}
                </span>
                <span className="text-xs text-gray-400">ترتیب: {banner.order}</span>
              </div>
              <p className="text-sm text-gray-500 mb-3 truncate">{banner.link || 'بدون لینک'}</p>
              <div className="flex gap-2">
                <Link 
                  href={`/admin/banners/edit/${banner._id}`} 
                  className="flex-1 text-center bg-blue-600 text-white py-1 rounded hover:bg-blue-700 text-sm"
                >
                  ویرایش
                </Link>
                <button 
                  onClick={() => deleteBanner(banner._id)}
                  className="flex-1 text-center bg-red-600 text-white py-1 rounded hover:bg-red-700 text-sm"
                >
                  حذف
                </button>
              </div>
              <button
                onClick={() => toggleStatus(banner._id, banner.isActive)}
                className="w-full mt-2 text-center bg-gray-100 text-gray-700 py-1 rounded hover:bg-gray-200 text-sm"
              >
                {banner.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {banners.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">هیچ بنری وجود ندارد</p>
          <Link href="/admin/banners/new" className="text-blue-600 mt-2 inline-block">
            اولین بنر را اضافه کنید
          </Link>
        </div>
      )}
      
      <div className="mt-6">
        <Link href="/admin" className="text-gray-600">← بازگشت به داشبورد</Link>
      </div>
    </div>
  );
}