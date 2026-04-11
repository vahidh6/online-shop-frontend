'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export default function EditProduct() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  });

  const categories = [
    'الکترونیک',
    'پوشاک',
    'خوراکی',
    'آرایشی',
    'کتاب',
    'خانه و آشپزخانه',
    'ورزشی',
    'دیگر'
  ];

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    try {
      const res = await fetch(`${apiUrl}/api/products/${params.id}`);
      const data = await res.json();
      setFormData({
        name: data.name,
        description: data.description,
        price: data.price.toString(),
        category: data.category
      });
    } catch (err) {
      console.error('Error:', err);
      alert('خطا در دریافت اطلاعات محصول');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    try {
      const res = await fetch(`${apiUrl}/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseInt(formData.price),
          category: formData.category
        })
      });

      if (res.ok) {
        alert('محصول با موفقیت ویرایش شد');
        router.push('/admin/products');
      } else {
        const error = await res.json();
        alert(error.message || 'خطا در ویرایش محصول');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('خطا در ارتباط با سرور');
    } finally {
      setSaving(false);
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
    <div className="container-custom py-8 max-w-2xl">
      <div className="mb-4">
        <Link href="/admin/products" className="text-blue-600">← بازگشت به لیست محصولات</Link>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">✏️ ویرایش محصول</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">نام محصول *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">توضیحات *</label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">قیمت (افغانی) *</label>
            <input
              type="number"
              name="price"
              required
              value={formData.price}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">دسته‌بندی *</label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">انتخاب دسته‌بندی</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? 'در حال ذخیره...' : '💾 ذخیره تغییرات'}
            </button>
            <Link
              href="/admin/products"
              className="flex-1 text-center bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
            >
              انصراف
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}