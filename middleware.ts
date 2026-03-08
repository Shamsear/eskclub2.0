import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public API routes without authentication
  if (pathname.startsWith('/api/public') || 
      pathname.startsWith('/api/auth') || 
      pathname.startsWith('/api/imagekit-auth') ||
      pathname.startsWith('/api/matches')) {
    console.log('[Middleware] Allowing public API:', pathname);
    return NextResponse.next();
  }

  // Allow public pages without authentication
  if (pathname.startsWith('/tournaments') ||
      pathname.startsWith('/matches') ||
      pathname.startsWith('/players') ||
      pathname.startsWith('/clubs') ||
      pathname.startsWith('/leaderboard') ||
      pathname === '/login' ||
      pathname === '/') {
    console.log('[Middleware] Allowing public page:', pathname);
    return NextResponse.next();
  }

  // Protect dashboard and private API routes with authentication
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/')) {
    console.log('[Middleware] Requiring auth for:', pathname);
    return withAuth(
      function middleware(req) {
        return NextResponse.next();
      },
      {
        callbacks: {
          authorized: ({ token }) => !!token,
        },
        pages: {
          signIn: "/login",
        },
      }
    )(req as any, {} as any);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png).*)',
  ],
};
