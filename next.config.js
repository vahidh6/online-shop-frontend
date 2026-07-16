/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'online-shop-backend-production-27a8.up.railway.app'],
  },
  
  // ============ تنظیمات مهم برای میزبانی ============
  
  // خروجی به صورت standalone برای اجرا با Node.js
  output: 'standalone',
  
  // فعال کردن کامپایلر جدید برای بهبود عملکرد
  swcMinify: true,
  
  // غیرفعال کردن x-powered-by برای امنیت
  poweredByHeader: false,
  
  // تنظیمات redirects (اختیاری)
  async redirects() {
    return [
      // اگر صفحه‌ای وجود ندارد، به صفحه اصلی هدایت شود
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // }
    ];
  },
  
  // تنظیمات rewrites (اختیاری)
  async rewrites() {
    return [
      // اگر API در آدرس دیگری است
      // {
      //   source: '/api/:path*',
      //   destination: 'https://your-backend.com/api/:path*',
      // }
    ];
  },
}

module.exports = nextConfig