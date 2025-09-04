import { NextRequest, NextResponse } from 'next/server';

export interface SecurityHeaders {
  [key: string]: string;
}

/**
 * Comprehensive security headers configuration
 * Implements OWASP security best practices
 */
export const securityHeaders: SecurityHeaders = {
  // Prevent XSS attacks
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',

  // Content Security Policy - Strict XSS protection
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; '),

  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ].join(', '),

  // HSTS - Force HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Cache control for sensitive endpoints
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

/**
 * Get CORS headers based on environment
 */
export function getCORSHeaders(): SecurityHeaders {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  const isDevelopment = process.env.NODE_ENV === 'development';

  // In development, allow localhost origins
  if (isDevelopment) {
    allowedOrigins.push('http://localhost:3000', 'http://127.0.0.1:3000');
  }

  // Never allow wildcard in production
  const origin =
    allowedOrigins.length > 0
      ? allowedOrigins.join(', ')
      : 'http://localhost:3000';

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-User-Id, X-User-Roles',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Apply security headers to a response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Apply base security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Apply CORS headers
  Object.entries(getCORSHeaders()).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

/**
 * Get headers for API responses
 */
export function getAPIHeaders(): SecurityHeaders {
  return {
    ...securityHeaders,
    ...getCORSHeaders(),
    'Content-Type': 'application/json',
  };
}

/**
 * Get headers for static assets
 */
export function getStaticAssetHeaders(): SecurityHeaders {
  return {
    ...securityHeaders,
    'Cache-Control': 'public, max-age=31536000, immutable',
  };
}

/**
 * Create a new request with security headers
 */
export function createSecureRequest(request: NextRequest): NextRequest {
  // Create a new request with the same properties
  const newRequest = new NextRequest(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    cache: request.cache,
    credentials: request.credentials,
    integrity: request.integrity,
    keepalive: request.keepalive,
    mode: request.mode,
    redirect: request.redirect,
    referrer: request.referrer,
    referrerPolicy: request.referrerPolicy,
    signal: request.signal,
  });

  // Add security headers to request headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    newRequest.headers.set(key, value);
  });

  return newRequest;
}

/**
 * Rate limiting headers
 */
export function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  resetTime: number
): NextResponse {
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', resetTime.toString());
  response.headers.set('X-RateLimit-Limit', '100');

  return response;
}
