import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter, createRateLimiter } from '@/lib/security/RateLimiter';
import { logger } from '@/lib/logger';

// Create different rate limiters for different endpoint types
const authRateLimiter = createRateLimiter({
  maxRequests: 5, // 5 attempts
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000, // 30 minutes block
  skipFailedRequests: false, // Count failed attempts
});

const apiRateLimiter = createRateLimiter({
  maxRequests: 100, // 100 requests
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 5 * 60 * 1000, // 5 minutes block
  skipFailedRequests: true, // Don't count failed requests
});

const criticalRateLimiter = createRateLimiter({
  maxRequests: 10, // 10 requests
  windowMs: 60 * 1000, // 1 minute
  blockDurationMs: 10 * 60 * 1000, // 10 minutes block
  skipFailedRequests: false, // Count failed attempts
});

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get IP from various headers (for different deployment scenarios)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
  
  // Include user agent for additional fingerprinting
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return `${ip}-${userAgent.slice(0, 50)}`;
}

/**
 * Rate limiting middleware for API routes
 */
export function withRateLimit(
  request: NextRequest,
  options: {
    type: 'auth' | 'api' | 'critical';
    customLimiter?: RateLimiter;
  }
): { allowed: boolean; response?: NextResponse; status?: any } {
  try {
    const identifier = getClientIdentifier(request);
    const limiter = options.customLimiter || getRateLimiter(options.type);
    
    const allowed = limiter.isAllowed(identifier);
    
    if (!allowed) {
      const status = limiter.getStatus(identifier);
      
      logger.warn('Rate limit exceeded', {
        identifier: identifier.slice(0, 20) + '...', // Log partial identifier
        type: options.type,
        status,
        path: request.nextUrl.pathname,
        method: request.method,
      });
      
      const response = NextResponse.json(
        {
          error: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Please try again later',
          retryAfter: status?.blockUntil ? Math.ceil((status.blockUntil - Date.now()) / 1000) : 60,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': status?.blockUntil ? Math.ceil((status.blockUntil - Date.now()) / 1000).toString() : '60',
            'X-RateLimit-Limit': limiter.getStats()?.config.maxRequests.toString() || '100',
            'X-RateLimit-Remaining': status?.remaining?.toString() || '0',
            'X-RateLimit-Reset': status?.resetTime ? Math.ceil(status.resetTime / 1000).toString() : '0',
          }
        }
      );
      
      return { allowed: false, response, status };
    }
    
    return { allowed: true };
  } catch (error) {
    logger.error('Rate limiting error:', error as Error);
    // Fail open - allow request if rate limiting fails
    return { allowed: true };
  }
}

/**
 * Get the appropriate rate limiter for the endpoint type
 */
function getRateLimiter(type: 'auth' | 'api' | 'critical'): RateLimiter {
  switch (type) {
    case 'auth':
      return authRateLimiter;
    case 'critical':
      return criticalRateLimiter;
    case 'api':
    default:
      return apiRateLimiter;
  }
}

/**
 * Rate limiting middleware for authentication endpoints
 */
export function withAuthRateLimit(request: NextRequest) {
  return withRateLimit(request, { type: 'auth' });
}

/**
 * Rate limiting middleware for critical endpoints
 */
export function withCriticalRateLimit(request: NextRequest) {
  return withRateLimit(request, { type: 'critical' });
}

/**
 * Rate limiting middleware for general API endpoints
 */
export function withApiRateLimit(request: NextRequest) {
  return withRateLimit(request, { type: 'api' });
}

/**
 * Record a failed request for rate limiting
 */
export function recordFailedRequest(
  request: NextRequest,
  type: 'auth' | 'api' | 'critical' = 'api'
): void {
  try {
    const identifier = getClientIdentifier(request);
    const limiter = getRateLimiter(type);
    limiter.recordFailure(identifier);
  } catch (error) {
    logger.error('Failed to record failed request:', error as Error);
  }
}

/**
 * Get rate limit statistics
 */
export function getRateLimitStats() {
  return {
    auth: authRateLimiter.getStats(),
    api: apiRateLimiter.getStats(),
    critical: criticalRateLimiter.getStats(),
  };
}
