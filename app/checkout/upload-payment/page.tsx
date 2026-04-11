'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function UploadPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    referenceNumber: '',
    bankName: '',
    senderName: '',
    amount: ''
  });

  useEffect(() => {
    if (!orderId) {
      router.push('/');
    }
  }, [orderId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';

    try {
      const response = await fetch(`${apiUrl}/api/orders/${orderId}/upload-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentDetails: {
            referenceNumber: paymentDetails.referenceNumber,
            bankName: paymentDetails.bankName,
            senderName: paymentDetails.senderName,
            amount: parseInt(paymentDetails.amount)
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ رسید پرداخت با موفقیت ارسال شد');
        setTimeout(() => {
          router.push(`/checkout/success?orderId=${orderId}`);
        }, 2000);
      } else {
        setMessage(data.message || '❌ خطا در آپلود رسید پرداخت');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">💰 آپلود رسید پرداخت</h1>
        
        {message && (
          <div className={`p-3 rounded-lg mb-4 text-center ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">شماره پیگیری/مرجع *</label>
            <input
              type="text"
              required
              value={paymentDetails.referenceNumber}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, referenceNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">نام بانک *</label>
            <input
              type="text"
              required
              value={paymentDetails.bankName}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">نام واریز کننده *</label>
            <input
              type="text"
              required
              value={paymentDetails.senderName}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, senderName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">مبلغ واریزی (افغانی) *</label>
            <input
              type="number"
              required
              value={paymentDetails.amount}
              onChange={(e) => setPaymentDetails({ ...paymentDetails, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="font-bold mb-2">💳 اطلاعات حساب بانکی فروشنده:</p>
            <p className="text-sm">بانک: بانک ملی افغانستان</p>
            <p className="text-sm">شماره حساب: ۱۲۳۴۵۶۷۸۹۰</p>
            <p className="text-sm">شماره کارت: ۶۲۱۹-۸۶۱۰-۱۲۳۴-۵۶۷۸</p>
            <p className="text-sm">به نام: فروشگاه افغانستان</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'در حال ارسال...' : '📤 ارسال رسید پرداخت'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/" className="text-gray-500">← بازگشت به فروشگاه</Link>
        </div>
      </div>
    </div>
  );
}

export default function UploadPaymentPage() {
  return (
    <Suspense fallback={<div className="text-center py-8">در حال بارگذاری...</div>}>
      <UploadPaymentContent />
    </Suspense>
  );
}