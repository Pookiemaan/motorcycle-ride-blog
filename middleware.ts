import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-insecure-secret-change-me');
const csrfToken = process.env.CSRF_SECRET || 'dev-csrf-secret';

async function verify(token: string) {
  return jwtVerify(token, secret, { algorithms: ['HS256'] });
}

function applyCsrf(res: NextResponse, req: NextRequest) {
  if (req.cookies.get('csrf_token')?.value !== csrfToken) {
    res.cookies.set('csrf_token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const proto = req.headers.get('x-forwarded-proto');
  if (proto === 'http' && process.env.NODE_ENV === 'production') {
    const url = req.nextUrl.clone();
    url.protocol = 'https:';
    return applyCsrf(NextResponse.redirect(url, 308), req);
  }

  if (pathname.startsWith('/api/media/') && pathname.endsWith('/file')) return applyCsrf(NextResponse.next(), req);
  if (pathname === '/api/posts' && req.method === 'GET') return applyCsrf(NextResponse.next(), req);
  if (pathname === '/rss.xml') return applyCsrf(NextResponse.next(), req);
  if (pathname === '/' || pathname.startsWith('/about') || pathname.startsWith('/gallery') || pathname.startsWith('/rides')) return applyCsrf(NextResponse.next(), req);
  if (pathname.startsWith('/login')) return applyCsrf(NextResponse.next(), req);

  const protectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname === '/api/posts' ||
    pathname.startsWith('/api/posts/') ||
    pathname === '/api/media/sign-upload' ||
    (pathname.startsWith('/api/media/') && pathname.endsWith('/ready')) ||
    pathname.startsWith('/api/auth/logout') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/reset-password') ||
    pathname.startsWith('/api/auth/forgot-password') ||
    pathname.startsWith('/api/auth/refresh') ||
    pathname.startsWith('/api/auth/me');

  if (!protectedRoute) return applyCsrf(NextResponse.next(), req);

  if (pathname.startsWith('/api')) {
    const token = req.cookies.get('access_token')?.value;
    if (!token) return applyCsrf(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), req);
    try {
      await verify(token);
      return applyCsrf(NextResponse.next(), req);
    } catch {
      return applyCsrf(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), req);
    }
  }

  const token = req.cookies.get('access_token')?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return applyCsrf(NextResponse.redirect(url), req);
  }

  try {
    await verify(token);
    return applyCsrf(NextResponse.next(), req);
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return applyCsrf(NextResponse.redirect(url), req);
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/admin/:path*', '/api/media/:path*', '/api/posts/:path*', '/api/auth/:path*', '/login', '/about', '/gallery', '/rides/:path*', '/rss.xml', '/']
};
