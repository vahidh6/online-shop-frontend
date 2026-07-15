// app/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  images?: string[];
}

export default function ProductsPage() {
  const settings = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('همه');

  useEffect(() => {
    api.products.getAll()
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, []);

  const categories = ['همه', ...Array.from(new Set(products.map(p => p?.category || 'سایر')))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesCategory = selectedCategory === 'همه' || product?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) return null;

  const primaryColor = settings?.primaryColor || '#e53e3e';
  const secondaryColor = settings?.secondaryColor || '#3182ce';

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🛍️ همه محصولات</h1>
      
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="جستجوی محصول..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition"
            style={{
              borderColor: primaryColor,
              '--tw-ring-color': primaryColor,
            } as React.CSSProperties}
          />
        </div>
        
        <div className="min-w-[150px]">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition"
            style={{
              borderColor: primaryColor,
              '--tw-ring-color': primaryColor,
            } as React.CSSProperties}
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

      <p className="text-gray-600 mb-4">{filteredProducts.length} محصول یافت شد</p>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-500 text-lg">هیچ محصولی با این مشخصات یافت نشد</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('همه');
            }}
            className="mt-4 px-6 py-2 rounded-lg text-white"
            style={{ backgroundColor: primaryColor }}
          >
            حذف فیلترها
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all group">
              <div className="bg-gray-100 h-48 flex items-center justify-center overflow-hidden">
                {product?.images && product.images.length > 0 && product.images[0] ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name || 'محصول'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = '<span class="text-6xl">📦</span>';
                      }
                    }}
                  />
                ) : (
                  <span className="text-6xl">📦</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-2 truncate">{product?.name || 'بدون نام'}</h3>
                <div className="text-lg font-bold text-green-600 mb-2">
                  {(product?.price || 0).toLocaleString()} افغانی
                </div>
                <div className="inline-block bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600 mb-3">
                  {product?.category || 'سایر'}
                </div>
                <Link 
                  href={`/products/${product.id}`} 
                  className="block text-center text-white py-2 rounded-lg transition"
                  style={{ backgroundColor: secondaryColor }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.backgroundColor = primaryColor; 
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.backgroundColor = secondaryColor; 
                  }}
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