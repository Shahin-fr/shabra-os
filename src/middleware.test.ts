import { NextRequest, NextResponse } from 'next/server';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { middleware } from './middleware';

// Mock Next.js server
vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn(() => ({ next: true })),
    redirect: vi.fn((url: string) => ({ redirect: true, url })),
  },
}));

// Mock the security modules
vi.mock('@/lib/security', () => ({
  addSecurityHeaders: vi.fn((response) => response),
  getClientIP: vi.fn(() => '127.0.0.1'),
  SecurityMiddleware: {
    cleanupRateLimit: vi.fn(),
    checkRateLimit: vi.fn(() => true),
  },
  SecurityLogger: {
    logSuspiciousActivity: vi.fn(),
    logRateLimitExceeded: vi.fn(),
    logAuthFailure: vi.fn(),
  },
  isValidSessionToken: vi.fn(() => true),
  isTrustedOrigin: vi.fn(() => true),
  createSecureResponse: vi.fn((message, options) => ({
    status: options?.status || 403,
    headers: options?.headers || {},
    body: message,
  })),
}));

// Mock advanced security
vi.mock('@/lib/advanced-security', () => ({
  BruteForceProtection: {
    recordFailedAttempt: vi.fn(() => ({ isLocked: false, remainingAttempts: 5, delay: 0 })),
    recordSuccessfulAttempt: vi.fn(),
    getAttemptCount: vi.fn(() => 0),
  },
  IPManagement: {
    isBlocked: vi.fn(() => false),
    isWhitelisted: vi.fn(() => false),
    blockIP: vi.fn(),
  },
  AuditLogger: {
    logSecurityEvent: vi.fn(),
    logAuthEvent: vi.fn(),
  },
  AUDIT_EVENT_TYPES: {
    ACCESS_DENIED: 'ACCESS_DENIED',
    SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    BRUTE_FORCE_DETECTED: 'BRUTE_FORCE_DETECTED',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    ACCESS_GRANTED: 'ACCESS_GRANTED',
  },
  SECURITY_RISK_LEVELS: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
  },
}));

// Mock error handling
vi.mock('@/lib/errors', () => ({
  withErrorHandling: vi.fn((handler) => handler),
  ErrorLogger: {
    logError: vi.fn(),
  },
}));

// Mock the security modules
vi.mock('@/lib/security', () => ({
  addSecurityHeaders: vi.fn((response) => response),
  getClientIP: vi.fn(() => '127.0.0.1'),
  SecurityMiddleware: {
    cleanupRateLimit: vi.fn(),
    checkRateLimit: vi.fn(() => true),
  },
  SecurityLogger: {
    logSuspiciousActivity: vi.fn(),
    logRateLimitExceeded: vi.fn(),
    logAuthFailure: vi.fn(),
  },
  isValidSessionToken: vi.fn(() => true),
  isTrustedOrigin: vi.fn(() => true),
  createSecureResponse: vi.fn((message, options) => ({
    status: options?.status || 200,
    message,
  })),
}));

// Mock advanced security
vi.mock('@/lib/advanced-security', () => ({
  BruteForceProtection: {
    recordFailedAttempt: vi.fn(() => ({ isLocked: false })),
    recordSuccessfulAttempt: vi.fn(),
    getAttemptCount: vi.fn(() => 0),
  },
  IPManagement: {
    isBlocked: vi.fn(() => false),
    isWhitelisted: vi.fn(() => false),
    blockIP: vi.fn(),
  },
  AuditLogger: {
    logSecurityEvent: vi.fn(),
    logAuthEvent: vi.fn(),
  },
  AUDIT_EVENT_TYPES: {
    ACCESS_DENIED: 'ACCESS_DENIED',
    SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    BRUTE_FORCE_DETECTED: 'BRUTE_FORCE_DETECTED',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    ACCESS_GRANTED: 'ACCESS_GRANTED',
  },
  SECURITY_RISK_LEVELS: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
  },
}));

// Mock error handling
vi.mock('@/lib/errors', () => ({
  withErrorHandling: vi.fn((handler) => handler),
  ErrorLogger: {
    logError: vi.fn(),
  },
}));

// Mock NextAuth
vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(() => Promise.resolve({
    sub: 'user-123',
    email: 'test@example.com',
    roles: ['ADMIN'],
  })),
}));

describe('Middleware', () => {
  let mockRequest: NextRequest;
  let mockUrl: URL;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a mock URL
    mockUrl = new URL('http://localhost:3000/dashboard');

    // Create a mock request with nextUrl property
    mockRequest = {
      url: mockUrl.toString(),
      nextUrl: {
        pathname: '/dashboard',
      },
    } as any;
  });

  it('allows access to non-admin routes', async () => {
    // Set pathname to a non-admin route
    mockRequest.nextUrl.pathname = '/dashboard';

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toEqual({ next: true });
  });

  it('allows access to admin routes', async () => {
    // Set pathname to an admin route
    mockRequest.nextUrl.pathname = '/admin/dashboard';

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toEqual({ next: true });
  });

  it('allows access to API routes', async () => {
    // Set pathname to an API route
    mockRequest.nextUrl.pathname = '/api/users';

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toEqual({ next: true });
  });

  it('allows access to static files', async () => {
    // Set pathname to a static file
    mockRequest.nextUrl.pathname = '/_next/static/chunk.js';

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toEqual({ next: true });
  });

  it('allows access to favicon', async () => {
    // Set pathname to favicon
    mockRequest.nextUrl.pathname = '/favicon.ico';

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toEqual({ next: true });
  });

  it('allows access to root path', async () => {
    // Set pathname to root
    mockRequest.nextUrl.pathname = '/';

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toEqual({ next: true });
  });

  it('allows access to login page', async () => {
    // Set pathname to login
    mockRequest.nextUrl.pathname = '/login';

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toEqual({ next: true });
  });

  it('allows access to register page', async () => {
    // Set pathname to register
    mockRequest.nextUrl.pathname = '/register';

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toEqual({ next: true });
  });

  it('allows access to any other route', async () => {
    // Set pathname to any other route
    mockRequest.nextUrl.pathname = '/some/other/route';

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toEqual({ next: true });
  });

  it('handles different URL schemes correctly', async () => {
    // Test with HTTPS URL
    const httpsUrl = new URL('https://example.com/dashboard');
    Object.defineProperty(mockRequest, 'url', { value: httpsUrl.toString(), writable: true });
    mockRequest.nextUrl.pathname = '/dashboard';

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toEqual({ next: true });
  });

  it('handles subdomain scenarios correctly', async () => {
    // Test with subdomain URL
    const subdomainUrl = new URL('https://app.example.com/dashboard');
    Object.defineProperty(mockRequest, 'url', { value: subdomainUrl.toString(), writable: true });
    mockRequest.nextUrl.pathname = '/dashboard';

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(NextResponse.redirect).not.toHaveBeenCalled();
    expect(result).toEqual({ next: true });
  });
});
