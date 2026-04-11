'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    province: '',
    notes: ''
  });

  // اطلاعات بانکی و صرافی
  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    referenceNumber: '',
    senderName: ''
  });

  const [exchangeInfo, setExchangeInfo] = useState({
    exchangeName: '',
    hawaladariNumber: '',
    senderName: ''
  });

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = customerInfo.province === 'کابل' ? 50000 : 100000;
  const total = totalPrice + deliveryFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBankInfo({
      ...bankInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleExchangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExchangeInfo({
      ...exchangeInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('لطفاً ابتدا وارد شوید');
      router.push('/auth/login?redirect=/checkout');
      return;
    }

    if (cart.length === 0) {
      setError('سبد خرید خالی است');
      setLoading(false);
      return;
    }

    // اعتبارسنجی بر اساس روش پرداخت
    if (paymentMethod === 'card_to_card') {
      if (!bankInfo.bankName || !bankInfo.referenceNumber || !bankInfo.senderName) {
        setError('لطفاً اطلاعات بانکی را کامل کنید');
        setLoading(false);
        return;
      }
    }

    if (paymentMethod === 'exchange_hawala') {
      if (!exchangeInfo.exchangeName || !exchangeInfo.hawaladariNumber || !exchangeInfo.senderName) {
        setError('لطفاً اطلاعات حواله صرافی را کامل کنید');
        setLoading(false);
        return;
      }
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';

    const orderData = {
      items: cart.map(item => ({
        productId: item._id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal: totalPrice,
      deliveryFee: deliveryFee,
      totalAmount: total,
      paymentMethod: paymentMethod,
      customerInfo: customerInfo,
      bankInfo: paymentMethod === 'card_to_card' ? bankInfo : undefined,
      exchangeInfo: paymentMethod === 'exchange_hawala' ? exchangeInfo : undefined
    };

    try {
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem('cart');
        
        if (paymentMethod === 'cash_on_delivery') {
          router.push(`/checkout/success?orderId=${data._id}`);
        } else {
          router.push(`/checkout/upload-payment?orderId=${data._id}`);
        }
      } else {
        setError(data.message || 'خطا در ثبت سفارش');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container-custom py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">سبد خرید خالی است</h1>
        <Link href="/products" className="bg-blue-600 text-white px-6 py-2 rounded-lg">بازگشت به فروشگاه</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold mb-6">📝 تکمیل سفارش</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* فرم اطلاعات */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-bold text-lg mb-4">اطلاعات دریافت کننده</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">نام کامل *</label>
              <input
                type="text"
                name="name"
                required
                value={customerInfo.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">ایمیل *</label>
              <input
                type="email"
                name="email"
                required
                value={customerInfo.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">شماره تماس *</label>
              <input
                type="tel"
                name="phone"
                required
                value={customerInfo.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">ولایت *</label>
              <select
                name="province"
                required
                value={customerInfo.province}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">انتخاب ولایت</option>
                <option value="کابل">کابل</option>
                <option value="هرات">هرات</option>
                <option value="مزارشریف">مزارشریف</option>
                <option value="قندهار">قندهار</option>
                <option value="بلخ">بلخ</option>
                <option value="ننگرهار">ننگرهار</option>
                <option value="بامیان">بامیان</option>
                <option value="دیگر">دیگر</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">آدرس دقیق *</label>
              <textarea
                name="address"
                required
                rows={3}
                value={customerInfo.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">توضیحات (اختیاری)</label>
              <textarea
                name="notes"
                rows={2}
                value={customerInfo.notes}
                onChange={handleChange}
                placeholder="هر نکته‌ای درباره سفارش خود دارید بنویسید..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* روش پرداخت */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">روش پرداخت</h3>
              
              {/* پرداخت نقدی هنگام تحویل */}
              <label className={`flex items-start p-3 border rounded-lg mb-3 cursor-pointer ${paymentMethod === 'cash_on_delivery' ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash_on_delivery"
                  checked={paymentMethod === 'cash_on_delivery'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 ml-3"
                />
                <div>
                  <div className="font-bold">💰 پرداخت نقدی هنگام تحویل</div>
                  <div className="text-sm text-gray-500">پرداخت درب منزل هنگام دریافت سفارش</div>
                </div>
              </label>

              {/* حواله بانکی (کارت به کارت) */}
              <label className={`flex items-start p-3 border rounded-lg mb-3 cursor-pointer ${paymentMethod === 'card_to_card' ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card_to_card"
                  checked={paymentMethod === 'card_to_card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 ml-3"
                />
                <div>
                  <div className="font-bold">🏦 حواله بانکی (کارت به کارت)</div>
                  <div className="text-sm text-gray-500">واریز به حساب بانکی و ارسال رسید</div>
                </div>
              </label>

              {/* حواله صرافی */}
              <label className={`flex items-start p-3 border rounded-lg cursor-pointer ${paymentMethod === 'exchange_hawala' ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="exchange_hawala"
                  checked={paymentMethod === 'exchange_hawala'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 ml-3"
                />
                <div>
                  <div className="font-bold">💱 حواله صرافی</div>
                  <div className="text-sm text-gray-500">حواله از طریق صرافی‌های معتبر</div>
                </div>
              </label>
            </div>

            {/* فرم حواله بانکی */}
            {paymentMethod === 'card_to_card' && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold mb-3">اطلاعات حواله بانکی</h3>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">نام بانک *</label>
                  <input
                    type="text"
                    name="bankName"
                    required
                    value={bankInfo.bankName}
                    onChange={handleBankChange}
                    placeholder="مثال: بانک ملی افغانستان"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">شماره پیگیری/مرجع *</label>
                  <input
                    type="text"
                    name="referenceNumber"
                    required
                    value={bankInfo.referenceNumber}
                    onChange={handleBankChange}
                    placeholder="شماره پیگیری واریز"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">نام واریز کننده *</label>
                  <input
                    type="text"
                    name="senderName"
                    required
                    value={bankInfo.senderName}
                    onChange={handleBankChange}
                    placeholder="نام کامل واریز کننده"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="text-sm text-gray-600 mt-2 p-2 bg-white rounded">
                  <p className="font-bold">اطلاعات حساب بانکی فروشنده:</p>
                  <p>بانک: بانک ملی افغانستان</p>
                  <p>شماره حساب: ۱۲۳۴۵۶۷۸۹۰</p>
                  <p>شماره کارت: ۶۲۱۹-۸۶۱۰-۱۲۳۴-۵۶۷۸</p>
                  <p>به نام: فروشگاه افغانستان</p>
                </div>
              </div>
            )}

            {/* فرم حواله صرافی */}
            {paymentMethod === 'exchange_hawala' && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-bold mb-3">اطلاعات حواله صرافی</h3>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">نام صرافی *</label>
                  <input
                    type="text"
                    name="exchangeName"
                    required
                    value={exchangeInfo.exchangeName}
                    onChange={handleExchangeChange}
                    placeholder="مثال: صرافی حبیب"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">شماره حواله/مرجع *</label>
                  <input
                    type="text"
                    name="hawaladariNumber"
                    required
                    value={exchangeInfo.hawaladariNumber}
                    onChange={handleExchangeChange}
                    placeholder="شماره حواله صرافی"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">نام فرستنده *</label>
                  <input
                    type="text"
                    name="senderName"
                    required
                    value={exchangeInfo.senderName}
                    onChange={handleExchangeChange}
                    placeholder="نام کامل فرستنده"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}
          </form>
        </div>
        
        {/* خلاصه سفارش */}
        <div className="bg-white rounded-lg shadow p-6 h-fit">
          <h2 className="font-bold text-lg mb-4">خلاصه سفارش</h2>
          {cart.map(item => (
            <div key={item._id} className="flex justify-between mb-2 text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span>{(item.price * item.quantity).toLocaleString()} افغانی</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between">
              <span>جمع محصولات:</span>
              <span>{totalPrice.toLocaleString()} افغانی</span>
            </div>
            <div className="flex justify-between">
              <span>هزینه ارسال:</span>
              <span>{deliveryFee.toLocaleString()} افغانی</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
              <span>جمع کل:</span>
              <span className="text-green-600">{total.toLocaleString()} افغانی</span>
            </div>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition mt-4 disabled:opacity-50"
          >
            {loading ? 'در حال ثبت سفارش...' : '✅ ثبت نهایی سفارش'}
          </button>
        </div>
      </div>
    </div>
  );
}