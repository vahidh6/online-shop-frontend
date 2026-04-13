'use client';

import { useState, useEffect, useMemo } from 'react';
import { matchSorter } from 'match-sorter';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images?: string[];
}

const categories = [
  'همه',
  'قطعات و تعمیرات موبایل',
  'باتری و شارژ',
  'محافظ و جانبی',
  'صدا و تصویر',
  'سایر',
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('همه');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // گرفتن دیتا
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          'https://online-shop-backend-production-27a8.up.railway.app/api/products'
        );

        if (!res.ok) throw new Error('API Error');

        const data: Product[] = await res.json();
        setProducts(data);
      } catch (err) {
        setError('خطا در دریافت اطلاعات');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // فیلتر + سرچ
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // دسته بندی
    if (category !== 'همه') {
      result = result.filter((p) => p.category === category);
    }

    // سرچ
    if (search.trim()) {
      result = matchSorter(result, search, {
        keys: ['name', 'description', 'category'],
        threshold: matchSorter.rankings.CONTAINS,
      });
    }

    return result;
  }, [products, search, category]);

  // حالت لودینگ
  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        در حال لود... صبر داشته باش، سرور هم انسان است.
      </div>
    );
  }

  // حالت خطا
  if (error) {
    return (
      <div className="text-center py-20 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* سرچ */}
      <input
        type="text"
        placeholder="جستجوی محصول..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 border rounded-lg mb-6"
      />

      {/* دسته بندی */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-lg transition ${
              category === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* نتیجه */}
      {filteredProducts.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          چیزی پیدا نشد... یا دیتابیس خالیه یا شانس تو.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredProducts.map((p) => (
            <div
              key={p._id}
              className="border rounded-lg p-3 shadow hover:shadow-lg transition"
            >
              <div className="h-40 bg-gray-100 flex items-center justify-center mb-2">
                {p.images?.[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">📦</span>
                )}
              </div>

              <h3 className="font-bold text-sm mb-1 line-clamp-2">
                {p.name}
              </h3>

              <p className="text-xs text-gray-500 mb-1">
                {p.category}
              </p>

              <p className="text-green-600 font-bold">
                {p.price.toLocaleString()} افغانی
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}