'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    const newCart = cart.map(item => 
      item._id === id ? { ...item, quantity } : item
    );
    saveCart(newCart);
  };

  const removeItem = (id: string) => {
    const newCart = cart.filter(item => item._id !== id);
    saveCart(newCart);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="container-custom py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">🛒 سبد خرید خالی است</h1>
        <Link href="/products" className="bg-blue-600 text-white px-6 py-2 rounded-lg inline-block">
          شروع خرید
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold mb-6">🛒 سبد خرید</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {cart.map(item => (
            <div key={item._id} className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex-1">
                <h3 className="font-bold">{item.name}</h3>
                <p className="text-green-600 font-bold">{item.price.toLocaleString()} افغانی</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300"
                >-</button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300"
                >+</button>
              </div>
              <div className="min-w-[100px] text-right">
                <p className="font-bold">{(item.price * item.quantity).toLocaleString()} افغانی</p>
                <button 
                  onClick={() => removeItem(item._id)}
                  className="text-red-500 text-sm"
                >حذف</button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 h-fit">
          <h2 className="font-bold text-lg mb-4">خلاصه سبد خرید</h2>
          <div className="flex justify-between mb-2">
            <span>تعداد اقلام:</span>
            <span>{totalItems}</span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t pt-2 mt-2">
            <span>جمع کل:</span>
            <span className="text-green-600">{totalPrice.toLocaleString()} افغانی</span>
          </div>
          <Link 
            href="/checkout" 
            className="block text-center bg-green-600 text-white py-2 rounded-lg mt-4 hover:bg-green-700"
          >
            ادامه فرآیند خرید
          </Link>
        </div>
      </div>
    </div>
  );
}