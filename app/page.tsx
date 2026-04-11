'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  createdAt: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    fetch(`${apiUrl}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-12 text-center text-white mb-12">
        <h1 className="text-4xl font-bold mb-4">🛍️ به فروشگاه افغانستان خوش آمدید!</h1>
        <p className="text-xl mb-6">بهترین محصولات با بهترین قیمت، ارسال سریع به سراسر افغانستان</p>
        <Link href="/products" className="bg-orange-500 hover:bg-orange-600 px-8 py-3 rounded-full font-bold inline-block transition">
          شروع خرید
        </Link>
      </div>

      {/* محصولات */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 pr-3 border-r-4 border-red-600">آخرین محصولات</h2>
      
      {products.length === 0 ? (
        <p className="text-center py-12 text-gray-500">هیچ محصولی یافت نشد</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="bg-gray-100 h-48 flex items-center justify-center">
                <span className="text-6xl">📦</span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-2 truncate">{product.name}</h3>
                <div className="text-xl font-bold text-green-600 mb-2">{product.price.toLocaleString()} افغانی</div>
                <div className="inline-block bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600 mb-3">
                  {product.category}
                </div>
                <Link 
                  href={`/products/${product._id}`} 
                  className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                >
                  مشاهده جزئیات
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}