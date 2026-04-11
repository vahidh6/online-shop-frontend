'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    province: '',
    city: '',
    address: ''
  });

  const provinces = ['کابل', 'هرات', 'مزارشریف', 'قندهار', 'بلخ', 'ننگرهار', 'بامیان', 'دیگر'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('رمز عبور و تکرار آن مطابقت ندارند');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
      
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          province: formData.province,
          city: formData.city,
          address: formData.address,
          role: 'customer'
        })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert('ثبت نام با موفقیت انجام شد!');
        router.push('/');
      } else {
        setError(data.message || 'خطا در ثبت نام');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">📝 ثبت نام</h1>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="text"
              name="name"
              placeholder="نام کامل"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="mb-3">
            <input
              type="email"
              name="email"
              placeholder="ایمیل"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="mb-3">
            <input
              type="tel"
              name="phone"
              placeholder="شماره تماس"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="mb-3">
            <select
              name="province"
              required
              value={formData.province}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">انتخاب ولایت</option>
              {provinces.map(prov => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <input
              type="text"
              name="city"
              placeholder="شهر/ولسوالی"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="mb-3">
            <textarea
              name="address"
              placeholder="آدرس دقیق"
              required
              rows={2}
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              name="password"
              placeholder="رمز عبور (حداقل ۶ کاراکتر)"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              name="confirmPassword"
              placeholder="تکرار رمز عبور"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? 'در حال ثبت نام...' : 'ثبت نام'}
          </button>
        </form>
        
        <div className="text-center mt-4">
          <Link href="/auth/login" className="text-blue-600">قبلاً ثبت نام کرده‌اید؟ وارد شوید</Link>
        </div>
      </div>
    </div>
  );
}