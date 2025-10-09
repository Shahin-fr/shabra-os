import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

import {
  addSecurityHeaders,
  getClientIP,
  SecurityMiddleware,
  SecurityLogger,
  isValidSessionToken,
  isTrustedOrigin,
  createSecureResponse,
} from '@/lib/security';
import {
  BruteForceProtection,
  IPManagement,
  AuditLogger as AdvancedAuditLogger,
  AUDIT_EVENT_TYPES,
  SECURITY_RISK_LEVELS,
} from '@/lib/advanced-security';
import { withErrorHandling, ErrorLogger } from '@/lib/errors';

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

// Trusted origins for CORS
const TRUSTED_ORIGINS = [
  process.env.NEXTAUTH_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'https://localhost:3000',
];

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

/**
 * Check if a path is an authentication route
 */
function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith('/api/auth/') || 
         ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname);
}

async function middlewareHandler(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);
  const isApiRoute = pathname.startsWith('/api/');
  const isAuth = isAuthRoute(pathname);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Clean up expired rate limit entries periodically
  if (Math.random() < 0.01) { // 1% chance
    SecurityMiddleware.cleanupRateLimit();
  }

  // Skip middleware for static files and Next.js internals
  if (pathname.startsWith('/_next/') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  // Check if IP is blocked
  if (IPManagement.isBlocked(clientIP)) {
    await AdvancedAuditLogger.logSecurityEvent(
      AUDIT_EVENT_TYPES.ACCESS_DENIED,
      { ip: clientIP, pathname, reason: 'IP_BLOCKED' },
      SECURITY_RISK_LEVELS.HIGH,
      undefined,
      clientIP
    );
    return createSecureResponse('Access Denied', { status: 403 });
  }

  // Check if IP is whitelisted (bypass some checks)
  const isWhitelisted = IPManagement.isWhitelisted(clientIP);

  // CORS and origin validation for API routes
  if (isApiRoute) {
    const origin = request.headers.get('origin');
    if (origin && !isTrustedOrigin(origin, TRUSTED_ORIGINS)) {
      SecurityLogger.logSuspiciousActivity(clientIP, 'UNTRUSTED_ORIGIN', { origin, pathname });
      await AdvancedAuditLogger.logSecurityEvent(
        AUDIT_EVENT_TYPES.SUSPICIOUS_ACTIVITY,
        { ip: clientIP, pathname, origin, activity: 'UNTRUSTED_ORIGIN' },
        SECURITY_RISK_LEVELS.HIGH,
        undefined,
        clientIP
      );
      return createSecureResponse('Forbidden', { status: 403 });
    }
  }

  // Rate limiting check (skip for whitelisted IPs)
  if (!isWhitelisted && !SecurityMiddleware.checkRateLimit(clientIP, isApiRoute, isAuth)) {
    SecurityLogger.logRateLimitExceeded(clientIP, pathname);
    await AdvancedAuditLogger.logSecurityEvent(
      AUDIT_EVENT_TYPES.RATE_LIMIT_EXCEEDED,
      { ip: clientIP, pathname, userAgent },
      SECURITY_RISK_LEVELS.MEDIUM,
      undefined,
      clientIP
    );
    return createSecureResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '900', // 15 minutes
      },
    });
  }

  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // For API routes, require proper authentication
  if (isApiRoute) {
    try {
      // Check brute force protection for auth endpoints
      if (isAuth && !isWhitelisted) {
        const bruteForceResult = BruteForceProtection.recordFailedAttempt(clientIP);
        
        if (bruteForceResult.isLocked) {
          await AdvancedAuditLogger.logSecurityEvent(
            AUDIT_EVENT_TYPES.BRUTE_FORCE_DETECTED,
            { 
              ip: clientIP, 
              pathname, 
              attempts: BruteForceProtection.getAttemptCount(clientIP),
              lockoutDuration: bruteForceResult.lockoutDuration 
            },
            SECURITY_RISK_LEVELS.CRITICAL,
            undefined,
            clientIP
          );
          
          // Block IP if too many attempts
          if (BruteForceProtection.getAttemptCount(clientIP) >= 10) {
            IPManagement.blockIP(clientIP, 'Excessive brute force attempts', 24 * 60 * 60 * 1000); // 24 hours
          }
          
          return createSecureResponse('Too Many Attempts', {
            status: 429,
            headers: {
              'Retry-After': Math.ceil((bruteForceResult.lockoutDuration || 0) / 1000).toString(),
            },
          });
        }
      }

      // Validate JWT token using NextAuth
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
      });
      
      if (!token || !token.sub) {
        SecurityLogger.logAuthFailure(clientIP, 'INVALID_TOKEN');
        
        // Record failed attempt for auth endpoints
        if (isAuth && !isWhitelisted) {
          const bruteForceResult = BruteForceProtection.recordFailedAttempt(clientIP);
          
          await AdvancedAuditLogger.logAuthEvent(
            AUDIT_EVENT_TYPES.LOGIN_FAILURE,
            token?.sub || 'unknown',
            clientIP,
            { 
              reason: 'INVALID_TOKEN',
              remainingAttempts: bruteForceResult.remainingAttempts,
              delay: bruteForceResult.delay 
            }
          );
          
          // Add delay for failed attempts
          if (bruteForceResult.delay) {
            await new Promise(resolve => setTimeout(resolve, bruteForceResult.delay));
          }
        }
        
        return createSecureResponse('Unauthorized', { status: 401 });
      }
      
      // Record successful attempt for auth endpoints
      if (isAuth) {
        BruteForceProtection.recordSuccessfulAttempt(clientIP);
        await AdvancedAuditLogger.logAuthEvent(
          AUDIT_EVENT_TYPES.LOGIN_SUCCESS,
          token.sub || 'unknown',
          clientIP,
          { pathname }
        );
      }
      
      // Add user info to headers for downstream use
      const response = NextResponse.next();
      response.headers.set('x-user-id', token.sub || '');
      response.headers.set('x-user-roles', JSON.stringify(token.roles || []));
      response.headers.set('x-user-email', token.email || '');
      
      return addSecurityHeaders(response);
    } catch (error) {
      SecurityLogger.logAuthFailure(clientIP, 'TOKEN_VALIDATION_ERROR');
      await ErrorLogger.logError(error as Error, { 
        clientIP, 
        pathname, 
        reason: 'TOKEN_VALIDATION_ERROR' 
      }, request);
      
      // Record failed attempt for auth endpoints
      if (isAuth && !isWhitelisted) {
        BruteForceProtection.recordFailedAttempt(clientIP);
        await AdvancedAuditLogger.logAuthEvent(
          AUDIT_EVENT_TYPES.LOGIN_FAILURE,
          'unknown',
          clientIP,
          { reason: 'TOKEN_VALIDATION_ERROR', error: (error as Error).message }
        );
      }
      
      return createSecureResponse('Unauthorized', { status: 401 });
    }
  }

  // For page routes, check authentication and redirect if needed
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token || !token.sub) {
      // Check brute force protection for login pages
      if (pathname === '/login' && !isWhitelisted) {
        const bruteForceResult = BruteForceProtection.recordFailedAttempt(clientIP);
        
        if (bruteForceResult.isLocked) {
          await AdvancedAuditLogger.logSecurityEvent(
            AUDIT_EVENT_TYPES.BRUTE_FORCE_DETECTED,
            { 
              ip: clientIP, 
              pathname, 
              attempts: BruteForceProtection.getAttemptCount(clientIP),
              lockoutDuration: bruteForceResult.lockoutDuration 
            },
            SECURITY_RISK_LEVELS.CRITICAL,
            undefined,
            clientIP
          );
          
          // Block IP if too many attempts
          if (BruteForceProtection.getAttemptCount(clientIP) >= 10) {
            IPManagement.blockIP(clientIP, 'Excessive brute force attempts', 24 * 60 * 60 * 1000); // 24 hours
          }
          
          // Redirect to login with error message
          const loginUrl = new URL('/login', request.url);
          loginUrl.searchParams.set('error', 'Too many attempts. Please try again later.');
          return NextResponse.redirect(loginUrl);
        }
      }
      
      // Redirect to login for protected pages
      const loginUrl = new URL('/login', request.url);
      
      // Validate callbackUrl to prevent open redirects
      const callbackUrl = request.url;
      if (callbackUrl) {
        try {
          const callbackUrlObj = new URL(callbackUrl);
          if (callbackUrlObj.origin === request.nextUrl.origin) {
            loginUrl.searchParams.set('callbackUrl', callbackUrl);
          }
        } catch {
          // Invalid callback URL, don't include it
        }
      }
      
      SecurityLogger.logAuthFailure(clientIP, 'NO_VALID_SESSION');
      await AdvancedAuditLogger.logAuthEvent(
        AUDIT_EVENT_TYPES.LOGIN_FAILURE,
        'unknown',
        clientIP,
        { reason: 'NO_VALID_SESSION', pathname }
      );
      
      return NextResponse.redirect(loginUrl);
    }
    
    // Record successful access
    await AdvancedAuditLogger.logAuthEvent(
      AUDIT_EVENT_TYPES.ACCESS_GRANTED,
      token.sub || 'unknown',
      clientIP,
      { pathname }
    );
    
    // Add user info to headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-user-id', token.sub || '');
    response.headers.set('x-user-roles', JSON.stringify(token.roles || []));
    response.headers.set('x-user-email', token.email || '');
    
    return addSecurityHeaders(response);
  } catch (error) {
    SecurityLogger.logAuthFailure(clientIP, 'SESSION_VALIDATION_ERROR');
    await ErrorLogger.logError(error as Error, { 
      clientIP, 
      pathname, 
      reason: 'SESSION_VALIDATION_ERROR' 
    }, request);
    
    await AdvancedAuditLogger.logAuthEvent(
      AUDIT_EVENT_TYPES.LOGIN_FAILURE,
      'unknown',
      clientIP,
      { reason: 'SESSION_VALIDATION_ERROR', error: (error as Error).message }
    );
    
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

// Export the middleware with error handling
export const middleware = withErrorHandling(middlewareHandler);

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