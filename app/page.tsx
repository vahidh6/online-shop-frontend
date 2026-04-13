'use client';

import { useState, useEffect, useMemo } from 'react';
import { matchSorter } from 'match-sorter';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

const categories = ['همه', 'قطعات و تعمیرات موبایل', 'باتری و شارژ', 'محافظ و جانبی', 'صدا و تصویر', 'سایر'];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('همه');

  useEffect(() => {
    fetch('https://online-shop-backend-production-27a8.up.railway.app/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => setProducts([]));
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // فیلتر دسته بندی
    if (category !== 'همه') {
      result = result.filter(p => p.category === category);
    }

    // سرچ
    if (search.trim() !== '') {
      result = matchSorter(result, search, {
        keys: ['name', 'description', 'category'],
        threshold: matchSorter.rankings.CONTAINS,
      });
    }

    return result;
  }, [products, search, category]);

  return (
    <div className="p-6">

      {/* سرچ */}
      <input
        type="text"
        placeholder="جستجو..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 w-full mb-4"
      />

      {/* دسته بندی */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded ${
              category === cat ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* نتایج */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredProducts.map(p => (
          <div key={p._id} className="border p-3 rounded shadow">
            <h3 className="font-bold">{p.name}</h3>
            <p className="text-sm text-gray-500">{p.category}</p>
            <p className="text-green-600">{p.price} افغانی</p>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-center mt-6 text-gray-500">
          چیزی پیدا نشد... دنیا همیشه هم مطابق میل تو نیست.
        </p>
      )}
    </div>
  );
}