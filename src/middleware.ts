import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define public routes that don't require authentication
const PUBLIC_PAGE_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/docs',
  '/favicon.ico',
];

// Define public API routes that don't require authentication
const PUBLIC_API_ROUTES = [
  '/api/auth/signin',
  '/api/auth/signout',
  '/api/auth/callback',
  '/api/auth/session',
  '/api/health',
];

// Rate limiting store (in-memory for now)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // per window
  apiMaxRequests: 50, // per window for API routes
};

/**
 * Check if a path matches any route pattern using exact match or dynamic segments
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    // Handle dynamic routes like [id] or [slug] - escape regex special chars except [param]
    const escapedRoute = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = escapedRoute.replace(/\\\[.*?\\\]/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  });
}

/**
 * Check if a path is a public route
 */
function isPublicRoute(pathname: string): boolean {
  return matchesRoute(pathname, PUBLIC_PAGE_ROUTES) || 
         matchesRoute(pathname, PUBLIC_API_ROUTES);
}

// Removed unused function - functionality is now handled in isPublicRoute

/**
 * Simple rate limiter
 */
function checkRateLimit(identifier: string, isApiRoute: boolean): boolean {
  const now = Date.now();
  const windowMs = RATE_LIMIT_CONFIG.windowMs;
  const maxRequests = isApiRoute ? RATE_LIMIT_CONFIG.apiMaxRequests : RATE_LIMIT_CONFIG.maxRequests;
  
  const key = `${identifier}:${Math.floor(now / windowMs)}`;
  const current = rateLimitStore.get(key);
  
  if (!current) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"
  );
  
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and Next.js internals
  if (pathname.startsWith('/_next/') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Rate limiting check
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  const isApiRoute = pathname.startsWith('/api/');
  
  if (!checkRateLimit(clientIp, isApiRoute)) {
    return new NextResponse('Too Many Requests', { 
      status: 429,
      headers: {
        'Retry-After': '900', // 15 minutes
      }
    });
  }

  // For API routes, require authentication
  if (isApiRoute) {
    try {
      // Validate JWT token using NextAuth
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
      });
      
      if (!token) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
      
      // Add user info to headers for downstream use
      const response = NextResponse.next();
      response.headers.set('x-user-id', token.sub || '');
      response.headers.set('x-user-roles', JSON.stringify(token.roles || []));
      
      return addSecurityHeaders(response);
    } catch (error) {
      console.error('Token validation error:', error);
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  // For page routes, check authentication and redirect if needed
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      // Redirect to login for protected pages
      const loginUrl = new URL('/login', request.url);
      // Validate callbackUrl to prevent open redirects
      const callbackUrl = request.url;
      if (callbackUrl && new URL(callbackUrl).origin === request.nextUrl.origin) {
        loginUrl.searchParams.set('callbackUrl', callbackUrl);
      }
      return NextResponse.redirect(loginUrl);
    }
    
    // Add user info to headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-user-id', token.sub || '');
    response.headers.set('x-user-roles', JSON.stringify(token.roles || []));
    
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Token validation error:', error);
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|ico|css|js)$).*)',
  ],
};