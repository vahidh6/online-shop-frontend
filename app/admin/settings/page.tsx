'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Settings {
  siteName: string;
  siteDescription: string;
  siteLogo: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  facebook: string;
  instagram: string;
  telegram: string;
  whatsapp: string;
  deliveryFeeKabul: number;
  deliveryFeeOther: number;
  freeDeliveryThreshold: number;
  primaryColor: string;
  secondaryColor: string;
  footerText: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  isMaintenance: boolean;
  maintenanceMessage: string;
}

export default function AdminSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    siteName: '',
    siteDescription: '',
    siteLogo: '',
    phone: '',
    email: '',
    address: '',
    workingHours: '',
    facebook: '',
    instagram: '',
    telegram: '',
    whatsapp: '',
    deliveryFeeKabul: 0,
    deliveryFeeOther: 0,
    freeDeliveryThreshold: 0,
    primaryColor: '#e53e3e',
    secondaryColor: '#3182ce',
    footerText: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    isMaintenance: false,
    maintenanceMessage: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    try {
      const res = await fetch(`${apiUrl}/api/settings`);
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setSettings({
      ...settings,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';

    try {
      const res = await fetch(`${apiUrl}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        alert('تنظیمات با موفقیت ذخیره شد');
      } else {
        alert('خطا در ذخیره تنظیمات');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('خطا در ارتباط با سرور');
    } finally {
      setSaving(false);
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
    <div className="container-custom py-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">⚙️ تنظیمات سایت</h1>
        <Link href="/admin" className="text-gray-600">← بازگشت به داشبورد</Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        {/* اطلاعات پایه */}
        <div className="mb-6 pb-4 border-b">
          <h2 className="text-lg font-bold mb-4">📋 اطلاعات پایه</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">نام سایت *</label>
              <input
                type="text"
                name="siteName"
                required
                value={settings.siteName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">توضیحات سایت</label>
              <input
                type="text"
                name="siteDescription"
                value={settings.siteDescription}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* اطلاعات تماس */}
        <div className="mb-6 pb-4 border-b">
          <h2 className="text-lg font-bold mb-4">📞 اطلاعات تماس</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">شماره تماس</label>
              <input
                type="text"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ایمیل</label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">آدرس</label>
              <input
                type="text"
                name="address"
                value={settings.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">ساعت کاری</label>
              <input
                type="text"
                name="workingHours"
                value={settings.workingHours}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* شبکه‌های اجتماعی */}
        <div className="mb-6 pb-4 border-b">
          <h2 className="text-lg font-bold mb-4">🌐 شبکه‌های اجتماعی</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">فیسبوک</label>
              <input
                type="text"
                name="facebook"
                value={settings.facebook}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">اینستاگرام</label>
              <input
                type="text"
                name="instagram"
                value={settings.instagram}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">تلگرام</label>
              <input
                type="text"
                name="telegram"
                value={settings.telegram}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://t.me/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">واتساپ</label>
              <input
                type="text"
                name="whatsapp"
                value={settings.whatsapp}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://wa.me/..."
              />
            </div>
          </div>
        </div>

        {/* تنظیمات ارسال */}
        <div className="mb-6 pb-4 border-b">
          <h2 className="text-lg font-bold mb-4">🚚 تنظیمات ارسال</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">هزینه ارسال کابل</label>
              <input
                type="number"
                name="deliveryFeeKabul"
                value={settings.deliveryFeeKabul}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">هزینه ارسال سایر ولایات</label>
              <input
                type="number"
                name="deliveryFeeOther"
                value={settings.deliveryFeeOther}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">آستانه ارسال رایگان</label>
              <input
                type="number"
                name="freeDeliveryThreshold"
                value={settings.freeDeliveryThreshold}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* تنظیمات ظاهری */}
        <div className="mb-6 pb-4 border-b">
          <h2 className="text-lg font-bold mb-4">🎨 تنظیمات ظاهری</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">رنگ اصلی</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="primaryColor"
                  value={settings.primaryColor}
                  onChange={handleChange}
                  className="w-12 h-10 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  name="primaryColor"
                  value={settings.primaryColor}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">رنگ ثانویه</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="secondaryColor"
                  value={settings.secondaryColor}
                  onChange={handleChange}
                  className="w-12 h-10 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  name="secondaryColor"
                  value={settings.secondaryColor}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">متن فوتر</label>
              <input
                type="text"
                name="footerText"
                value={settings.footerText}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* تنظیمات SEO */}
        <div className="mb-6 pb-4 border-b">
          <h2 className="text-lg font-bold mb-4">🔍 تنظیمات SEO</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">عنوان متا (Meta Title)</label>
              <input
                type="text"
                name="metaTitle"
                value={settings.metaTitle}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">توضیحات متا (Meta Description)</label>
              <textarea
                name="metaDescription"
                rows={2}
                value={settings.metaDescription}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">کلمات کلیدی (Meta Keywords)</label>
              <input
                type="text"
                name="metaKeywords"
                value={settings.metaKeywords}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="واژه1, واژه2, واژه3"
              />
            </div>
          </div>
        </div>

        {/* حالت تعمیرات */}
        <div className="mb-6 pb-4 border-b">
          <h2 className="text-lg font-bold mb-4">🔧 حالت تعمیرات</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isMaintenance"
                checked={settings.isMaintenance}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <span>فعال کردن حالت تعمیرات</span>
            </label>
            {settings.isMaintenance && (
              <div>
                <label className="block text-sm font-medium mb-1">پیام تعمیرات</label>
                <textarea
                  name="maintenanceMessage"
                  rows={2}
                  value={settings.maintenanceMessage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {saving ? 'در حال ذخیره...' : '💾 ذخیره تنظیمات'}
          </button>
        </div>
      </form>
    </div>
  );
}