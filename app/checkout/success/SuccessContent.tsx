'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    const token = localStorage.getItem('token');
    
    fetch(`${apiUrl}/api/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setOrder(data))
      .catch(err => console.error('Error:', err));
  }, [orderId, router]);

  return (
    <div className="container-custom py-8 text-center">
      <div className="bg-green-100 text-green-800 p-8 rounded-lg mb-6">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-2">سفارش شما با موفقیت ثبت شد!</h1>
        <p className="mb-4">شماره سفارش: <strong>{order?._id?.slice(-8)}</strong></p>
        <p>همکاران ما به زودی با شما تماس می‌گیرند.</p>
      </div>
      
      <div className="flex gap-4 justify-center">
        <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg">
          بازگشت به فروشگاه
        </Link>
        <Link href="/orders" className="bg-gray-600 text-white px-6 py-2 rounded-lg">
          مشاهده سفارشات
        </Link>
      </div>
    </div>
  );
}