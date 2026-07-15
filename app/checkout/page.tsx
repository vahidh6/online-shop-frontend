// app/checkout/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import { PROVINCES } from '@/services/constants';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

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

export default function CheckoutPage() {
  const router = useRouter();
  const settings = useSettings();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // ============ اطلاعات مکان ============
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  
  // ============ روش پرداخت ============
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  
  // ============ اطلاعات مشتری ============
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    province: '',
    provinceId: '',
    district: '',
    address: '',
    notes: ''
  });

  // ============ اطلاعات بانکی و صرافی ============
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

  // ============ دریافت ولایت‌ها ============
  useEffect(() => {
    api.locations.getProvinces()
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(err => console.error('Error fetching provinces:', err));
  }, []);

  // ============ دریافت ولسوالی‌ها ============
  useEffect(() => {
    if (selectedProvinceId) {
      api.locations.getDistricts(selectedProvinceId)
        .then(res => res.json())
        .then(data => setDistricts(data))
        .catch(err => console.error('Error fetching districts:', err));
    } else {
      setDistricts([]);
    }
  }, [selectedProvinceId]);

  // ============ دریافت سبد خرید ============
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        const formattedCart = parsedCart.map((item: any) => ({
          id: item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }));
        setCart(formattedCart);
      } catch (e) {
        console.error('Error parsing cart:', e);
        setCart([]);
      }
    }
  }, []);

  // ============ محاسبه قیمت‌ها ============
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const deliveryFee = customerInfo.province === 'کابل' 
    ? (settings?.deliveryFeeKabul || 50000) 
    : (settings?.deliveryFeeOther || 100000);
  
  const isFreeDelivery = settings?.freeDeliveryThreshold && totalPrice >= settings.freeDeliveryThreshold;
  const finalDeliveryFee = isFreeDelivery ? 0 : deliveryFee;
  const total = totalPrice + finalDeliveryFee;

  // ============ تغییر ولایت ============
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value;
    const province = provinces.find(p => p._id === provinceId);
    setSelectedProvinceId(provinceId);
    setCustomerInfo({
      ...customerInfo,
      province: province?.name || '',
      provinceId: provinceId,
      district: ''
    });
  };

  // ============ تغییر ولسوالی ============
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    const district = districts.find(d => d._id === districtId);
    setCustomerInfo({
      ...customerInfo,
      district: district?.name || ''
    });
  };

  // ============ تغییر فیلدها ============
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  // ============ ثبت سفارش ============
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('لطفاً ابتدا وارد شوید');
      router.push('/auth/login?redirect=/checkout');
      setLoading(false);
      return;
    }

    if (cart.length === 0) {
      setError('سبد خرید خالی است');
      setLoading(false);
      return;
    }

    // ============ اعتبارسنجی اطلاعات مشتری ============
    if (!customerInfo.name.trim()) {
      setError('نام کامل الزامی است');
      setLoading(false);
      return;
    }

    if (!customerInfo.email.trim()) {
      setError('ایمیل الزامی است');
      setLoading(false);
      return;
    }

    if (!customerInfo.phone.trim()) {
      setError('شماره تماس الزامی است');
      setLoading(false);
      return;
    }

    if (!customerInfo.province) {
      setError('ولایت الزامی است');
      setLoading(false);
      return;
    }

    if (!customerInfo.address.trim()) {
      setError('آدرس دقیق الزامی است');
      setLoading(false);
      return;
    }

    // ============ اعتبارسنجی روش پرداخت ============
    if (paymentMethod === 'card_to_card') {
      if (!bankInfo.bankName.trim() || !bankInfo.referenceNumber.trim() || !bankInfo.senderName.trim()) {
        setError('لطفاً اطلاعات بانکی را کامل کنید');
        setLoading(false);
        return;
      }
    }

    if (paymentMethod === 'exchange_hawala') {
      if (!exchangeInfo.exchangeName.trim() || !exchangeInfo.hawaladariNumber.trim() || !exchangeInfo.senderName.trim()) {
        setError('لطفاً اطلاعات حواله صرافی را کامل کنید');
        setLoading(false);
        return;
      }
    }

    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: totalPrice,
        deliveryFee: finalDeliveryFee,
        totalAmount: total,
        paymentMethod: paymentMethod,
        customerInfo: {
          ...customerInfo,
          province: customerInfo.province,
          provinceId: customerInfo.provinceId,
          district: customerInfo.district
        },
        bankInfo: paymentMethod === 'card_to_card' ? bankInfo : undefined,
        exchangeInfo: paymentMethod === 'exchange_hawala' ? exchangeInfo : undefined
      };

      console.log('📤 Submitting order:', orderData);

      const response = await api.orders.create(orderData, token);

      if (response.ok) {
        const data = await response.json();
        localStorage.removeItem('cart');
        
        if (paymentMethod === 'cash_on_delivery') {
          router.push(`/checkout/success?orderId=${data._id}`);
        } else {
          router.push(`/checkout/upload-payment?orderId=${data._id}`);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'خطا در ثبت سفارش');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  // ============ رندر ============
  if (!settings) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container-custom py-8 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold mb-4">سبد خرید خالی است</h1>
        <p className="text-gray-500 mb-6">هنوز محصولی به سبد خرید خود اضافه نکرده‌اید.</p>
        <Link href="/products" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  const primaryColor = settings?.primaryColor || '#e53e3e';

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold mb-6">📝 تکمیل سفارش</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <span>❌</span>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* ============ فرم اطلاعات ============ */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-bold text-lg mb-4">اطلاعات دریافت کننده</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                نام کامل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={customerInfo.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                style={{ 
                  '--tw-ring-color': primaryColor,
                } as React.CSSProperties}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                ایمیل <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={customerInfo.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                style={{ 
                  '--tw-ring-color': primaryColor,
                } as React.CSSProperties}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                شماره تماس <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={customerInfo.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                style={{ 
                  '--tw-ring-color': primaryColor,
                } as React.CSSProperties}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                ولایت <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedProvinceId}
                onChange={handleProvinceChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                style={{ 
                  '--tw-ring-color': primaryColor,
                } as React.CSSProperties}
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

            {selectedProvinceId && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  ولسوالی <span className="text-red-500">*</span>
                </label>
                <select
                  value={customerInfo.district}
                  onChange={handleDistrictChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                  style={{ 
                    '--tw-ring-color': primaryColor,
                  } as React.CSSProperties}
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
              <label className="block text-sm font-medium mb-1">
                آدرس دقیق <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                required
                rows={3}
                value={customerInfo.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                style={{ 
                  '--tw-ring-color': primaryColor,
                } as React.CSSProperties}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition"
                style={{ 
                  '--tw-ring-color': primaryColor,
                } as React.CSSProperties}
              />
            </div>

            {/* ============ روش پرداخت ============ */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">روش پرداخت</h3>
              
              <label className={`flex items-start p-3 border rounded-lg mb-3 cursor-pointer ${
                paymentMethod === 'cash_on_delivery' ? 'border-green-500 bg-green-50' : 'border-gray-300'
              }`}>
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

              <label className={`flex items-start p-3 border rounded-lg mb-3 cursor-pointer ${
                paymentMethod === 'card_to_card' ? 'border-green-500 bg-green-50' : 'border-gray-300'
              }`}>
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

              <label className={`flex items-start p-3 border rounded-lg cursor-pointer ${
                paymentMethod === 'exchange_hawala' ? 'border-green-500 bg-green-50' : 'border-gray-300'
              }`}>
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

            {/* ============ فرم حواله بانکی ============ */}
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

            {/* ============ فرم حواله صرافی ============ */}
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
        
        {/* ============ خلاصه سفارش ============ */}
        <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-20">
          <h2 className="font-bold text-lg mb-4">خلاصه سفارش</h2>
          
          <div className="max-h-60 overflow-y-auto mb-4">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between mb-2 text-sm border-b pb-2">
                <span>{item.name} × {item.quantity}</span>
                <span>{(item.price * item.quantity).toLocaleString()} افغانی</span>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-3 mt-2">
            <div className="flex justify-between">
              <span className="text-gray-600">جمع محصولات:</span>
              <span>{totalPrice.toLocaleString()} افغانی</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">هزینه ارسال:</span>
              {isFreeDelivery ? (
                <span className="text-green-600 font-medium">رایگان</span>
              ) : (
                <span>{finalDeliveryFee.toLocaleString()} افغانی</span>
              )}
            </div>
            {isFreeDelivery && (
              <div className="text-xs text-green-600 mt-1">
                ✅ ارسال رایگان (خرید بالای {(settings?.freeDeliveryThreshold || 0).toLocaleString()} افغانی)
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-3 mt-3">
              <span>جمع کل:</span>
              <span className="text-green-600">{total.toLocaleString()} افغانی</span>
            </div>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full text-white py-3 rounded-lg font-bold transition mt-4 disabled:opacity-50 hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            {loading ? '⏳ در حال ثبت سفارش...' : '✅ ثبت نهایی سفارش'}
          </button>
          
          <Link
            href="/cart"
            className="block text-center text-gray-500 text-sm mt-3 hover:underline"
          >
            ← بازگشت به سبد خرید
          </Link>
        </div>
      </div>
    </div>
  );
}