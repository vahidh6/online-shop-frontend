'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    try {
      // دریافت محصولات
      const productsRes = await fetch(`${apiUrl}/api/products`);
      const productsData = await productsRes.json();
      setProducts(productsData);

      // دریافت موجودی‌ها
      const inventoryRes = await fetch(`${apiUrl}/api/products/inventory/all`);
      const inventoryData = await inventoryRes.json();

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
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';

    try {
      for (const product of products) {
        for (const province of provinces) {
          const quantity = inventory[product._id]?.[province] || 0;
          await fetch(`${apiUrl}/api/products/inventory/${product._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ province, quantity })
          });
        }
      }
      alert('موجودی با موفقیت ذخیره شد');
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📦 مدیریت موجودی انبار</h1>
        <Link href="/admin" className="text-gray-600">← بازگشت به داشبورد</Link>
      </div>

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
              <tr key={product._id} className="border-t">
                <td className="p-3 font-medium">{product.name}</td>
                <td className="p-3 text-sm text-gray-500">{product.category}</td>
                {provinces.map(province => (
                  <td key={province} className="p-2 text-center">
                    <input
                      type="number"
                      value={inventory[product._id]?.[province] || 0}
                      onChange={(e) => handleQuantityChange(product._id, province, parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                      min="0"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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