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

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    try {
      const res = await fetch(`${apiUrl}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('آیا از حذف این محصول مطمئن هستید؟')) return;
    
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    try {
      const res = await fetch(`${apiUrl}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchProducts();
        alert('محصول حذف شد');
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
        <h1 className="text-2xl font-bold">📦 مدیریت محصولات</h1>
        <Link href="/admin/products/new" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          + افزودن محصول جدید
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-right">نام محصول</th>
              <th className="p-3 text-right">دسته‌بندی</th>
              <th className="p-3 text-right">قیمت</th>
              <th className="p-3 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id} className="border-t">
                <td className="p-3">{product.name}</td>
                <td className="p-3">{product.category}</td>
                <td className="p-3">{product.price.toLocaleString()} افغانی</td>
                <td className="p-3">
                  <Link href={`/admin/products/edit/${product._id}`} className="text-blue-600 ml-3">
                    ویرایش
                  </Link>
                  <button onClick={() => deleteProduct(product._id)} className="text-red-600">
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4">
        <Link href="/admin" className="text-gray-600">← بازگشت به داشبورد</Link>
      </div>
    </div>
  );
}