'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export default function ProductDetail() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    fetch(`${apiUrl}/api/products/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">محصول یافت نشد</h1>
        <Link href="/products" className="text-blue-600 mt-4 inline-block">← بازگشت به محصولات</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <Link href="/products" className="text-blue-600 inline-block mb-6">← بازگشت به محصولات</Link>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 bg-gray-100 p-8 flex items-center justify-center">
            <span className="text-8xl">📦</span>
          </div>
          <div className="md:w-1/2 p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{product.name}</h1>
            <div className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600 mb-4">
              {product.category}
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
            <div className="text-3xl font-bold text-green-600 mb-6">{product.price.toLocaleString()} افغانی</div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition">
              🛒 افزودن به سبد خرید
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}