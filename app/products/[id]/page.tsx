// app/products/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images?: string[];
}

export default function ProductDetail() {
  const params = useParams();
  const settings = useSettings();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.products.getOne(params.id as string);
        
        if (!res.ok) {
          throw new Error('محصول یافت نشد');
        }
        
        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.message || 'خطا در دریافت محصول');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const addToCart = () => {
    if (!product) return;
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex((item: any) => item._id === product._id);
    
    if (existingIndex !== -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ 
        _id: product._id, 
        name: product.name, 
        price: product.price, 
        quantity: 1 
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    alert(`${product.name} به سبد خرید اضافه شد`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-custom py-8 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-red-600 mb-4">{error || 'محصول یافت نشد'}</h1>
        <Link href="/products" className="text-blue-600 hover:underline inline-block">
          ← بازگشت به محصولات
        </Link>
      </div>
    );
  }

  // ✅ اطمینان از وجود قیمت
  const price = product.price || 0;
  const productName = product.name || 'بدون نام';
  const productDescription = product.description || 'توضیحاتی موجود نیست';
  const productCategory = product.category || 'سایر';
  const productImages = product.images || [];

  return (
    <div className="container-custom py-8">
      <Link href="/products" className="text-blue-600 inline-block mb-6 hover:underline">
        ← بازگشت به محصولات
      </Link>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 bg-gray-100 p-8 flex items-center justify-center min-h-[300px]">
            {productImages.length > 0 && productImages[0] ? (
              <img 
                src={productImages[0]} 
                alt={productName}
                className="max-h-96 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-8xl">📦</span>';
                  }
                }}
              />
            ) : (
              <span className="text-8xl">📦</span>
            )}
          </div>
          <div className="md:w-1/2 p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{productName}</h1>
            <div className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600 mb-4">
              {productCategory}
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">{productDescription}</p>
            <div className="text-3xl font-bold text-green-600 mb-6">
              {price.toLocaleString()} افغانی
            </div>
            <button 
              onClick={addToCart}
              className="w-full text-white py-3 rounded-lg font-bold transition hover:opacity-90"
              style={{ backgroundColor: settings?.primaryColor || '#e53e3e' }}
            >
              🛒 افزودن به سبد خرید
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}