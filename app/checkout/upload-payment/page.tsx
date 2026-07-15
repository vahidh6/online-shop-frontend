// app/checkout/upload-payment/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';

interface Order {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  customerInfo: {
    name: string;
    phone: string;
    province: string;
    address: string;
  };
}

// ============ کامپوننت اصلی با Suspense ============
export default function UploadPaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <UploadPaymentContent />
    </Suspense>
  );
}

// ============ محتوای اصلی ============
function UploadPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const settings = useSettings();
  
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // ============ فرم آپلود ============
  const [formData, setFormData] = useState({
    bankName: '',
    referenceNumber: '',
    senderName: '',
    receiptImage: '',
    exchangeName: '',
    notes: ''
  });

  // ============ دریافت سفارش ============
  useEffect(() => {
    if (!orderId) {
      setError('شناسه سفارش یافت نشد');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login?redirect=/checkout/upload-payment');
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await api.orders.getOne(orderId, token);
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('سفارش یافت نشد');
          }
          throw new Error('خطا در دریافت اطلاعات سفارش');
        }
        
        const data = await res.json();
        setOrder(data);
        
        // پر کردن خودکار اطلاعات بانکی/صرافی بر اساس روش پرداخت
        if (data.paymentMethod === 'card_to_card') {
          setFormData(prev => ({
            ...prev,
            bankName: data.bankInfo?.bankName || '',
            referenceNumber: data.bankInfo?.referenceNumber || '',
            senderName: data.bankInfo?.senderName || ''
          }));
        } else if (data.paymentMethod === 'exchange_hawala') {
          setFormData(prev => ({
            ...prev,
            exchangeName: data.exchangeInfo?.exchangeName || '',
            referenceNumber: data.exchangeInfo?.hawaladariNumber || '',
            senderName: data.exchangeInfo?.senderName || ''
          }));
        }
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError(err.message || 'خطا در دریافت اطلاعات سفارش');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  // ============ تغییر فیلدها ============
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError(null);
  };

  // ============ ارسال فرم ============
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('لطفاً وارد شوید');
      router.push('/auth/login');
      setSubmitting(false);
      return;
    }

    if (!orderId) {
      setError('شناسه سفارش معتبر نیست');
      setSubmitting(false);
      return;
    }

    // ============ اعتبارسنجی ============
    if (order?.paymentMethod === 'card_to_card') {
      if (!formData.bankName.trim()) {
        setError('نام بانک الزامی است');
        setSubmitting(false);
        return;
      }
      if (!formData.referenceNumber.trim()) {
        setError('شماره پیگیری الزامی است');
        setSubmitting(false);
        return;
      }
      if (!formData.senderName.trim()) {
        setError('نام واریز کننده الزامی است');
        setSubmitting(false);
        return;
      }
    }

    if (order?.paymentMethod === 'exchange_hawala') {
      if (!formData.exchangeName.trim()) {
        setError('نام صرافی الزامی است');
        setSubmitting(false);
        return;
      }
      if (!formData.referenceNumber.trim()) {
        setError('شماره حواله الزامی است');
        setSubmitting(false);
        return;
      }
      if (!formData.senderName.trim()) {
        setError('نام فرستنده الزامی است');
        setSubmitting(false);
        return;
      }
    }

    try {
      const res = await api.orders.updateStatus(orderId, 'payment_uploaded', token);
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/checkout/success?orderId=${orderId}`);
        }, 2000);
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'خطا در ارسال اطلاعات پرداخت');
      }
    } catch (err) {
      console.error('Error uploading payment:', err);
      setError('خطا در ارتباط با سرور');
    } finally {
      setSubmitting(false);
    }
  };

  // ============ رندر ============
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!settings) return null;

  if (error && !order) {
    return (
      <div className="container-custom py-8 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          بازگشت به صفحه اصلی
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-custom py-8 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-4">سفارش یافت نشد</h1>
        <Link href="/" className="text-blue-600 hover:underline">
          بازگشت به صفحه اصلی
        </Link>
      </div>
    );
  }

  if (order.status !== 'pending_payment' && order.status !== 'payment_uploaded') {
    return (
      <div className="container-custom py-8 text-center">
        <div className="text-6xl mb-4">ℹ️</div>
        <h1 className="text-2xl font-bold mb-4">وضعیت سفارش قابل تغییر نیست</h1>
        <p className="text-gray-500 mb-6">
          وضعیت فعلی سفارش: {getStatusText(order.status)}
        </p>
        <Link href={`/checkout/success?orderId=${order._id}`} className="text-blue-600 hover:underline">
          مشاهده سفارش
        </Link>
      </div>
    );
  }

  if (order.paymentMethod === 'cash_on_delivery') {
    return (
      <div className="container-custom py-8 text-center">
        <div className="text-6xl mb-4">💰</div>
        <h1 className="text-2xl font-bold mb-4">پرداخت نقدی هنگام تحویل</h1>
        <p className="text-gray-500 mb-6">
          این سفارش با روش پرداخت نقدی ثبت شده است و نیازی به آپلود رسید ندارد.
        </p>
        <Link href={`/checkout/success?orderId=${order._id}`} className="text-blue-600 hover:underline">
          مشاهده سفارش
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container-custom py-8 text-center">
        <div className="bg-green-100 border border-green-400 text-green-700 p-6 rounded-lg mb-6">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2">اطلاعات پرداخت با موفقیت ارسال شد</h1>
          <p className="text-gray-600">
            در حال انتقال به صفحه سفارش...
          </p>
        </div>
      </div>
    );
  }

  const primaryColor = settings?.primaryColor || '#e53e3e';
  const isCardToCard = order.paymentMethod === 'card_to_card';
  const isExchange = order.paymentMethod === 'exchange_hawala';
  const paymentMethodName = isCardToCard ? 'حواله بانکی (کارت به کارت)' : 'حواله صرافی';

  return (
    <div className="container-custom py-8 max-w-2xl">
      {/* ============ بازگشت ============ */}
      <div className="mb-4">
        <Link href={`/checkout/success?orderId=${order._id}`} className="text-blue-600 hover:underline">
          ← بازگشت به سفارش
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-2">📤 ارسال اطلاعات پرداخت</h1>
        <p className="text-gray-500 mb-6">
          سفارش #{order.orderNumber || order._id.slice(-8).toUpperCase()} - {paymentMethodName}
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <span>❌</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ============ اطلاعات سفارش ============ */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">خلاصه سفارش</h3>
            <div className="space-y-1 text-sm">
              <p><span className="text-gray-500">تعداد اقلام:</span> {order.items.reduce((sum, i) => sum + i.quantity, 0)}</p>
              <p><span className="text-gray-500">جمع کل:</span> <span className="font-bold text-green-600">{order.totalAmount.toLocaleString()} افغانی</span></p>
              <p><span className="text-gray-500">روش پرداخت:</span> {paymentMethodName}</p>
            </div>
          </div>

          {/* ============ فرم حواله بانکی ============ */}
          {isCardToCard && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">اطلاعات حواله بانکی</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  نام بانک <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="bankName"
                  required
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="مثال: بانک ملی افغانستان"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                  style={{ 
                    '--tw-ring-color': primaryColor,
                  } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  شماره پیگیری/مرجع <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="referenceNumber"
                  required
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  placeholder="شماره پیگیری واریز"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                  style={{ 
                    '--tw-ring-color': primaryColor,
                  } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  نام واریز کننده <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="senderName"
                  required
                  value={formData.senderName}
                  onChange={handleChange}
                  placeholder="نام کامل واریز کننده"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                  style={{ 
                    '--tw-ring-color': primaryColor,
                  } as React.CSSProperties}
                />
              </div>

              <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded">
                <p className="font-bold">اطلاعات حساب بانکی فروشنده:</p>
                <p>بانک: بانک ملی افغانستان</p>
                <p>شماره حساب: ۱۲۳۴۵۶۷۸۹۰</p>
                <p>شماره کارت: ۶۲۱۹-۸۶۱۰-۱۲۳۴-۵۶۷۸</p>
                <p>به نام: فروشگاه افغانستان</p>
              </div>
            </div>
          )}

          {/* ============ فرم حواله صرافی ============ */}
          {isExchange && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">اطلاعات حواله صرافی</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  نام صرافی <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="exchangeName"
                  required
                  value={formData.exchangeName}
                  onChange={handleChange}
                  placeholder="مثال: صرافی حبیب"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                  style={{ 
                    '--tw-ring-color': primaryColor,
                  } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  شماره حواله/مرجع <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="referenceNumber"
                  required
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  placeholder="شماره حواله صرافی"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                  style={{ 
                    '--tw-ring-color': primaryColor,
                  } as React.CSSProperties}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  نام فرستنده <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="senderName"
                  required
                  value={formData.senderName}
                  onChange={handleChange}
                  placeholder="نام کامل فرستنده"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                  style={{ 
                    '--tw-ring-color': primaryColor,
                  } as React.CSSProperties}
                />
              </div>
            </div>
          )}

          {/* ============ آدرس تصویر رسید (اختیاری) ============ */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">
              آدرس تصویر رسید (اختیاری)
            </label>
            <input
              type="text"
              name="receiptImage"
              value={formData.receiptImage}
              onChange={handleChange}
              placeholder="https://example.com/receipt.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
              style={{ 
                '--tw-ring-color': primaryColor,
              } as React.CSSProperties}
            />
            <p className="text-xs text-gray-500 mt-1">
              می‌توانید آدرس اینترنتی تصویر رسید را وارد کنید
            </p>
          </div>

          {/* ============ توضیحات ============ */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">
              توضیحات (اختیاری)
            </label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="هر نکته‌ای درباره پرداخت خود دارید بنویسید..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
              style={{ 
                '--tw-ring-color': primaryColor,
              } as React.CSSProperties}
            />
          </div>

          {/* ============ دکمه‌ها ============ */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 text-white py-2 rounded-lg transition disabled:opacity-50 hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              {submitting ? '⏳ در حال ارسال...' : '📤 ارسال اطلاعات پرداخت'}
            </button>
            <Link
              href={`/checkout/success?orderId=${order._id}`}
              className="flex-1 text-center bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              انصراف
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============ تابع کمکی وضعیت ============
function getStatusText(status: string) {
  const statusMap: { [key: string]: string } = {
    pending_payment: 'در انتظار پرداخت',
    payment_uploaded: 'رسید ارسال شده',
    payment_verified: 'پرداخت تایید شده',
    processing: 'در حال پردازش',
    shipped: 'ارسال شده',
    delivered: 'تحویل داده شده',
    cancelled: 'لغو شده'
  };
  return statusMap[status] || status;
}