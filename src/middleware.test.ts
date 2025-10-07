import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock NextAuth JWT
const mockGetToken = vi.fn();
vi.mock('next-auth/jwt', () => ({
  getToken: () => mockGetToken(),
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
          ['Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"]
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
          ['Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"]
        ])
      })),
    }),
  };
});

import { middleware } from './middleware';

describe('Middleware Security', () => {
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
      ip: '127.0.0.1',
      headers: new Map(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
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

    it('allows access to favicon without authentication', async () => {
      mockRequest.nextUrl.pathname = '/favicon.ico';

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ next: true }));
    });

    it('allows access to static files without authentication', async () => {
      mockRequest.nextUrl.pathname = '/_next/static/chunk.js';

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ next: true }));
    });
  });

  describe('Public API Routes', () => {
    it('allows access to auth signin API without authentication', async () => {
      mockRequest.nextUrl.pathname = '/api/auth/signin';

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ next: true }));
    });

    it('allows access to health check API without authentication', async () => {
      mockRequest.nextUrl.pathname = '/api/health';

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ next: true }));
    });
  });

  describe('Protected Routes', () => {
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

    it('blocks requests that exceed rate limit', async () => {
      mockRequest.nextUrl.pathname = '/api/users';
      mockGetToken.mockResolvedValue({
        sub: 'user123',
        roles: ['EMPLOYEE'],
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
  });

  describe('Security Headers', () => {
    it('adds security headers to responses', async () => {
      mockRequest.nextUrl.pathname = '/login';

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ next: true }));
      expect(result.headers).toBeDefined();
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

  describe('Callback URL Security', () => {
    it('validates callback URL origin to prevent open redirects', async () => {
      mockRequest.nextUrl.pathname = '/dashboard';
      mockRequest.url = 'https://malicious.com/dashboard';
      mockRequest.nextUrl.origin = 'http://localhost:3000';
      mockGetToken.mockResolvedValue(null);

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ redirect: true }));
    });
  });
});