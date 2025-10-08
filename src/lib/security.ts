/**
 * Security utilities and configurations for Shabra OS
 * Provides comprehensive security headers, session management, and protection mechanisms
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Security headers configuration
export const SECURITY_HEADERS = {
  // Prevent clickjacking attacks
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // XSS protection (legacy but still useful)
  'X-XSS-Protection': '1; mode=block',
  
  // Prevent DNS prefetching
  'X-DNS-Prefetch-Control': 'off',
  
  // Control browser features
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  
  // Strict Transport Security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; '),
} as const;

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // per window for pages
  apiMaxRequests: 50, // per window for API routes
  authMaxRequests: 10, // per window for auth endpoints
} as const satisfies {
  windowMs: number;
  maxRequests: number;
  apiMaxRequests: number;
  authMaxRequests: number;
};

// Session security configuration
export const SESSION_CONFIG = {
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  updateAge: 24 * 60 * 60, // 24 hours in seconds
  rolling: true, // Extend session on activity
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'lax' as const,
} as const;

// CSRF protection configuration
export const CSRF_CONFIG = {
  tokenLength: 32,
  maxAge: 60 * 60, // 1 hour
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'lax' as const,
} as const;

/**
 * Apply comprehensive security headers to a response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Apply all security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * Generate a secure random token for CSRF protection
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(CSRF_CONFIG.tokenLength);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  return token === storedToken;
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

/**
 * Check if request is from a trusted origin
 */
export function isTrustedOrigin(origin: string, allowedOrigins: string[]): boolean {
  if (!origin) return false;
  
  try {
    const url = new URL(origin);
    return allowedOrigins.some(allowed => {
      if (allowed === '*') return true;
      if (allowed.startsWith('*.')) {
        return url.hostname.endsWith(allowed.slice(2));
      }
      return url.origin === allowed;
    });
  } catch {
    return false;
  }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate session token format
 */
export function isValidSessionToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  
  // Basic JWT format validation (3 parts separated by dots)
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
}

/**
 * Create a secure response with security headers
 */
export function createSecureResponse(
  body: string | null = null,
  init: ResponseInit = {}
): NextResponse {
  const response = new NextResponse(body, init);
  return addSecurityHeaders(response);
}

/**
 * Security middleware helper for common security checks
 */
export class SecurityMiddleware {
  private static rateLimitStore = new Map<string, { count: number; resetTime: number }>();
  
  /**
   * Check rate limit for a client
   */
  static checkRateLimit(identifier: string, isApiRoute: boolean, isAuthRoute: boolean = false): boolean {
    const now = Date.now();
    const windowMs = RATE_LIMIT_CONFIG.windowMs;
    
    let maxRequests: number = RATE_LIMIT_CONFIG.maxRequests;
    if (isAuthRoute) {
      maxRequests = RATE_LIMIT_CONFIG.authMaxRequests;
    } else if (isApiRoute) {
      maxRequests = RATE_LIMIT_CONFIG.apiMaxRequests;
    }
    
    const key = `${identifier}:${Math.floor(now / windowMs)}`;
    const current = this.rateLimitStore.get(key);
    
    if (!current) {
      this.rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (now > current.resetTime) {
      this.rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (current.count >= maxRequests) {
      return false;
    }
    
    current.count++;
    return true;
  }
  
  /**
   * Clean up expired rate limit entries
   */
  static cleanupRateLimit(): void {
    const now = Date.now();
    for (const [key, value] of this.rateLimitStore.entries()) {
      if (now > value.resetTime) {
        this.rateLimitStore.delete(key);
      }
    }
  }
}

/**
 * Security event logging
 */
export class SecurityLogger {
  static logSecurityEvent(
    event: string,
    details: Record<string, any>,
    request?: NextRequest
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      ip: request ? getClientIP(request) : 'unknown',
      userAgent: request?.headers.get('user-agent') || 'unknown',
    };
    
    // In production, this should be sent to a security monitoring service
    if (process.env.NODE_ENV === 'production') {
      console.warn('SECURITY_EVENT:', JSON.stringify(logEntry));
    } else {
      console.log('SECURITY_EVENT:', logEntry);
    }
  }
  
  static logAuthFailure(ip: string, reason: string): void {
    this.logSecurityEvent('AUTH_FAILURE', { ip, reason });
  }
  
  static logRateLimitExceeded(ip: string, endpoint: string): void {
    this.logSecurityEvent('RATE_LIMIT_EXCEEDED', { ip, endpoint });
  }
  
  static logSuspiciousActivity(ip: string, activity: string, details: Record<string, any>): void {
    this.logSecurityEvent('SUSPICIOUS_ACTIVITY', { ip, activity, details });
  }
}
