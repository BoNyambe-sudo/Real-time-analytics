import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextAuthRequest } from 'next-auth';

const authMiddleware = auth((req: NextAuthRequest) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard');
  const isOnSettings = req.nextUrl.pathname.startsWith('/settings');
  const isOnLogin = req.nextUrl.pathname.startsWith('/login');
  const isOnApiAuth = req.nextUrl.pathname.startsWith('/api/auth');

  if (isOnDashboard || isOnSettings) {
    if (!isLoggedIn) {
      const callbackUrl = req.nextUrl.pathname + req.nextUrl.search;
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`, req.nextUrl)
      );
    }
  }

  if (isOnLogin && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  return NextResponse.next();
});

export default authMiddleware as any;

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/login', '/api/auth/:path*'],
};
