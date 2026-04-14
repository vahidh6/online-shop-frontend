'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Category {
  _id: string;
  name: string;
  nameEn: string;
  icon: string;
  slug: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCategories() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchCategories();
  }, [router]);

  const fetchCategories = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${apiUrl}/api/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCategories(data);
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
      const res = await fetch(`${apiUrl}/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      
      if (res.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('آیا از حذف این دسته‌بندی مطمئن هستید؟')) return;
    
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    try {
      const res = await fetch(`${apiUrl}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchCategories();
        alert('دسته‌بندی حذف شد');
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
        <h1 className="text-2xl font-bold">📂 مدیریت دسته‌بندی‌ها</h1>
        <Link href="/admin/categories/new" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          + افزودن دسته‌بندی جدید
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-right">آیکون</th>
              <th className="p-3 text-right">نام دسته‌بندی</th>
              <th className="p-3 text-right">نام انگلیسی</th>
              <th className="p-3 text-right">slug</th>
              <th className="p-3 text-right">ترتیب</th>
              <th className="p-3 text-right">وضعیت</th>
              <th className="p-3 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category._id} className="border-t">
                <td className="p-3 text-2xl">{category.icon}</td>
                <td className="p-3 font-medium">{category.name}</td>
                <td className="p-3 text-gray-500">{category.nameEn || '-'}</td>
                <td className="p-3 text-sm text-gray-400">{category.slug}</td>
                <td className="p-3">{category.order}</td>
                <td className="p-3">
                  <button
                    onClick={() => toggleStatus(category._id, category.isActive)}
                    className={`px-2 py-1 rounded-full text-xs ${
                      category.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {category.isActive ? 'فعال' : 'غیرفعال'}
                  </button>
                </td>
                <td className="p-3">
                  <Link href={`/admin/categories/edit/${category._id}`} className="text-blue-600 ml-3">
                    ویرایش
                  </Link>
                  <button onClick={() => deleteCategory(category._id)} className="text-red-600">
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {categories.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg mt-4">
          <p className="text-gray-500">هیچ دسته‌بندی وجود ندارد</p>
          <Link href="/admin/categories/new" className="text-blue-600 mt-2 inline-block">
            اولین دسته‌بندی را اضافه کنید
          </Link>
        </div>
      )}
      
      <div className="mt-4">
        <Link href="/admin" className="text-gray-600">← بازگشت به داشبورد</Link>
      </div>
    </div>
  );
}