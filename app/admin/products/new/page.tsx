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

// ==================== ولایات افغانستان ====================
const provinces = [
  'کابل', 'کاپیسا', 'پروان', 'میدان وردک', 'لوگر', 'بغلان', 'سمنگان', 'بلخ',
  'جوزجان', 'فاریاب', 'سرپل', 'قندوز', 'تخار', 'بدخشان', 'نورستان', 'کنر',
  'لغمان', 'ننگرهار', 'کندهار', 'زابل', 'ارزگان', 'غزنی', 'پکتیا', 'پکتیکا',
  'خوست', 'بامیان', 'دایکندی', 'غور', 'هرات', 'بادغیس', 'فراه', 'نیمروز',
  'هلمند', 'پنجشیر'
];

// ==================== ولسوالی‌های افغانستان ====================
const districtsByProvince: { [key: string]: string[] } = {
  'کابل': ['کابل مرکز', 'پغمان', 'چهار آسیاب', 'ده سبز', 'کلکان', 'قلعه نادر', 'موسهی', 'میربچه کوت', 'استاليف', 'گلدره', 'خاک جبار', 'فرزه', 'شکردره', 'بگرامی'],
  'هرات': ['هرات مرکز', 'انجیل', 'گذره', 'کرخ', 'کشک کهنه', 'کشک رباط سنگی', 'ادرسکن', 'زنده جان', 'چشت شریف', 'فارسی', 'غوریان', 'اوبه', 'پشتون زرغون'],
  'مزارشریف': ['مزارشریف مرکز', 'نهر شاهی', 'دهدادی', 'چمتال', 'چارکنت', 'شولگره', 'زاری', 'کشم', 'بلخ'],
  'قندهار': ['قندهار مرکز', 'ارغستان', 'ارغنداب', 'دامان', 'ژری', 'خاکریز', 'معروف', 'میوند', 'نش', 'پنجوایی', 'شاه ولی کوت', 'سپین بولدک', 'تخته پل'],
  'ننگرهار': ['جلال آباد مرکز', 'بهسود', 'چپر هار', 'دره نور', 'خوگیانی', 'کوز کنر', 'لال پور', 'مومند دره', 'نازیان', 'پچیر او اگام', 'رودات', 'شیرزاد', 'سرخرود', 'هسکه مینه'],
  'غزنی': ['غزنی مرکز', 'اب بند', 'اجرستان', 'اندر', 'بگرامی', 'ده یک', 'جاغوری', 'خواجه عمری', 'مالستان', 'مقر', 'ناور', 'نانی', 'رزان', 'زنه خان', 'گلان', 'گیرو'],
  'بامیان': ['بامیان مرکز', 'پنجاب', 'کمرد', 'سایگان', 'شبر', 'ورس', 'یکاولنگ', 'کهمرد'],
  'بلخ': ['مزارشریف مرکز', 'چهاربولک', 'چمتال', 'چارکنت', 'چاربولک', 'دهدادی', 'کلدار', 'خلم', 'کشنده', 'مارمل', 'نهر شاهی', 'شولگره', 'زاری', 'بلخ'],
  'بدخشان': ['فیض آباد مرکز', 'ارغنج خواه', 'ارگو', 'بهارک', 'درایم', 'فیض آباد', 'اشکاشم', 'جرم', 'خاش', 'خواهان', 'کشم', 'کهان', 'کران و منجان', 'راغستان', 'شهر بزرگ', 'شفنان', 'شکی', 'شهدا', 'تگاب', 'تاشکان', 'واخان', 'وردوج', 'یفتل پایین', 'زون', 'مایمی'],
  'پنجشیر': ['بازارک مرکز', 'انابه', 'پریان', 'رخه', 'شوتل', 'عبدالله خیل', 'دره', 'هساول'],
  'کندهار': ['کندهار مرکز', 'ارغستان', 'ارغنداب', 'دامان', 'ژری', 'خاکریز', 'معروف', 'میوند', 'نش', 'پنجوایی', 'شاه ولی کوت', 'سپین بولدک', 'تخته پل'],
  'هرات': ['هرات مرکز', 'انجیل', 'گذره', 'کرخ', 'کشک کهنه', 'کشک رباط سنگی', 'ادرسکن', 'زنده جان', 'چشت شریف', 'فارسی', 'غوریان', 'اوبه', 'پشتون زرغون'],
  'کاپیسا': ['کاپیسا مرکز', 'تگاب', 'حصه اول کوهستان', 'حصه دوم کوهستان', 'نijrab'],
  'پروان': ['چاریکار مرکز', 'شیخ علی', 'سیدخیل', 'سلف', 'گروان', 'شوتو', 'جبل سراج', 'بگرام', 'کهنه صافی', 'سرخ پارسا'],
  'میدان وردک': ['میدان شهر مرکز', 'جلریز', 'چک', 'حصه اول بهسود', 'حصه دوم بهسود', 'نرخ', 'سیدآباد', 'جغتو'],
  'لوگر': ['پل علم مرکز', 'برکی برک', 'خروار', 'محمد آغه', 'خوشی', 'ازره'],
  'بغلان': ['پل خمری مرکز', 'بغلان مرکز', 'خنجان', 'ده صلاح', 'نهرین', 'برکه', 'گوزرگه نور', 'تاله و برفک', 'پل حصار', 'دوشی', 'بغلان جدید', 'فرنگ و غارو'],
  'سمنگان': ['ایبک مرکز', 'حضرت سلطان', 'خرم و سارباغ', 'دره صوف بالا', 'دره صوف پایین', 'روی دوآب', 'فیروز نخچیر'],
  'جوزجان': ['شبرغان مرکز', 'منگه جک', 'خماب', 'قرقین', 'مردیان', 'آقچه', 'درزاب'],
  'فاریاب': ['میمنه مرکز', 'المار', 'اندخوی', 'خان چارباغ', 'قرغان', 'کوهستان', 'گرزیوان', 'پشتون کوت', 'شیرین تگاب', 'دولت آباد', 'بلچراغ', 'قرم قلعه'],
  'سرپل': ['سرپل مرکز', 'بلخاب', 'سوزمه قلعه', 'کوهستانات', 'سانچارک', 'گوشتی'],
  'قندوز': ['قندوز مرکز', 'چاه آب', 'خان آباد', 'امام صاحب', 'علی آباد', 'دشت ارچی', 'قلعه ذال'],
  'تخار': ['تالقان مرکز', 'چاه آب', 'خواجه بهاالدین', 'خواجه غار', 'درقد', 'ورسج', 'اشکمش', 'فرخار', 'کلافگان', 'بنگری', 'نمک آب', 'رستاق', 'یفتل پایین', 'یفتل بالا'],
  'نورستان': ['پرون مرکز', 'وایگل', 'کامدیش', 'دوآب', 'نورستان', 'مندول'],
  'کنر': ['اسدآباد مرکز', 'مره وری', 'نرنگ', 'دره پیچ', 'سرکانی', 'چپه دره', 'چوکی', 'شل تن', 'خاص کنر', 'ناری', 'واپه'],
  'لغمان': ['مهترلام مرکز', 'قرغه ای', 'علی سنگ', 'دولت شاه', 'چهارباغ'],
  'زابل': ['قلات مرکز', 'شهر صفا', 'شینکی', 'میزان', 'کجران', 'ترنک و جلدک', 'دای چوپان', 'بابکرک', 'ارغنداب'],
  'ارزگان': ['ترین کوت مرکز', 'چوره', 'خاص ارزگان', 'دهراوود', 'گیرو', 'خدر', 'نیش', 'شهید حساس'],
  'پکتیا': ['گردیز مرکز', 'احمدآباد', 'لجه احمدخیل', 'روحانی بابا', 'ذدران', 'جاجی', 'سیدکرم', 'علی شیر علیا', 'حمزیه', 'جانی خیل', 'چمکنی', 'زرگران', 'شواک'],
  'پکتیکا': ['شرانه مرکز', 'ارگون', 'اورگون', 'برمل', 'جانی خیل', 'تروه', 'یوسف خیل', 'زرغون شهر', 'ملی خیل', 'نیکه', 'وازه خوا', 'سروبی', 'دله', 'گو مل', 'گومل'],
  'خوست': ['خوست مرکز', 'باک', 'تنی', 'تیریزایی', 'جانی خیل', 'سپیره', 'شمل', 'قبندر', 'ملا خیل', 'مندوزایی', 'نادرشاه کوت', 'اسماعیل خیل', 'لک کوت', 'گو لی', 'یعقوبی'],
  'دایکندی': ['نیلی مرکز', 'اشترلی', 'پاتو', 'خادر', 'کجران', 'میرامور', 'شهرستانی', 'سنگ تخت', 'گیزاب', 'هیدو'],
  'غور': ['چغچران مرکز', 'شهرک', 'دولت یار', 'دوله نه', 'پسابند', 'ساغر', 'لعل و سر جنگل', 'تایور', 'چهارسده'],
  'بادغیس': ['قلعه نو مرکز', 'بالامرغاب', 'غورماچ', 'مقر', 'جوند', 'آب کمری'],
  'فراه': ['فراه مرکز', 'پشت رود', 'پر چمن', 'بکوا', 'لاش و جوین', 'اناردره', 'شیب کوه', 'قلعه کاه'],
  'نیمروز': ['زرنج مرکز', 'چهاربرجک', 'خاشرود', 'کنگ', 'دلارام', 'سرسنگ'],
  'هلمند': ['لشکرگاه مرکز', 'نوزاد', 'باغران', 'گرمسیر', 'ناوه بارکزئی', 'سنگین', 'نادعلی', 'دیشو', 'نهرسراج', 'موسی قلعه', 'واشیر', 'کجکی']
};

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [inventory, setInventory] = useState<{ [key: string]: number }>({});
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subCategory: '',
    province: '',
    district: '',
    address: ''
  });

  // مقداردهی اولیه موجودی برای همه ولایات
  useEffect(() => {
    const initialInventory: { [key: string]: number } = {};
    provinces.forEach(province => {
      initialInventory[province] = 0;
    });
    setInventory(initialInventory);
  }, []);

  const handleInventoryChange = (province: string, value: number) => {
    setInventory({
      ...inventory,
      [province]: value
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
    const value = e.target.value;
    setSelectedProvince(value);
    setFormData({
      ...formData,
      province: value,
      district: ''
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
          subCategory: formData.subCategory || undefined
        })
      });

      if (!productRes.ok) {
        const error = await productRes.json();
        throw new Error(error.message || 'خطا در ایجاد محصول');
      }

      const product = await productRes.json();

      // 2. اضافه کردن موجودی برای هر ولایت
      for (const province of provinces) {
        const quantity = inventory[province] || 0;
        if (quantity > 0) {
          await fetch(`${apiUrl}/api/products/inventory/${product._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              province: province,
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
                <div key={province}>
                  <label className="block text-sm font-medium mb-1">{province}</label>
                  <input
                    type="number"
                    value={inventory[province] || 0}
                    onChange={(e) => handleInventoryChange(province, parseInt(e.target.value) || 0)}
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
                name="province"
                required
                value={formData.province}
                onChange={handleProvinceSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">انتخاب ولایت</option>
                {provinces.map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>

            {selectedProvince && districtsByProvince[selectedProvince] && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">ولسوالی *</label>
                <select
                  name="district"
                  required
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">انتخاب ولسوالی</option>
                  {districtsByProvince[selectedProvince].map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
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