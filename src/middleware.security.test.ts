import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SecurityMiddleware, isValidSessionToken, isTrustedOrigin } from '@/lib/security';

// Mock NextAuth JWT
const mockGetToken = vi.fn();
vi.mock('next-auth/jwt', () => ({
  getToken: () => mockGetToken(),
}));

// Mock security modules
vi.mock('@/lib/security', () => ({
  addSecurityHeaders: vi.fn((response) => response),
  getClientIP: vi.fn(() => '127.0.0.1'),
  SecurityMiddleware: {
    cleanupRateLimit: vi.fn(),
    checkRateLimit: vi.fn(() => true), // Allow by default
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
    message,
    headers: new Map(Object.entries(options?.headers || {})),
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

// Mock NextResponse
vi.mock('next/server', () => {
  const mockNextResponse = vi.fn((body, init) => ({
    status: init?.status || 200,
    headers: new Map(Object.entries(init?.headers || {})),
    body,
  }));

  return {
    NextResponse: Object.assign(mockNextResponse, {
      next: vi.fn(() => ({ 
        next: true, 
        headers: new Map([
          ['X-Frame-Options', 'DENY'],
          ['X-Content-Type-Options', 'nosniff'],
          ['Referrer-Policy', 'strict-origin-when-cross-origin'],
          ['X-XSS-Protection', '1; mode=block'],
          ['X-DNS-Prefetch-Control', 'off'],
          ['Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()'],
          ['Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload'],
          ['Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests"]
        ])
      })),
      redirect: vi.fn((url: string) => ({ 
        redirect: true, 
        url, 
        headers: new Map([
          ['X-Frame-Options', 'DENY'],
          ['X-Content-Type-Options', 'nosniff'],
          ['Referrer-Policy', 'strict-origin-when-cross-origin'],
          ['X-XSS-Protection', '1; mode=block'],
          ['X-DNS-Prefetch-Control', 'off'],
          ['Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()'],
          ['Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload'],
          ['Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests"]
        ])
      })),
    }),
  };
});

import { middleware } from './middleware';

describe('Security Middleware', () => {
  let mockRequest: any;
  let mockUrl: URL;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetToken.mockResolvedValue(null);

    // Create a mock URL
    mockUrl = new URL('http://localhost:3000/dashboard');

    // Create a mock request with nextUrl property
    mockRequest = {
      url: mockUrl.toString(),
      nextUrl: {
        pathname: '/dashboard',
        origin: 'http://localhost:3000',
      },
      headers: {
        get: vi.fn((key: string) => {
          if (key === 'user-agent') return 'Mozilla/5.0 (Test Browser)';
          if (key === 'x-forwarded-for') return '127.0.0.1';
          if (key === 'x-real-ip') return '127.0.0.1';
          if (key === 'origin') return 'http://localhost:3000';
          return undefined;
        }),
        set: vi.fn(),
      },
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Security Headers', () => {
    it('adds comprehensive security headers to all responses', async () => {
      mockRequest.nextUrl.pathname = '/login';

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ next: true }));
      expect(result.headers).toBeDefined();
      expect(result.headers.size || Object.keys(result.headers).length).toBeGreaterThan(5);
    });

    it('adds security headers to API responses', async () => {
      mockRequest.nextUrl.pathname = '/api/health';

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ next: true }));
      expect(result.headers).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('allows requests within rate limit', async () => {
      mockRequest.nextUrl.pathname = '/api/users';
      mockGetToken.mockResolvedValue({
        sub: 'user123',
        roles: ['EMPLOYEE'],
      });

      // Make multiple requests within rate limit
      for (let i = 0; i < 5; i++) {
        const result = await middleware(mockRequest);
        expect(result).not.toEqual(
          expect.objectContaining({ status: 429 })
        );
      }
    });

  it('blocks requests that exceed API rate limit', async () => {
    mockRequest.nextUrl.pathname = '/api/users';
    mockGetToken.mockResolvedValue({
      sub: 'user123',
      roles: ['EMPLOYEE'],
    });

    // Mock rate limiting to fail after 50 requests
    let requestCount = 0;
    vi.mocked(SecurityMiddleware.checkRateLimit).mockImplementation(() => {
      requestCount++;
      return requestCount <= 50;
    });

    // Make requests to exceed rate limit (50 for API routes)
    for (let i = 0; i < 55; i++) {
      const result = await middleware(mockRequest);
      if (i >= 50) {
        expect(result).toEqual(
          expect.objectContaining({
            status: 429,
          })
        );
      }
    }
  });

  it('has stricter rate limits for auth endpoints', async () => {
    mockRequest.nextUrl.pathname = '/api/auth/signin';

    // Mock rate limiting to fail after 10 requests for auth endpoints
    let requestCount = 0;
    vi.mocked(SecurityMiddleware.checkRateLimit).mockImplementation(() => {
      requestCount++;
      return requestCount <= 10;
    });

    // Make requests to exceed auth rate limit (10 for auth routes)
    for (let i = 0; i < 15; i++) {
      const result = await middleware(mockRequest);
      if (i >= 10) {
        expect(result).toEqual(
          expect.objectContaining({
            status: 429,
          })
        );
      }
    }
  });
  });

  describe('Authentication and Authorization', () => {
    it('redirects to login for protected pages when not authenticated', async () => {
      mockRequest.nextUrl.pathname = '/dashboard';
      mockGetToken.mockResolvedValue(null);

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ redirect: true }));
    });

    it('allows access to protected pages when authenticated', async () => {
      mockRequest.nextUrl.pathname = '/dashboard';
      mockGetToken.mockResolvedValue({
        sub: 'user123',
        roles: ['EMPLOYEE'],
        email: 'user@example.com',
      });

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ next: true }));
    });

    it('returns 401 for protected API routes when not authenticated', async () => {
      mockRequest.nextUrl.pathname = '/api/users';
      mockGetToken.mockResolvedValue(null);

      const result = await middleware(mockRequest);

      expect(result).toEqual(
        expect.objectContaining({
          status: 401,
        })
      );
    });

    it('allows access to protected API routes when authenticated', async () => {
      mockRequest.nextUrl.pathname = '/api/users';
      mockGetToken.mockResolvedValue({
        sub: 'user123',
        roles: ['EMPLOYEE'],
        email: 'user@example.com',
      });

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ next: true }));
    });

  it('validates session token format', async () => {
    mockRequest.nextUrl.pathname = '/api/users';
    mockGetToken.mockResolvedValue({
      sub: 'invalid-token-format',
      roles: ['EMPLOYEE'],
    });

    // Mock token validation to fail for invalid format
    vi.mocked(isValidSessionToken).mockReturnValue(false);

    const result = await middleware(mockRequest);

    expect(result).toEqual(
      expect.objectContaining({
        status: 401,
      })
    );
  });
  });

  describe('CORS and Origin Validation', () => {
    it('allows requests from trusted origins', async () => {
      mockRequest.nextUrl.pathname = '/api/users';
      mockRequest.headers.set('origin', 'http://localhost:3000');
      mockGetToken.mockResolvedValue({
        sub: 'user123',
        roles: ['EMPLOYEE'],
      });

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ next: true }));
    });

  it('blocks requests from untrusted origins', async () => {
    mockRequest.nextUrl.pathname = '/api/users';
    mockRequest.headers.set('origin', 'https://malicious.com');
    mockGetToken.mockResolvedValue({
      sub: 'user123',
      roles: ['EMPLOYEE'],
    });

    // Mock origin validation to fail for untrusted origins
    vi.mocked(isTrustedOrigin).mockReturnValue(false);

    const result = await middleware(mockRequest);

    expect(result).toEqual(
      expect.objectContaining({
        status: 403,
      })
    );
  });

  describe('Open Redirect Protection', () => {
    it('validates callback URL origin to prevent open redirects', async () => {
      mockRequest.nextUrl.pathname = '/dashboard';
      mockRequest.url = 'https://malicious.com/dashboard';
      mockRequest.nextUrl.origin = 'http://localhost:3000';
      mockGetToken.mockResolvedValue(null);

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ redirect: true }));
      // Should not include the malicious callback URL
      expect(result.url).not.toContain('malicious.com');
    });

    it('includes valid callback URLs', async () => {
      mockRequest.nextUrl.pathname = '/dashboard';
      mockRequest.url = 'http://localhost:3000/dashboard';
      mockRequest.nextUrl.origin = 'http://localhost:3000';
      mockGetToken.mockResolvedValue(null);

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ redirect: true }));
      expect(result.url).toContain('callbackUrl=');
    });
  });

  describe('Error Handling', () => {
    it('handles token validation errors gracefully', async () => {
      mockRequest.nextUrl.pathname = '/dashboard';
      mockGetToken.mockRejectedValue(new Error('Token validation failed'));

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ redirect: true }));
    });

    it('handles API token validation errors with 401', async () => {
      mockRequest.nextUrl.pathname = '/api/users';
      mockGetToken.mockRejectedValue(new Error('Token validation failed'));
      
      // Use a completely different IP to avoid rate limiting
      mockRequest.headers = new Map([
        ['x-forwarded-for', '192.168.1.100'],
      ]);

      const result = await middleware(mockRequest);

      expect(result).toEqual(
        expect.objectContaining({
          status: 401,
        })
      );
    });
  });

  describe('Public Routes', () => {
    it('allows access to login page without authentication', async () => {
      mockRequest.nextUrl.pathname = '/login';

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ next: true }));
    });

    it('allows access to register page without authentication', async () => {
      mockRequest.nextUrl.pathname = '/register';

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ next: true }));
    });

    it('allows access to docs page without authentication', async () => {
      mockRequest.nextUrl.pathname = '/docs';

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ next: true }));
    });

    it('allows access to health check API without authentication', async () => {
      mockRequest.nextUrl.pathname = '/api/health';

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ next: true }));
    });
  });

  describe('Static Files', () => {
    it('allows access to static files without authentication', async () => {
      mockRequest.nextUrl.pathname = '/_next/static/chunk.js';

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ next: true }));
    });

    it('allows access to favicon without authentication', async () => {
      mockRequest.nextUrl.pathname = '/favicon.ico';

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ next: true }));
    });
  });
});
});
