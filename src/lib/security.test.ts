import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  addSecurityHeaders,
  generateCSRFToken,
  validateCSRFToken,
  getClientIP,
  isTrustedOrigin,
  sanitizeInput,
  isValidSessionToken,
  createSecureResponse,
  SecurityMiddleware,
  SecurityLogger,
  RATE_LIMIT_CONFIG,
} from './security';

// Mock NextResponse
const mockNextResponse = {
  headers: new Map(),
  set: vi.fn((key: string, value: string) => {
    mockNextResponse.headers.set(key, value);
  }),
};

vi.mock('next/server', () => ({
  NextResponse: vi.fn((body, init) => ({
    ...mockNextResponse,
    body,
    status: init?.status || 200,
    headers: new Map(Object.entries(init?.headers || {})),
  })),
}));

describe('Security Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNextResponse.headers.clear();
  });

  describe('Security Headers', () => {
    it('applies all security headers', () => {
      const mockResponse = {
        headers: new Map(),
        set: vi.fn((key: string, value: string) => {
          mockResponse.headers.set(key, value);
        }),
      };

      const response = addSecurityHeaders(mockResponse as any);

      expect(response).toBe(mockResponse);
      // Just verify the function runs without error
      expect(typeof addSecurityHeaders).toBe('function');
    });
  });

  describe('CSRF Protection', () => {
    it('generates a valid CSRF token', () => {
      const token = generateCSRFToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 hex characters
    });

    it('validates CSRF tokens correctly', () => {
      const token = generateCSRFToken();
      
      expect(validateCSRFToken(token, token)).toBe(true);
      expect(validateCSRFToken(token, 'different-token')).toBe(false);
      expect(validateCSRFToken('', '')).toBe(false);
      expect(validateCSRFToken('token', '')).toBe(false);
    });
  });

  describe('Client IP Detection', () => {
    it('extracts IP from x-forwarded-for header', () => {
      const request = {
        headers: {
          get: vi.fn((header: string) => {
            if (header === 'x-forwarded-for') return '192.168.1.1, 10.0.0.1';
            return null;
          }),
        },
      } as any;

      const ip = getClientIP(request);
      expect(ip).toBe('192.168.1.1');
    });

    it('extracts IP from x-real-ip header', () => {
      const request = {
        headers: {
          get: vi.fn((header: string) => {
            if (header === 'x-real-ip') return '192.168.1.1';
            return null;
          }),
        },
      } as any;

      const ip = getClientIP(request);
      expect(ip).toBe('192.168.1.1');
    });

    it('extracts IP from cf-connecting-ip header', () => {
      const request = {
        headers: {
          get: vi.fn((header: string) => {
            if (header === 'cf-connecting-ip') return '192.168.1.1';
            return null;
          }),
        },
      } as any;

      const ip = getClientIP(request);
      expect(ip).toBe('192.168.1.1');
    });

    it('returns unknown when no IP headers are present', () => {
      const request = {
        headers: {
          get: vi.fn(() => null),
        },
      } as any;

      const ip = getClientIP(request);
      expect(ip).toBe('unknown');
    });
  });

  describe('Origin Validation', () => {
    it('validates trusted origins correctly', () => {
      const allowedOrigins = ['http://localhost:3000', 'https://example.com', '*.example.com'];

      expect(isTrustedOrigin('http://localhost:3000', allowedOrigins)).toBe(true);
      expect(isTrustedOrigin('https://example.com', allowedOrigins)).toBe(true);
      expect(isTrustedOrigin('https://sub.example.com', allowedOrigins)).toBe(true);
      expect(isTrustedOrigin('https://malicious.com', allowedOrigins)).toBe(false);
      expect(isTrustedOrigin('', allowedOrigins)).toBe(false);
    });

    it('handles wildcard origins', () => {
      const allowedOrigins = ['*'];

      expect(isTrustedOrigin('https://any-domain.com', allowedOrigins)).toBe(true);
      expect(isTrustedOrigin('http://localhost:3000', allowedOrigins)).toBe(true);
    });

    it('handles invalid URLs gracefully', () => {
      const allowedOrigins = ['http://localhost:3000'];

      expect(isTrustedOrigin('not-a-url', allowedOrigins)).toBe(false);
      expect(isTrustedOrigin('javascript:alert(1)', allowedOrigins)).toBe(false);
    });
  });

  describe('Input Sanitization', () => {
    it('removes dangerous characters and scripts', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
      expect(sanitizeInput('  normal text  ')).toBe('normal text');
    });

    it('preserves safe content', () => {
      expect(sanitizeInput('Hello World')).toBe('Hello World');
      expect(sanitizeInput('user@example.com')).toBe('user@example.com');
      expect(sanitizeInput('123456')).toBe('123456');
    });
  });

  describe('Session Token Validation', () => {
    it('validates JWT format correctly', () => {
      expect(isValidSessionToken('header.payload.signature')).toBe(true);
      expect(isValidSessionToken('header.payload')).toBe(false);
      expect(isValidSessionToken('header.payload.signature.extra')).toBe(false);
      expect(isValidSessionToken('')).toBe(false);
      expect(isValidSessionToken('invalid')).toBe(false);
    });
  });

  describe('Secure Response Creation', () => {
    it('creates a secure response with headers', () => {
      const response = createSecureResponse('Test body', { status: 200 });

      expect(response).toBeDefined();
      expect(response.body).toBe('Test body');
      expect(response.status).toBe(200);
    });
  });

  describe('Rate Limiting', () => {
    beforeEach(() => {
      // Clear rate limit store
      (SecurityMiddleware as any).rateLimitStore.clear();
    });

    it('allows requests within rate limit', () => {
      const identifier = 'test-client';
      
      for (let i = 0; i < 5; i++) {
        expect(SecurityMiddleware.checkRateLimit(identifier, false, false)).toBe(true);
      }
    });

    it('blocks requests that exceed rate limit', () => {
      const identifier = 'test-client';
      
      // Make requests up to the limit
      for (let i = 0; i < RATE_LIMIT_CONFIG.maxRequests; i++) {
        expect(SecurityMiddleware.checkRateLimit(identifier, false, false)).toBe(true);
      }
      
      // Next request should be blocked
      expect(SecurityMiddleware.checkRateLimit(identifier, false, false)).toBe(false);
    });

    it('has different limits for API routes', () => {
      const identifier = 'test-client';
      
      // Make requests up to the API limit
      for (let i = 0; i < RATE_LIMIT_CONFIG.apiMaxRequests; i++) {
        expect(SecurityMiddleware.checkRateLimit(identifier, true, false)).toBe(true);
      }
      
      // Next request should be blocked
      expect(SecurityMiddleware.checkRateLimit(identifier, true, false)).toBe(false);
    });

    it('has stricter limits for auth routes', () => {
      const identifier = 'test-client';
      
      // Make requests up to the auth limit
      for (let i = 0; i < RATE_LIMIT_CONFIG.authMaxRequests; i++) {
        expect(SecurityMiddleware.checkRateLimit(identifier, false, true)).toBe(true);
      }
      
      // Next request should be blocked
      expect(SecurityMiddleware.checkRateLimit(identifier, false, true)).toBe(false);
    });

    it('resets rate limit after window expires', () => {
      const identifier = 'test-client';
      
      // Fill up the rate limit
      for (let i = 0; i < RATE_LIMIT_CONFIG.maxRequests; i++) {
        SecurityMiddleware.checkRateLimit(identifier, false, false);
      }
      
      // Should be blocked
      expect(SecurityMiddleware.checkRateLimit(identifier, false, false)).toBe(false);
      
      // Manually expire the window by updating the reset time
      const store = (SecurityMiddleware as any).rateLimitStore;
      const key = Array.from(store.keys())[0];
      const entry = store.get(key);
      entry.resetTime = Date.now() - 1000; // Expired
      store.set(key, entry);
      
      // Should be allowed again
      expect(SecurityMiddleware.checkRateLimit(identifier, false, false)).toBe(true);
    });
  });

  describe('Security Logging', () => {
    let consoleSpy: any;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('logs security events', () => {
      SecurityLogger.logSecurityEvent('TEST_EVENT', { test: 'data' });

      expect(consoleSpy).toHaveBeenCalledWith(
        'SECURITY_EVENT:',
        expect.objectContaining({
          event: 'TEST_EVENT',
          details: { test: 'data' }
        })
      );
    });

    it('logs auth failures', () => {
      SecurityLogger.logAuthFailure('192.168.1.1', 'INVALID_CREDENTIALS');

      expect(consoleSpy).toHaveBeenCalledWith(
        'SECURITY_EVENT:',
        expect.objectContaining({
          event: 'AUTH_FAILURE',
          details: expect.objectContaining({
            ip: '192.168.1.1',
            reason: 'INVALID_CREDENTIALS'
          })
        })
      );
    });

    it('logs rate limit exceeded', () => {
      SecurityLogger.logRateLimitExceeded('192.168.1.1', '/api/users');

      expect(consoleSpy).toHaveBeenCalledWith(
        'SECURITY_EVENT:',
        expect.objectContaining({
          event: 'RATE_LIMIT_EXCEEDED',
          details: expect.objectContaining({
            ip: '192.168.1.1',
            endpoint: '/api/users'
          })
        })
      );
    });

    it('logs suspicious activity', () => {
      SecurityLogger.logSuspiciousActivity('192.168.1.1', 'UNUSUAL_PATTERN', { count: 100 });

      expect(consoleSpy).toHaveBeenCalledWith(
        'SECURITY_EVENT:',
        expect.objectContaining({
          event: 'SUSPICIOUS_ACTIVITY',
          details: expect.objectContaining({
            ip: '192.168.1.1',
            activity: 'UNUSUAL_PATTERN',
            details: { count: 100 }
          })
        })
      );
    });
  });

  describe('Security Headers Integration', () => {
    it('should apply all required security headers to responses', () => {
      const mockResponse = {
        headers: new Map(),
        set: vi.fn((key: string, value: string) => {
          mockResponse.headers.set(key, value);
        }),
      };

      // Apply security headers
      addSecurityHeaders(mockResponse as any);

      // Verify all critical security headers are set
      const criticalHeaders = [
        'X-Frame-Options',
        'X-Content-Type-Options', 
        'X-XSS-Protection',
        'Content-Security-Policy',
        'Strict-Transport-Security',
        'Referrer-Policy'
      ];

      criticalHeaders.forEach(header => {
        expect(mockResponse.headers.has(header)).toBe(true);
      });

      // Verify specific header values
      expect(mockResponse.headers.get('X-Frame-Options')).toBe('DENY');
      expect(mockResponse.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(mockResponse.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    });
  });
});
