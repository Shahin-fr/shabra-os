import { logger } from '../logger';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  skipFailedRequests: boolean;
  blockDurationMs: number;
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
  lastRequest: number;
}

export interface RateLimitStatus {
  remaining: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

export class RateLimiter {
  private store: Map<string, RateLimitEntry>;
  private config: RateLimitConfig;
  private cleanupTimeout?: NodeJS.Timeout;
  private isDestroyed: boolean = false;
  private cleanupCallbacks: (() => void)[] = [];

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      maxRequests: 100,
      windowMs: 15 * 60 * 1000, // 15 minutes
      skipFailedRequests: true,
      blockDurationMs: 5 * 60 * 1000, // 5 minutes
      ...config,
    };

    this.store = new Map();
    this.startCleanup();
  }

  /**
   * Check if a request is allowed
   */
  isAllowed(identifier: string): boolean {
    if (this.isDestroyed) return false;

    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset existing one
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.config.windowMs,
        blocked: false,
        lastRequest: now,
      };
      this.store.set(identifier, newEntry);
      return true;
    }

    // Check if currently blocked
    if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
      return false;
    }

    // Unblock if block duration has passed
    if (entry.blocked && entry.blockUntil && now >= entry.blockUntil) {
      entry.blocked = false;
      entry.blockUntil = undefined;
    }

    // Check rate limit
    if (entry.count >= this.config.maxRequests) {
      // Block the identifier
      entry.blocked = true;
      entry.blockUntil = now + this.config.blockDurationMs;
      return false;
    }

    // Increment count
    entry.count++;
    entry.lastRequest = now;
    return true;
  }

  /**
   * Record a failed request (if skipFailedRequests is false)
   */
  recordFailure(identifier: string): void {
    if (this.isDestroyed || !this.config.skipFailedRequests) return;

    const entry = this.store.get(identifier);
    if (entry) {
      entry.count++;
      entry.lastRequest = Date.now();
    }
  }

  /**
   * Get current rate limit status for an identifier
   */
  getStatus(identifier: string): RateLimitStatus | null {
    if (this.isDestroyed) return null;

    const entry = this.store.get(identifier);
    if (!entry) return null;

    const now = Date.now();
    const remaining = Math.max(0, this.config.maxRequests - entry.count);
    const resetTime = entry.resetTime;
    const blocked =
      entry.blocked && entry.blockUntil ? now < entry.blockUntil : false;
    const blockUntil = entry.blockUntil;

    return {
      remaining,
      resetTime,
      blocked,
      blockUntil,
    };
  }

  /**
   * Get statistics about the rate limiter
   */
  getStats() {
    if (this.isDestroyed) return null;

    const now = Date.now();
    let totalRequests = 0;
    let blockedCount = 0;
    let activeIdentifiers = 0;

    for (const [, entry] of this.store.entries()) {
      if (now <= entry.resetTime) {
        totalRequests += entry.count;
        activeIdentifiers++;
        if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
          blockedCount++;
        }
      }
    }

    return {
      totalRequests,
      blockedCount,
      activeIdentifiers,
      totalIdentifiers: this.store.size,
      config: this.config,
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    if (this.isDestroyed) return;

    const now = Date.now();
    let cleanedCount = 0;

    for (const [identifier, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(identifier);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.debug(`Cleaned up ${cleanedCount} expired rate limit entries`);
    }

    // Schedule next cleanup
    this.scheduleCleanup();
  }

  /**
   * Schedule the next cleanup
   */
  private scheduleCleanup(): void {
    if (this.isDestroyed) return;

    this.cleanupTimeout = setTimeout(() => {
      this.cleanup();
    }, this.config.windowMs);
  }

  /**
   * Start the cleanup process
   */
  private startCleanup(): void {
    this.scheduleCleanup();
  }

  /**
   * Destroy the rate limiter and clean up resources
   */
  public destroy(): void {
    if (this.isDestroyed) return;

    logger.info('Destroying RateLimiter and cleaning up resources');
    this.isDestroyed = true;

    // Clear cleanup timeout
    if (this.cleanupTimeout) {
      clearTimeout(this.cleanupTimeout);
      this.cleanupTimeout = undefined;
    }

    // Clear store
    this.store.clear();

    // Execute cleanup callbacks
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        logger.error('Error in cleanup callback:', error as Error);
      }
    });
    this.cleanupCallbacks = [];

    logger.info('RateLimiter destroyed successfully');
  }

  /**
   * Check if the rate limiter is destroyed
   */
  public isDestroyedState(): boolean {
    return this.isDestroyed;
  }

  /**
   * Add a cleanup callback to be executed when destroying
   */
  public addCleanupCallback(callback: () => void): void {
    if (!this.isDestroyed) {
      this.cleanupCallbacks.push(callback);
    }
  }

  /**
   * Manually trigger cleanup (useful for testing)
   */
  public manualCleanup(): void {
    if (!this.isDestroyed) {
      this.cleanup();
    }
  }
}

// Export a default instance
export const defaultRateLimiter = new RateLimiter();

// Export factory function for creating custom instances
export function createRateLimiter(
  config: Partial<RateLimitConfig> = {}
): RateLimiter {
  return new RateLimiter(config);
}
