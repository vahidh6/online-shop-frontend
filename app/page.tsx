'use client';

import { useState, useEffect, useMemo } from 'react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images?: string[];
}

const categories = ['همه', 'قطعات و تعمیرات موبایل', 'باتری و شارژ', 'محافظ و جانبی', 'صدا و تصویر', 'سایر'];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('همه');
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // گرفتن دیتا
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://online-shop-backend-production-27a8.up.railway.app/api/products');
        const data: Product[] = await res.json();
        setProducts(data);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // سرچ ساده
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (category !== 'همه') {
      result = result.filter(p => p.category === category);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }

    return result;
  }, [products, search, category]);

  // اسلاید اتوماتیک
  useEffect(() => {
    if (filteredProducts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev =>
        prev + 1 >= filteredProducts.length ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [filteredProducts]);

  if (loading) {
    return <div className="text-center py-20">در حال لود...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* سرچ */}
      <input
        type="text"
        placeholder="جستجو..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 border rounded mb-4"
      />

      {/* دسته بندی */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setCurrentIndex(0);
            }}
            className={`px-4 py-2 rounded ${
              category === cat ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* اسلایدر */}
      {filteredProducts.length > 0 ? (
        <div className="relative overflow-hidden">

          <div
            className="flex transition-all duration-700"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`
            }}
          >
            {filteredProducts.map(p => (
              <div
                key={p._id}
                className="min-w-full p-4"
              >
                <div className="bg-white rounded-lg shadow p-4 flex gap-4 items-center">

                  <div className="w-32 h-32 bg-gray-100 flex items-center justify-center">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} className="h-full object-cover" />
                    ) : (
                      <span className="text-3xl">📦</span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-lg">{p.name}</h3>
                    <p className="text-gray-500 text-sm">{p.category}</p>
                    <p className="text-green-600 font-bold mt-2">
                      {p.price.toLocaleString()} افغانی
                    </p>
                  </div>

                </div>
              </div>
            ))}
          </div>

        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          چیزی پیدا نشد... زندگی هم همینطوره.
        </div>
      )}

    </div>
  );
}