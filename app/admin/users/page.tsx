'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, TrashIcon, PencilIcon, CheckBadgeIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  province: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${apiUrl}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error('Users data is not an array:', data);
          setUsers([]);
        }
      } else {
        console.error('Failed to fetch users:', res.status);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    try {
      const res = await fetch(`${apiUrl}/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      
      if (res.ok) {
        fetchUsers();
      } else {
        alert('خطا در تغییر وضعیت کاربر');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('خطا در ارتباط با سرور');
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('آیا از حذف این کاربر مطمئن هستید؟')) return;
    
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    try {
      const res = await fetch(`${apiUrl}/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchUsers();
        alert('کاربر با موفقیت حذف شد');
      } else {
        alert('خطا در حذف کاربر');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('خطا در ارتباط با سرور');
    }
  };

  const changeRole = async (id: string, newRole: string) => {
    const token = localStorage.getItem('token');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://online-shop-backend-production-27a8.up.railway.app';
    
    try {
      const res = await fetch(`${apiUrl}/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (res.ok) {
        fetchUsers();
        alert('نقش کاربر با موفقیت تغییر کرد');
      } else {
        alert('خطا در تغییر نقش کاربر');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('خطا در ارتباط با سرور');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  const getRoleBadge = (role: string) => {
    const colors: { [key: string]: string } = {
      admin: 'bg-red-100 text-red-800',
      sales_manager: 'bg-blue-100 text-blue-800',
      customer: 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleText = (role: string) => {
    const texts: { [key: string]: string } = {
      admin: 'مدیر',
      sales_manager: 'مدیر فروش',
      customer: 'مشتری'
    };
    return texts[role] || role;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* دکمه برگشت */}
      <div className="mb-6">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>بازگشت به داشبورد</span>
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">👥 مدیریت کاربران</h1>

      {/* جستجو */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium mb-1">جستجو</label>
          <input
            type="text"
            placeholder="نام، ایمیل یا شماره تماس..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* لیست کاربران */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-right">نام</th>
              <th className="p-3 text-right">ایمیل</th>
              <th className="p-3 text-right">شماره تماس</th>
              <th className="p-3 text-right">نقش</th>
              <th className="p-3 text-right">استان</th>
              <th className="p-3 text-right">وضعیت</th>
              <th className="p-3 text-right">تاریخ ثبت</th>
              <th className="p-3 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{user.name}</td>
                <td className="p-3 text-sm">{user.email || '-'}</td>
                <td className="p-3 text-sm">{user.phone}</td>
                <td className="p-3">
                  <select
                    value={user.role}
                    onChange={(e) => changeRole(user._id, e.target.value)}
                    className={`px-2 py-1 rounded-full text-xs border ${getRoleBadge(user.role)}`}
                  >
                    <option value="customer">مشتری</option>
                    <option value="sales_manager">مدیر فروش</option>
                    <option value="admin">مدیر</option>
                  </select>
                </td>
                <td className="p-3 text-sm">{user.province || '-'}</td>
                <td className="p-3">
                  <button
                    onClick={() => toggleUserStatus(user._id, user.isActive)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.isActive ? (
                      <CheckBadgeIcon className="w-3 h-3" />
                    ) : (
                      <XMarkIcon className="w-3 h-3" />
                    )}
                    {user.isActive ? 'فعال' : 'غیرفعال'}
                  </button>
                </td>
                <td className="p-3 text-sm">
                  {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => deleteUser(user._id)}
                    className="text-red-600 hover:text-red-800 transition"
                    title="حذف کاربر"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">هیچ کاربری یافت نشد</p>
          </div>
        )}
      </div>

      {/* آمار */}
      <div className="mt-4 text-sm text-gray-500">
        تعداد کل کاربران: {users.length} نفر
      </div>
    </div>
  );
}