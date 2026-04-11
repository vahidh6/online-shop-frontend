'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    try {
      const res = await fetch(`${apiUrl}/api/products`, {
        method: 'POST',
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
        alert('محصول با موفقیت اضافه شد');
        router.push('/admin/products');
      } else {
        const error = await res.json();
        alert(error.message || 'خطا در افزودن محصول');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8 max-w-2xl">
      <div className="mb-4">
        <Link href="/admin/products" className="text-blue-600">← بازگشت به لیست محصولات</Link>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">➕ افزودن محصول جدید</h1>
        
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
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'در حال ذخیره...' : '💾 ذخیره محصول'}
          </button>
        </form>
      </div>
    </div>
  );
}