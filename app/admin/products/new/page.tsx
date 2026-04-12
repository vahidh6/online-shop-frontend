'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ==================== دسته‌بندی‌ها ====================
const mainCategories = [
  'قطعات و تعمیرات موبایل',
  'باتری و شارژ',
  'محافظ و جانبی',
  'صدا و تصویر',
  'سایر'
];

const subCategoriesByMain: { [key: string]: string[] } = {
  'قطعات و تعمیرات موبایل': [
    'لوازم تعمیرات سخت افزاری',
    'قطعات و آی سی موبایل',
    'LCD و صفحه نمایش'
  ],
  'باتری و شارژ': [
    'باطری موبایل',
    'پاوربانک',
    'شارژر و کابل'
  ],
  'محافظ و جانبی': [
    'پوشش و گلس',
    'کاور و قاب'
  ],
  'صدا و تصویر': [
    'هدفون و هدست',
    'اسپیکر همراه',
    'MP3 و MP4 پلیر'
  ],
  'سایر': [
    'ساعت هوشمند',
    'هارد و فلش مموری',
    'باکس و اکتیویشن',
    'سایر'
  ]
};

interface Province {
  _id: string;
  name: string;
  nameEn: string;
  code: string;
}

interface District {
  _id: string;
  name: string;
  provinceId: string;
}

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [inventory, setInventory] = useState<{ [key: string]: number }>({});
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subCategory: '',
    province: '',
    provinceId: '',
    district: '',
    address: ''
  });

  // دریافت ولایت‌ها
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    fetch(`${apiUrl}/api/locations/provinces`)
      .then(res => res.json())
      .then(data => {
        setProvinces(data);
        // مقداردهی اولیه موجودی برای همه ولایت‌ها
        const initialInventory: { [key: string]: number } = {};
        data.forEach((province: Province) => {
          initialInventory[province.name] = 0;
        });
        setInventory(initialInventory);
      })
      .catch(err => console.error('Error fetching provinces:', err));
  }, []);

  // دریافت ولسوالی‌ها بر اساس ولایت انتخاب شده
  useEffect(() => {
    if (selectedProvince) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
      
      fetch(`${apiUrl}/api/locations/districts/${selectedProvince}`)
        .then(res => res.json())
        .then(data => setDistricts(data))
        .catch(err => console.error('Error fetching districts:', err));
    } else {
      setDistricts([]);
    }
  }, [selectedProvince]);

  const handleInventoryChange = (provinceName: string, value: number) => {
    setInventory({
      ...inventory,
      [provinceName]: value
    });
  };

  const handleMainCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedMainCategory(value);
    setFormData({
      ...formData,
      category: value,
      subCategory: ''
    });
  };

  const handleProvinceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value;
    const province = provinces.find(p => p._id === provinceId);
    setSelectedProvince(provinceId);
    setFormData({
      ...formData,
      province: province?.name || '',
      provinceId: provinceId,
      district: ''
    });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    const district = districts.find(d => d._id === districtId);
    setFormData({
      ...formData,
      district: district?.name || ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    try {
      // 1. ایجاد محصول
      const productRes = await fetch(`${apiUrl}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseInt(formData.price),
          category: formData.category,
          subCategory: formData.subCategory || undefined,
          sellerProvince: formData.province,
          sellerDistrict: formData.district,
          sellerAddress: formData.address
        })
      });

      if (!productRes.ok) {
        const error = await productRes.json();
        throw new Error(error.message || 'خطا در ایجاد محصول');
      }

      const product = await productRes.json();

      // 2. اضافه کردن موجودی برای هر ولایت
      for (const province of provinces) {
        const quantity = inventory[province.name] || 0;
        if (quantity > 0) {
          await fetch(`${apiUrl}/api/products/inventory/${product._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              province: province.name,
              quantity: quantity
            })
          });
        }
      }
      
      alert('محصول با موفقیت اضافه شد');
      router.push('/admin/products');
    } catch (err) {
      console.error('Error:', err);
      alert(err instanceof Error ? err.message : 'خطا در افزودن محصول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8 max-w-4xl mx-auto">
      <div className="mb-4">
        <Link href="/admin/products" className="text-blue-600">← بازگشت به لیست محصولات</Link>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">➕ افزودن محصول جدید</h1>
        
        <form onSubmit={handleSubmit}>
          {/* اطلاعات پایه */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="font-bold text-lg mb-4">📝 اطلاعات پایه</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">نام محصول *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">توضیحات *</label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">قیمت (افغانی) *</label>
              <input
                type="number"
                name="price"
                required
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">دسته‌بندی اصلی *</label>
              <select
                required
                value={formData.category}
                onChange={handleMainCategoryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">انتخاب دسته‌بندی</option>
                {mainCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {selectedMainCategory && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">زیرمجموعه *</label>
                <select
                  name="subCategory"
                  required
                  value={formData.subCategory}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">انتخاب زیرمجموعه</option>
                  {subCategoriesByMain[selectedMainCategory]?.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* موجودی انبار بر اساس ولایت */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="font-bold text-lg mb-4">📦 موجودی انبار بر اساس ولایت</h2>
            <p className="text-sm text-gray-500 mb-4">تعداد موجودی هر ولایت را وارد کنید (اگر موجود نیست 0 بگذارید)</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
              {provinces.map(province => (
                <div key={province._id}>
                  <label className="block text-sm font-medium mb-1">{province.name}</label>
                  <input
                    type="number"
                    value={inventory[province.name] || 0}
                    onChange={(e) => handleInventoryChange(province.name, parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg"
                    min="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* اطلاعات فروشنده */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="font-bold text-lg mb-4">🏢 اطلاعات فروشنده</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">ولایت *</label>
              <select
                value={selectedProvince}
                onChange={handleProvinceSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">انتخاب ولایت</option>
                {provinces.map(province => (
                  <option key={province._id} value={province._id}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedProvince && districts.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">ولسوالی *</label>
                <select
                  value={formData.district}
                  onChange={handleDistrictChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">انتخاب ولسوالی</option>
                  {districts.map(district => (
                    <option key={district._id} value={district._id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">آدرس دقیق *</label>
              <textarea
                name="address"
                required
                rows={2}
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="خیابان، کوچه، پلاک..."
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'در حال ذخیره...' : '💾 ذخیره محصول'}
          </button>
        </form>
      </div>
    </div>
  );
}