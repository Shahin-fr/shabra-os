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

// Mock advanced security modules
vi.mock('@/lib/advanced-security', () => ({
  BruteForceProtection: {
    recordFailedAttempt: vi.fn(),
    recordSuccessfulAttempt: vi.fn(),
    isLocked: vi.fn(),
    getAttemptCount: vi.fn(),
  },
  IPManagement: {
    isBlocked: vi.fn(),
    isWhitelisted: vi.fn(),
    blockIP: vi.fn(),
  },
  AuditLogger: {
    logSecurityEvent: vi.fn(),
    logAuthEvent: vi.fn(),
  },
  SecurityMonitoring: {
    monitorEvent: vi.fn(),
  },
  AUDIT_EVENT_TYPES: {
    BRUTE_FORCE_DETECTED: 'BRUTE_FORCE_DETECTED',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    ACCESS_GRANTED: 'ACCESS_GRANTED',
    ACCESS_DENIED: 'ACCESS_DENIED',
    SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  },
  SECURITY_RISK_LEVELS: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
  },
}));

import { middleware } from './middleware';
import { BruteForceProtection, IPManagement, AuditLogger } from '@/lib/advanced-security';

describe('Advanced Security Middleware', () => {
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
      headers: new Map([
        ['x-forwarded-for', '127.0.0.1'],
        ['user-agent', 'Mozilla/5.0 Test Browser'],
      ]),
    };

    // Reset mocks
    (IPManagement.isBlocked as any).mockReturnValue(false);
    (IPManagement.isWhitelisted as any).mockReturnValue(false);
    (BruteForceProtection.isLocked as any).mockReturnValue(false);
    (BruteForceProtection.recordFailedAttempt as any).mockReturnValue({
      isLocked: false,
      remainingAttempts: 4,
      delay: 1000,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('IP Blocking', () => {
    it('should block requests from blocked IPs', async () => {
      (IPManagement.isBlocked as any).mockReturnValue(true);
      mockRequest.nextUrl.pathname = '/api/users';

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ status: 403 }));
      expect(AuditLogger.logSecurityEvent).toHaveBeenCalledWith(
        'ACCESS_DENIED',
        expect.objectContaining({ ip: '127.0.0.1', reason: 'IP_BLOCKED' }),
        'HIGH',
        undefined,
        '127.0.0.1'
      );
    });

    it('should allow requests from whitelisted IPs to bypass some checks', async () => {
      (IPManagement.isWhitelisted as any).mockReturnValue(true);
      mockRequest.nextUrl.pathname = '/api/users';

      const result = await middleware(mockRequest);

      // Should not trigger rate limiting for whitelisted IPs
      expect(result).not.toEqual(expect.objectContaining({ status: 429 }));
    });
  });

  describe('Brute Force Protection', () => {
    it('should implement brute force protection for auth endpoints', async () => {
      mockRequest.nextUrl.pathname = '/api/auth/signin';
      (BruteForceProtection.recordFailedAttempt as any).mockReturnValue({
        isLocked: true,
        remainingAttempts: 0,
        lockoutDuration: 900000, // 15 minutes
      });

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ status: 429 }));
      expect(result.headers.get('Retry-After')).toBe('900');
      expect(AuditLogger.logSecurityEvent).toHaveBeenCalledWith(
        'BRUTE_FORCE_DETECTED',
        expect.objectContaining({ ip: '127.0.0.1' }),
        'CRITICAL',
        undefined,
        '127.0.0.1'
      );
    });

    it('should block IP after excessive brute force attempts', async () => {
      mockRequest.nextUrl.pathname = '/api/auth/signin';
      (BruteForceProtection as any).recordFailedAttempt.mockReturnValue({
        isLocked: true,
        remainingAttempts: 0,
        lockoutDuration: 900000,
      });
      (BruteForceProtection as any).getAttemptCount.mockReturnValue(10);

      await middleware(mockRequest);

      expect((IPManagement as any).blockIP).toHaveBeenCalledWith(
        '127.0.0.1',
        'Excessive brute force attempts',
        24 * 60 * 60 * 1000
      );
    });

    it('should record failed attempts for auth endpoints', async () => {
      mockRequest.nextUrl.pathname = '/api/auth/signin';
      mockGetToken.mockResolvedValue(null);

      await middleware(mockRequest);

      expect((BruteForceProtection as any).recordFailedAttempt).toHaveBeenCalledWith('127.0.0.1');
      expect((AuditLogger as any).logAuthEvent).toHaveBeenCalledWith(
        'LOGIN_FAILURE',
        'unknown',
        '127.0.0.1',
        expect.objectContaining({ reason: 'INVALID_TOKEN' })
      );
    });

    it('should record successful attempts for auth endpoints', async () => {
      mockRequest.nextUrl.pathname = '/api/auth/signin';
      mockGetToken.mockResolvedValue({
        sub: 'user123',
        roles: ['EMPLOYEE'],
        email: 'user@example.com',
      });

      await middleware(mockRequest);

      expect((BruteForceProtection as any).recordSuccessfulAttempt).toHaveBeenCalledWith('127.0.0.1');
      expect((AuditLogger as any).logAuthEvent).toHaveBeenCalledWith(
        'LOGIN_SUCCESS',
        'user123',
        '127.0.0.1',
        expect.objectContaining({ pathname: '/api/auth/signin' })
      );
    });
  });

  describe('Audit Logging', () => {
    it('should log access granted events', async () => {
      mockRequest.nextUrl.pathname = '/dashboard';
      mockGetToken.mockResolvedValue({
        sub: 'user123',
        roles: ['EMPLOYEE'],
        email: 'user@example.com',
      });

      await middleware(mockRequest);

      expect((AuditLogger as any).logAuthEvent).toHaveBeenCalledWith(
        'ACCESS_GRANTED',
        'user123',
        '127.0.0.1',
        expect.objectContaining({ pathname: '/dashboard' })
      );
    });

    it('should log access denied events for blocked IPs', async () => {
      (IPManagement as any).isBlocked.mockReturnValue(true);
      mockRequest.nextUrl.pathname = '/api/users';

      await middleware(mockRequest);

      expect((AuditLogger as any).logSecurityEvent).toHaveBeenCalledWith(
        'ACCESS_DENIED',
        expect.objectContaining({ ip: '127.0.0.1', reason: 'IP_BLOCKED' }),
        'HIGH',
        undefined,
        '127.0.0.1'
      );
    });

    it('should log suspicious activity for untrusted origins', async () => {
      mockRequest.nextUrl.pathname = '/api/users';
      mockRequest.headers.set('origin', 'https://malicious.com');

      await middleware(mockRequest);

      expect((AuditLogger as any).logSecurityEvent).toHaveBeenCalledWith(
        'SUSPICIOUS_ACTIVITY',
        expect.objectContaining({ 
          ip: '127.0.0.1', 
          origin: 'https://malicious.com',
          activity: 'UNTRUSTED_ORIGIN'
        }),
        'HIGH',
        undefined,
        '127.0.0.1'
      );
    });
  });

  describe('Progressive Delays', () => {
    it('should implement progressive delays for failed attempts', async () => {
      mockRequest.nextUrl.pathname = '/api/auth/signin';
      mockGetToken.mockResolvedValue(null);
      (BruteForceProtection as any).recordFailedAttempt.mockReturnValue({
        isLocked: false,
        remainingAttempts: 3,
        delay: 2000,
      });

      const startTime = Date.now();
      await middleware(mockRequest);
      const endTime = Date.now();

      // Should have some delay (allowing for test execution time)
      expect(endTime - startTime).toBeGreaterThan(1000);
    });
  });

  describe('Login Page Protection', () => {
    it('should protect login page from brute force attacks', async () => {
      mockRequest.nextUrl.pathname = '/login';
      (BruteForceProtection as any).recordFailedAttempt.mockReturnValue({
        isLocked: true,
        remainingAttempts: 0,
        lockoutDuration: 900000,
      });

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ redirect: true }));
      expect(result.url).toContain('error=Too many attempts');
    });

    it('should redirect to login with error message for locked accounts', async () => {
      mockRequest.nextUrl.pathname = '/login';
      (BruteForceProtection as any).recordFailedAttempt.mockReturnValue({
        isLocked: true,
        remainingAttempts: 0,
        lockoutDuration: 900000,
      });

      const result = await middleware(mockRequest);

      expect(result.url).toContain('error=Too many attempts. Please try again later.');
    });
  });

  describe('Error Handling', () => {
    it('should handle token validation errors gracefully', async () => {
      mockRequest.nextUrl.pathname = '/api/users';
      mockGetToken.mockRejectedValue(new Error('Token validation failed'));

      await middleware(mockRequest);

      expect((BruteForceProtection as any).recordFailedAttempt).toHaveBeenCalledWith('127.0.0.1');
      expect((AuditLogger as any).logAuthEvent).toHaveBeenCalledWith(
        'LOGIN_FAILURE',
        'unknown',
        '127.0.0.1',
        expect.objectContaining({ reason: 'TOKEN_VALIDATION_ERROR' })
      );
    });

    it('should handle session validation errors for page routes', async () => {
      mockRequest.nextUrl.pathname = '/dashboard';
      mockGetToken.mockRejectedValue(new Error('Session validation failed'));

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ redirect: true }));
      expect((AuditLogger as any).logAuthEvent).toHaveBeenCalledWith(
        'LOGIN_FAILURE',
        'unknown',
        '127.0.0.1',
        expect.objectContaining({ reason: 'SESSION_VALIDATION_ERROR' })
      );
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete attack scenario', async () => {
      // Simulate blocked IP
      (IPManagement as any).isBlocked.mockReturnValue(true);
      mockRequest.nextUrl.pathname = '/api/users';

      const result = await middleware(mockRequest);

      expect(result).toEqual(expect.objectContaining({ status: 403 }));
      expect((AuditLogger as any).logSecurityEvent).toHaveBeenCalledWith(
        'ACCESS_DENIED',
        expect.objectContaining({ reason: 'IP_BLOCKED' }),
        'HIGH',
        undefined,
        '127.0.0.1'
      );
    });

    it('should handle whitelisted IP bypassing protection', async () => {
      (IPManagement as any).isWhitelisted.mockReturnValue(true);
      mockRequest.nextUrl.pathname = '/api/auth/signin';
      mockGetToken.mockResolvedValue({
        sub: 'user123',
        roles: ['EMPLOYEE'],
        email: 'user@example.com',
      });

      const result = await middleware(mockRequest);

      // Should not trigger brute force protection for whitelisted IPs
      expect((BruteForceProtection as any).recordFailedAttempt).not.toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ next: true }));
    });
  });
});
