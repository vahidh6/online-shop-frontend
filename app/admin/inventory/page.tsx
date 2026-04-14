'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
}

interface Inventory {
  productId: string;
  province: string;
  quantity: number;
  reservedQuantity: number;
}

const provinces = ['کابل', 'هرات', 'مزارشریف', 'قندهار', 'بلخ', 'ننگرهار', 'بامیان', 'دیگر'];

export default function AdminInventory() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<{ [key: string]: { [key: string]: number } }>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    const token = localStorage.getItem('token');
    
    setError('');
    
    try {
      // دریافت محصولات
      const productsRes = await fetch(`${apiUrl}/api/products`);
      if (!productsRes.ok) {
        throw new Error('خطا در دریافت محصولات');
      }
      const productsData = await productsRes.json();
      setProducts(productsData);

      // دریافت موجودی‌ها با توکن
      const inventoryRes = await fetch(`${apiUrl}/api/products/inventory/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // بررسی خطای 401
      if (inventoryRes.status === 401) {
        setError('نشست شما منقضی شده است. لطفاً مجدداً وارد شوید.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          router.push('/admin/login');
        }, 2000);
        setLoading(false);
        return;
      }
      
      if (!inventoryRes.ok) {
        throw new Error(`خطا در دریافت موجودی: ${inventoryRes.status}`);
      }
      
      const inventoryData = await inventoryRes.json();
      
      // بررسی آرایه بودن داده
      if (!Array.isArray(inventoryData)) {
        console.error('Inventory data is not an array:', inventoryData);
        setError('داده دریافتی از سرور معتبر نیست');
        setInventory({});
        setLoading(false);
        return;
      }

      // تبدیل به فرمت مناسب
      const invMap: { [key: string]: { [key: string]: number } } = {};
      productsData.forEach((product: Product) => {
        invMap[product._id] = {};
        provinces.forEach(province => {
          const found = inventoryData.find((inv: any) => inv.productId === product._id && inv.province === province);
          invMap[product._id][province] = found ? found.quantity : 0;
        });
      });
      setInventory(invMap);
    } catch (error) {
      console.error('Error:', error);
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId: string, province: string, value: number) => {
    setInventory(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [province]: value
      }
    }));
  };

  const saveInventory = async () => {
    setSaving(true);
    setError('');
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';

    try {
      for (const product of products) {
        for (const province of provinces) {
          const quantity = inventory[product._id]?.[province] || 0;
          const res = await fetch(`${apiUrl}/api/products/inventory/${product._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ province, quantity })
          });
          
          if (!res.ok && res.status !== 401) {
            console.error(`Error saving inventory for ${product.name} in ${province}`);
          }
        }
      }
      alert('موجودی با موفقیت ذخیره شد');
      await fetchData(); // refresh data
    } catch (error) {
      console.error('Error:', error);
      alert('خطا در ذخیره موجودی');
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
    <div className="container-custom py-8">
      {/* دکمه برگشت */}
      <div className="mb-6">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>بازگشت به داشبورد</span>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📦 مدیریت موجودی انبار</h1>
      </div>

      {/* نمایش خطا */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-right">محصول</th>
              <th className="p-3 text-right">دسته‌بندی</th>
              {provinces.map(prov => (
                <th key={prov} className="p-3 text-center">{prov}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{product.name}</td>
                <td className="p-3 text-sm text-gray-500">{product.category}</td>
                {provinces.map(province => (
                  <td key={province} className="p-2 text-center">
                    <input
                      type="number"
                      value={inventory[product._id]?.[province] || 0}
                      onChange={(e) => handleQuantityChange(product._id, province, parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                   </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {products.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">هیچ محصولی یافت نشد</p>
            <Link href="/admin/products/new" className="text-blue-600 mt-2 inline-block">
              افزودن محصول جدید
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={saveInventory}
          disabled={saving}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          {saving ? 'در حال ذخیره...' : '💾 ذخیره همه موجودی‌ها'}
        </button>
      </div>
    </div>
  );
}