// app/admin/products/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';  // ✅ اصلاح شده
import Link from 'next/link';
import { api } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { CATEGORIES } from '@/services/constants';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const settings = useSettings();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subCategory: '',
    imageUrl: '',
    isActive: true
  });

  const productId = params?.id as string;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    if (!productId || productId === 'undefined' || productId === 'null') {
      setError('شناسه محصول معتبر نیست');
      setLoading(false);
      return;
    }

    fetchProduct(productId);
  }, [params?.id]);

  const fetchProduct = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.products.getOne(id);
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`محصول با شناسه "${id}" یافت نشد`);
        }
        throw new Error(`خطا در دریافت محصول (کد ${res.status})`);
      }
      
      const data = await res.json();
      
      if (!data || data.id === undefined) {
        throw new Error('داده‌های محصول نامعتبر است');
      }
      
      const price = data.price || 0;
      const priceString = typeof price === 'string' ? price : price.toString();
      
      let imageUrl = '';
      if (data.images) {
        if (typeof data.images === 'string') {
          try {
            const parsed = JSON.parse(data.images);
            if (Array.isArray(parsed) && parsed.length > 0) {
              imageUrl = parsed[0];
            }
          } catch (e) {
            if (data.images.startsWith('http')) {
              imageUrl = data.images;
            }
          }
        } else if (Array.isArray(data.images) && data.images.length > 0) {
          imageUrl = data.images[0];
        }
      }
      
      setFormData({
        name: data?.name || '',
        description: data?.description || '',
        price: priceString,
        category: data?.category || '',
        subCategory: data?.sub_category || '',
        imageUrl: imageUrl,
        isActive: data?.is_active !== undefined ? data.is_active : true
      });
    } catch (err: any) {
      console.error('❌ Error fetching product:', err);
      setError(err.message || 'خطا در دریافت اطلاعات محصول');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : e.target.value;
    
    setFormData({
      ...formData,
      [e.target.name]: value
    });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('لطفاً وارد شوید');
      router.push('/admin/login');
      setSaving(false);
      return;
    }

    if (!productId || productId === 'undefined') {
      setError('شناسه محصول معتبر نیست');
      setSaving(false);
      return;
    }

    if (!formData.name.trim()) {
      setError('نام محصول الزامی است');
      setSaving(false);
      return;
    }

    if (!formData.description.trim()) {
      setError('توضیحات محصول الزامی است');
      setSaving(false);
      return;
    }

    const priceValue = parseFloat(formData.price);
    if (!formData.price || priceValue <= 0) {
      setError('قیمت محصول باید بیشتر از صفر باشد');
      setSaving(false);
      return;
    }

    if (!formData.category) {
      setError('دسته‌بندی محصول الزامی است');
      setSaving(false);
      return;
    }

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: priceValue,
        category: formData.category,
        sub_category: formData.subCategory || null,
        images: formData.imageUrl ? [formData.imageUrl] : [],
        is_active: formData.isActive
      };

      const res = await api.products.update(productId, productData, token);

      if (res.ok) {
        alert('✅ محصول با موفقیت ویرایش شد');
        router.push('/admin/products');
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'خطا در ویرایش محصول');
      }
    } catch (err) {
      console.error('❌ Error updating product:', err);
      setError('خطا در ارتباط با سرور');
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

  if (!settings) return null;

  const primaryColor = settings?.primaryColor || '#e53e3e';

  return (
    <div className="container-custom py-8 max-w-2xl">
      <div className="mb-4">
        <Link href="/admin/products" className="text-blue-600 hover:underline">
          ← بازگشت به لیست محصولات
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">✏️ ویرایش محصول</h1>
        
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <span>❌</span>
              <span>{error}</span>
            </div>
            <div className="mt-3 flex gap-3">
              <button
                onClick={() => {
                  if (productId && productId !== 'undefined') {
                    fetchProduct(productId);
                  } else {
                    setError('شناسه محصول معتبر نیست');
                  }
                }}
                className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                تلاش مجدد
              </button>
              <Link
                href="/admin/products"
                className="px-4 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
              >
                بازگشت به لیست
              </Link>
            </div>
          </div>
        ) : (
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
            
            {/* ============ زیر دسته‌بندی ============ */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">زیر دسته‌بندی (اختیاری)</label>
              <input
                type="text"
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                placeholder="مثال: گوشی موبایل"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                style={{ 
                  '--tw-ring-color': primaryColor,
                } as React.CSSProperties}
              />
            </div>
            
            {/* ============ آدرس تصویر ============ */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">آدرس تصویر محصول (اختیاری)</label>
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
              {formData.imageUrl && (
                <div className="mt-2 p-2 border rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500 mb-1">پیش‌نمایش:</p>
                  <img 
                    src={formData.imageUrl} 
                    alt="پیش‌نمایش محصول"
                    className="w-24 h-24 object-cover rounded border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* ============ فعال/غیرفعال ============ */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded focus:ring-2"
                  style={{ 
                    accentColor: primaryColor,
                    '--tw-ring-color': primaryColor,
                  } as React.CSSProperties}
                />
                <span className="text-sm font-medium">فعال</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                اگر غیرفعال باشد، محصول در فروشگاه نمایش داده نمی‌شود
              </p>
            </div>
            
            {/* ============ دکمه‌ها ============ */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 text-white py-2 rounded-lg transition disabled:opacity-50 hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                {saving ? '⏳ در حال ذخیره...' : '💾 ذخیره تغییرات'}
              </button>
              <Link
                href="/admin/products"
                className="flex-1 text-center bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                انصراف
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}