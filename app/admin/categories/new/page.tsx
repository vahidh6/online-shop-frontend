'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const iconOptions = [
  '📦', '📱', '🔧', '🔋', '🛡️', '🎧', '⌚', '💻', '🎮', '📷', '🖨️', '🔌',
  '💾', '📀', '🎥', '📡', '🔊', '🎤', '🖱️', '⌨️', '🖨️', '📠', '☎️', '📺'
];

export default function NewCategory() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    icon: '📦',
    order: 0,
    isActive: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    try {
      const res = await fetch(`${apiUrl}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert('دسته‌بندی با موفقیت اضافه شد');
        router.push('/admin/categories');
      } else {
        const error = await res.json();
        alert(error.message || 'خطا در افزودن دسته‌بندی');
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
        <Link href="/admin/categories" className="text-blue-600">← بازگشت به لیست دسته‌بندی‌ها</Link>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">➕ افزودن دسته‌بندی جدید</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">نام دسته‌بندی (فارسی) *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="مثال: قطعات موبایل"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">نام دسته‌بندی (انگلیسی)</label>
            <input
              type="text"
              name="nameEn"
              value={formData.nameEn}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="مثال: Mobile Parts"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">آیکون</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {iconOptions.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`text-2xl p-2 rounded-lg transition ${
                    formData.icon === icon 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <input
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="مثال: 📱"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">ترتیب نمایش</label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">اعداد کوچکتر جلوتر نمایش داده می‌شوند</p>
          </div>
          
          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span>فعال</span>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'در حال ذخیره...' : '💾 ذخیره دسته‌بندی'}
          </button>
        </form>
      </div>
    </div>
  );
}