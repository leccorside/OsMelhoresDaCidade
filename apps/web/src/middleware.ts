import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const authToken = request.cookies.get('auth_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  // Proteção da Área Administrativa Master (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (!authToken || userRole !== 'ADMIN') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Proteção do Painel do Comerciante (/comerciante/*)
  if (pathname.startsWith('/comerciante')) {
    if (!authToken || !['MERCHANT', 'ADMIN'].includes(userRole || '')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/comerciante/:path*'],
};

