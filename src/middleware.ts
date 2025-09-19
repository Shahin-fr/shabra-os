import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/docs',
  '/docs/[slug]',
  '/api/auth/signin',
  '/api/auth/signout',
  '/api/auth/callback',
  '/api/auth/session',
  '/api/health',
  '/_next',
  '/favicon.ico',
];

// Define admin routes that require ADMIN role
const ADMIN_ROUTES = [
  '/admin',
  '/admin/dashboard',
  '/admin/users',
  '/admin/settings',
  '/admin/analytics',
  '/admin/attendance',
  '/admin/leave-requests',
];

// Define manager routes that require MANAGER or ADMIN role
const MANAGER_ROUTES = [
  '/projects',
  '/projects/create',
  '/projects/[id]/edit',
  '/tasks',
  '/tasks/create',
  '/tasks/[id]/edit',
  '/team',
  '/reports',
];

// Define protected routes that require any authenticated user
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/storyboard',
  '/content-calendar',
  '/wiki',
  '/attendance',
  '/projects/[id]',
  '/tasks/[id]',
];

/**
 * Check if a path matches any route pattern
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    // Handle dynamic routes like [id] or [slug]
    const pattern = route.replace(/\[.*?\]/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname) || pathname.startsWith(route);
  });
}

/**
 * Check if user has required role
 */
function hasRole(userRoles: string[], requiredRoles: string[]): boolean {
  return requiredRoles.some(role => userRoles.includes(role));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (matchesRoute(pathname, PUBLIC_ROUTES)) {
    return NextResponse.next();
  }

  // Get user session
  const session = await auth();

  // If no session, redirect to login for protected routes
  if (!session?.user?.id) {
    // Allow API routes to handle their own authentication
    if (pathname.startsWith('/api/')) {
      return NextResponse.next();
    }
    
    // Redirect to login for protected pages
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const userRoles = session.user.roles || [];

  // Check admin routes
  if (matchesRoute(pathname, ADMIN_ROUTES)) {
    if (!hasRole(userRoles, ['ADMIN'])) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Check manager routes
  if (matchesRoute(pathname, MANAGER_ROUTES)) {
    if (!hasRole(userRoles, ['ADMIN', 'MANAGER'])) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Check protected routes
  if (matchesRoute(pathname, PROTECTED_ROUTES)) {
    // User is authenticated, allow access
    return NextResponse.next();
  }

  // For any other route, allow access if user is authenticated
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
