import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // مسیرهای عمومی که نیاز به بررسی ندارند
  const publicPaths = ['/', '/products', '/auth/login', '/auth/register', '/cart'];
  const isPublicPath = publicPaths.some(path => pathname === path) || pathname.startsWith('/products/');
  
  // مسیرهای ادمین
  if (pathname.startsWith('/admin')) {
    // صفحات عمومی ادمین (لاگین)
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }
    
    // بررسی توکن در کوکی (برای مسیرهای ادمین)
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      // اگر توکن نداره، بره به صفحه لاگین ادمین
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // بررسی نقش کاربر (اینجا فقط توکن رو چک می‌کنیم، نقش در صفحه چک می‌شه)
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
};