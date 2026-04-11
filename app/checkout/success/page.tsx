'use client';

import { Suspense } from 'react';
import SuccessContent from './SuccessContent';

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">در حال بارگذاری...</div>}>
      <SuccessContent />
    </Suspense>
  );
}