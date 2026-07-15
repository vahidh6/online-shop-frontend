// app/admin/products/new/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { CATEGORIES } from '@/services/constants';

export default function NewProduct() {
  const router = useRouter();
  const settings = useSettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: ''
  });

  // ============ بررسی توکن ============
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
  }, [router]);

  // ============ تغییر فیلدها ============
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError(null);
  };

  // ============ ثبت محصول جدید ============
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('لطفاً وارد شوید');
      router.push('/admin/login');
      setLoading(false);
      return;
    }

    // ============ اعتبارسنجی ============
    if (!formData.name.trim()) {
      setError('نام محصول الزامی است');
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError('توضیحات محصول الزامی است');
      setLoading(false);
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('قیمت محصول باید بیشتر از صفر باشد');
      setLoading(false);
      return;
    }

    if (!formData.category) {
      setError('دسته‌بندی محصول الزامی است');
      setLoading(false);
      return;
    }

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        images: formData.imageUrl ? [formData.imageUrl] : []
      };

      const res = await api.products.create(productData, token);

      if (res.ok) {
        alert('✅ محصول با موفقیت اضافه شد');
        router.push('/admin/products');
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'خطا در افزودن محصول');
      }
    } catch (err) {
      console.error('Error creating product:', err);
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  // ============ رندر ============
  if (!settings) return null;

  const primaryColor = settings?.primaryColor || '#e53e3e';

  return (
    <div className="container-custom py-8 max-w-2xl">
      {/* ============ بازگشت ============ */}
      <div className="mb-4">
        <Link href="/admin/products" className="text-blue-600 hover:underline">
          ← بازگشت به لیست محصولات
        </Link>
      </div>
      
      {/* ============ فرم ============ */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">➕ افزودن محصول جدید</h1>
        
        {/* ============ نمایش خطا ============ */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <span>❌</span>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* ============ نام محصول ============ */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              نام محصول <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="مثال: گوشی آیفون 13"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                error && !formData.name ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{ 
                '--tw-ring-color': primaryColor,
              } as React.CSSProperties}
            />
          </div>
          
          {/* ============ توضیحات ============ */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              توضیحات <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="توضیحات کامل محصول..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                error && !formData.description ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{ 
                '--tw-ring-color': primaryColor,
              } as React.CSSProperties}
            />
          </div>
          
          {/* ============ قیمت ============ */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              قیمت (افغانی) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              placeholder="مثال: 50000"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                error && !formData.price ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{ 
                '--tw-ring-color': primaryColor,
              } as React.CSSProperties}
            />
            <p className="text-xs text-gray-500 mt-1">قیمت به افغانی وارد کنید</p>
          </div>
          
          {/* ============ دسته‌بندی ============ */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              دسته‌بندی <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
                error && !formData.category ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{ 
                '--tw-ring-color': primaryColor,
              } as React.CSSProperties}
            >
              <option value="">انتخاب دسته‌بندی</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          {/* ============ آدرس تصویر ============ */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              آدرس تصویر محصول (اختیاری)
            </label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
              style={{ 
                '--tw-ring-color': primaryColor,
              } as React.CSSProperties}
            />
            <p className="text-xs text-gray-500 mt-1">
              اگر خالی بگذارید، آیکون پیش‌فرض نمایش داده می‌شود
            </p>
            
            {/* ============ پیش‌نمایش تصویر ============ */}
            {formData.imageUrl && (
              <div className="mt-2 p-2 border rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">پیش‌نمایش:</p>
                <img 
                  src={formData.imageUrl} 
                  alt="پیش‌نمایش محصول"
                  className="w-24 h-24 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const msg = document.createElement('p');
                      msg.className = 'text-xs text-red-500 mt-1';
                      msg.textContent = '❌ لینک تصویر نامعتبر است';
                      parent.appendChild(msg);
                    }
                  }}
                />
              </div>
            )}
          </div>
          
          {/* ============ دکمه‌ها ============ */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 text-white py-2 rounded-lg transition disabled:opacity-50 hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? '⏳ در حال ذخیره...' : '💾 ذخیره محصول'}
            </button>
            <Link
              href="/admin/products"
              className="flex-1 text-center bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              انصراف
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}