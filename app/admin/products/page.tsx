// app/admin/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';

interface Product {
  id: number;        // ✅ API عددی برمی‌گرداند
  name: string;
  price: number;
  category: string;
  description?: string;
  images?: string[];
  is_active?: boolean;
}

export default function AdminProducts() {
  const router = useRouter();
  const settings = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('همه');

  // ============ دریافت محصولات ============
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.products.getAll();
      
      if (!res.ok) {
        throw new Error('خطا در دریافت محصولات');
      }
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('خطا در دریافت لیست محصولات');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ============ حذف محصول ============
  const deleteProduct = async (id: number) => {
    if (!confirm('آیا از حذف این محصول مطمئن هستید؟')) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('لطفاً وارد شوید');
      router.push('/admin/login');
      return;
    }
    
    try {
      const res = await api.products.delete(id, token);
      
      if (res.ok) {
        await fetchProducts();
        alert('✅ محصول با موفقیت حذف شد');
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'خطا در حذف محصول');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('خطا در ارتباط با سرور');
    }
  };

  // ============ فیلتر کردن محصولات ============
  const categories = ['همه', ...Array.from(new Set(products.map(p => p?.category || 'سایر')))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      (product?.name && product.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'همه' || product?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // ============ خروج ============
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };

  // ============ رندر ============
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="container-custom py-8">
      {/* ============ هدر ============ */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">📦 مدیریت محصولات</h1>
          <p className="text-sm text-gray-500 mt-1">
            {products.length} محصول در فروشگاه
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link 
            href="/admin/products/new" 
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            + افزودن محصول جدید
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            خروج
          </button>
        </div>
      </div>

      {/* ============ نمایش خطا ============ */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <span>❌</span>
            <span>{error}</span>
          </div>
          <button
            onClick={fetchProducts}
            className="mt-2 text-sm text-red-700 hover:underline"
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {/* ============ فیلترها ============ */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="جستجوی محصول..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ focusRingColor: settings?.primaryColor || '#e53e3e' }}
            />
          </div>
          <div className="min-w-[150px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              style={{ focusRingColor: settings?.primaryColor || '#e53e3e' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              ✕ پاک کردن
            </button>
          )}
        </div>
      </div>

      {/* ============ لیست محصولات ============ */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">
              {searchTerm || selectedCategory !== 'همه' 
                ? 'هیچ محصولی با این فیلترها یافت نشد' 
                : 'هیچ محصولی در فروشگاه وجود ندارد'}
            </p>
            {searchTerm || selectedCategory !== 'همه' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('همه');
                }}
                className="mt-4 text-blue-600 hover:underline"
              >
                حذف فیلترها
              </button>
            ) : (
              <Link 
                href="/admin/products/new" 
                className="mt-4 inline-block text-blue-600 hover:underline"
              >
                اولین محصول را اضافه کنید
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-right">#</th>
                  <th className="p-3 text-right">نام محصول</th>
                  <th className="p-3 text-right">دسته‌بندی</th>
                  <th className="p-3 text-right">قیمت</th>
                  <th className="p-3 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => (
                  <tr key={product.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3 text-gray-400 text-sm">{index + 1}</td>
                    <td className="p-3 font-medium">
                      <div className="flex items-center gap-3">
                        {product?.images && product.images.length > 0 && product.images[0] ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xl">
                            📦
                          </div>
                        )}
                        <span>{product?.name || 'بدون نام'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {product?.category || 'سایر'}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-green-600">
                      {(product?.price || 0).toLocaleString()} افغانی
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {/* ✅ استفاده از product.id (عددی) به جای product._id */}
                        <Link 
                          href={`/admin/products/edit/${product.id}`} 
                          className="text-blue-600 hover:text-blue-800 transition px-2 py-1 rounded hover:bg-blue-50"
                        >
                          ✏️ ویرایش
                        </Link>
                        <button 
                          onClick={() => deleteProduct(product.id)} 
                          className="text-red-600 hover:text-red-800 transition px-2 py-1 rounded hover:bg-red-50"
                        >
                          🗑️ حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============ بازگشت ============ */}
      <div className="mt-4">
        <Link href="/admin" className="text-gray-600 hover:text-blue-600 transition">
          ← بازگشت به داشبورد
        </Link>
      </div>
    </div>
  );
}