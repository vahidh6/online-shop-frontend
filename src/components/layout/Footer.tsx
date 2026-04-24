import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* درباره ما */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-red-500">فروشگاه افغانستان</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              بزرگترین فروشگاه آنلاین افغانستان با بهترین قیمت‌ها و کیفیت تضمینی. 
              ارائه انواع محصولات با ارسال سریع به سراسر کشور.
            </p>
          </div>

          {/* لینک‌های سریع */}
          <div>
            <h3 className="text-lg font-semibold mb-4">لینک‌های سریع</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  درباره ما
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  تماس با ما
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                  سوالات متداول
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  حریم خصوصی
                </Link>
              </li>
            </ul>
          </div>

          {/* دسته‌بندی‌ها */}
          <div>
            <h3 className="text-lg font-semibold mb-4">دسته‌بندی‌ها</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=electronics" className="text-gray-300 hover:text-white transition-colors">
                  الکترونیک
                </Link>
              </li>
              <li>
                <Link href="/products?category=clothing" className="text-gray-300 hover:text-white transition-colors">
                  پوشاک
                </Link>
              </li>
              <li>
                <Link href="/products?category=books" className="text-gray-300 hover:text-white transition-colors">
                  کتاب‌ها
                </Link>
              </li>
              <li>
                <Link href="/products?category=home" className="text-gray-300 hover:text-white transition-colors">
                  خانه و آشپزخانه
                </Link>
              </li>
            </ul>
          </div>

          {/* ارتباط با ما */}
          <div>
            <h3 className="text-lg font-semibold mb-4">ارتباط با ما</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>📞 تلفن: ۰۷۸۹ ۱۲۳ ۴۵۶۷</li>
              <li>✉️ ایمیل: info@afghanstore.com</li>
              <li>📍 آدرس: کابل، افغانستان</li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-300 hover:text-white text-2xl">📘</a>
              <a href="#" className="text-gray-300 hover:text-white text-2xl">📷</a>
              <a href="#" className="text-gray-300 hover:text-white text-2xl">🐦</a>
              <a href="#" className="text-gray-300 hover:text-white text-2xl">💬</a>
            </div>
          </div>
        </div>

        {/* کپی‌رایت */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} فروشگاه آنلاین افغانستان - تمامی حقوق محفوظ است
          </p>
          <p className="text-gray-500 text-xs mt-2">
            طراحی و توسعه با ❤️ برای افغانستان
          </p>
        </div>
      </div>
    </footer>
  );
}