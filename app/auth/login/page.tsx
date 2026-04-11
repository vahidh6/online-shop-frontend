'use client';

import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">در حال بارگذاری...</div>}>
      <LoginForm />
    </Suspense>
  );
}