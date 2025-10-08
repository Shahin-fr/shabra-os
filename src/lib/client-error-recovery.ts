/**
 * Client-side error recovery mechanisms and retry logic
 */

import { ClientError } from '@/contexts/ErrorContext';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

export interface RecoveryStrategy {
  name: string;
  canHandle: (error: ClientError) => boolean;
  execute: (error: ClientError) => Promise<boolean>;
  priority: number;
}

export class ErrorRecoveryManager {
  private strategies: RecoveryStrategy[] = [];
  private retryConfig: RetryConfig;
  private activeRetries: Map<string, NodeJS.Timeout> = new Map();

  constructor(retryConfig: Partial<RetryConfig> = {}) {
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitter: true,
      ...retryConfig,
    };
  }

  /**
   * Register a recovery strategy
   */
  registerStrategy(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy);
    this.strategies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Attempt to recover from an error using registered strategies
   */
  async attemptRecovery(error: ClientError): Promise<boolean> {
    for (const strategy of this.strategies) {
      if (strategy.canHandle(error)) {
        try {
          const success = await strategy.execute(error);
          if (success) {
            return true;
          }
        } catch (recoveryError) {
          console.warn(`Recovery strategy ${strategy.name} failed:`, recoveryError);
        }
      }
    }
    return false;
  }

  /**
   * Schedule a retry with exponential backoff
   */
  scheduleRetry(
    error: ClientError,
    retryFn: () => Promise<void>,
    onSuccess?: () => void,
    onFailure?: (error: ClientError) => void
  ): void {
    if (error.retryCount >= error.maxRetries) {
      onFailure?.(error);
      return;
    }

    const delay = this.calculateDelay(error.retryCount);
    const timeoutId = setTimeout(async () => {
      try {
        await retryFn();
        onSuccess?.();
        this.activeRetries.delete(error.id);
      } catch (retryError) {
        const updatedError = {
          ...error,
          retryCount: error.retryCount + 1,
        };
        onFailure?.(updatedError);
        this.activeRetries.delete(error.id);
      }
    }, delay);

    this.activeRetries.set(error.id, timeoutId);
  }

  /**
   * Cancel a scheduled retry
   */
  cancelRetry(errorId: string): void {
    const timeoutId = this.activeRetries.get(errorId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.activeRetries.delete(errorId);
    }
  }

  /**
   * Cancel all active retries
   */
  cancelAllRetries(): void {
    this.activeRetries.forEach(timeoutId => clearTimeout(timeoutId));
    this.activeRetries.clear();
  }

  /**
   * Calculate retry delay with exponential backoff and jitter
   */
  private calculateDelay(retryCount: number): number {
    const { baseDelay, maxDelay, backoffMultiplier, jitter } = this.retryConfig;
    
    let delay = baseDelay * Math.pow(backoffMultiplier, retryCount);
    delay = Math.min(delay, maxDelay);

    if (jitter) {
      // Add random jitter to prevent thundering herd
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }
}

// Built-in recovery strategies
export const builtInStrategies: RecoveryStrategy[] = [
  {
    name: 'Network Retry',
    canHandle: (error) => error.type === 'network' && error.retryable,
    execute: async (_error) => {
      // Simple network check
      if (navigator.onLine) {
        return true;
      }
      return false;
    },
    priority: 10,
  },
  {
    name: 'Authentication Refresh',
    canHandle: (error) => error.type === 'authentication',
    execute: async (_error) => {
      try {
        // Attempt to refresh token
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        return response.ok;
      } catch {
        return false;
      }
    },
    priority: 9,
  },
  {
    name: 'Validation Retry',
    canHandle: (error) => error.type === 'validation' && error.retryable,
    execute: async (_error) => {
      // For validation errors, we might want to retry after a short delay
      // This is useful for temporary validation issues
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    },
    priority: 5,
  },
  {
    name: 'Component Reset',
    canHandle: (error) => error.component !== undefined,
    execute: async (_error) => {
      // This would typically trigger a component re-render or reset
      // The actual implementation would depend on the component system
      return true;
    },
    priority: 3,
  },
];

// Error recovery utilities
export class ErrorRecoveryUtils {
  /**
   * Create a retryable function with error handling
   */
  static createRetryableFunction<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options: {
      maxRetries?: number;
      retryDelay?: number;
      retryCondition?: (error: Error) => boolean;
    } = {}
  ) {
    const { maxRetries = 3, retryDelay = 1000, retryCondition } = options;

    return async (...args: T): Promise<R> => {
      let lastError: Error;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await fn(...args);
        } catch (error) {
          lastError = error as Error;

          if (attempt === maxRetries) {
            throw lastError;
          }

          if (retryCondition && !retryCondition(lastError)) {
            throw lastError;
          }

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        }
      }

      throw lastError!;
    };
  }

  /**
   * Create a circuit breaker pattern for API calls
   */
  static createCircuitBreaker<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options: {
      failureThreshold?: number;
      resetTimeout?: number;
      monitoringPeriod?: number;
    } = {}
  ) {
    const { failureThreshold = 5, resetTimeout = 60000, monitoringPeriod: _monitoringPeriod = 10000 } = options;
    
    let failures = 0;
    let lastFailureTime = 0;
    let state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

    return async (...args: T): Promise<R> => {
      const now = Date.now();

      // Check if circuit should be reset
      if (state === 'OPEN' && now - lastFailureTime > resetTimeout) {
        state = 'HALF_OPEN';
      }

      // If circuit is open, reject immediately
      if (state === 'OPEN') {
        throw new Error('Circuit breaker is OPEN');
      }

      try {
        const result = await fn(...args);
        
        // Reset failure count on success
        if (state === 'HALF_OPEN') {
          state = 'CLOSED';
          failures = 0;
        }
        
        return result;
      } catch (error) {
        failures++;
        lastFailureTime = now;

        // Open circuit if failure threshold is reached
        if (failures >= failureThreshold) {
          state = 'OPEN';
        }

        throw error;
      }
    };
  }

  /**
   * Create a timeout wrapper for async operations
   */
  static withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutMessage = 'Operation timed out'
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
      ),
    ]);
  }

  /**
   * Create a fallback mechanism for async operations
   */
  static withFallback<T>(
    primaryFn: () => Promise<T>,
    fallbackFn: () => Promise<T>,
    fallbackCondition?: (error: Error) => boolean
  ) {
    return async (): Promise<T> => {
      try {
        return await primaryFn();
      } catch (error) {
        if (fallbackCondition && !fallbackCondition(error as Error)) {
          throw error;
        }
        return await fallbackFn();
      }
    };
  }
}

// Global error recovery manager instance
export const errorRecoveryManager = new ErrorRecoveryManager();

// Register built-in strategies
builtInStrategies.forEach(strategy => {
  errorRecoveryManager.registerStrategy(strategy);
});

// Export utility functions
export const {
  createRetryableFunction,
  createCircuitBreaker,
  withTimeout,
  withFallback,
} = ErrorRecoveryUtils;
