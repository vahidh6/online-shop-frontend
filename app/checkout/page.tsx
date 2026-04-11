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
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 50000;
  const total = totalPrice + deliveryFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('لطفاً ابتدا وارد شوید');
      router.push('/auth/login');
      return;
    }

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
      paymentMethod: 'cash_on_delivery',
      customerInfo: customerInfo
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
      
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const order = await response.json();
        localStorage.removeItem('cart');
        router.push(`/checkout/success?orderId=${order._id}`);
      } else {
        alert('خطا در ثبت سفارش');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('خطا در ارتباط با سرور');
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
      
      <div className="grid md:grid-cols-2 gap-8">
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
              <label className="block text-sm font-medium mb-1">آدرس *</label>
              <textarea
                name="address"
                required
                rows={3}
                value={customerInfo.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? 'در حال ثبت...' : '✅ ثبت سفارش'}
            </button>
          </form>
        </div>
        
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
        </div>
      </div>
    </div>
  );
}