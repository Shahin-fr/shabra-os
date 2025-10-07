import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorRecoveryManager, builtInStrategies, ErrorRecoveryUtils } from './client-error-recovery';
import { ClientError } from '@/contexts/ErrorContext';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ErrorRecoveryManager', () => {
  let recoveryManager: ErrorRecoveryManager;

  beforeEach(() => {
    recoveryManager = new ErrorRecoveryManager({
      maxRetries: 3,
      baseDelay: 100,
      maxDelay: 1000,
      backoffMultiplier: 2,
      jitter: false,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    recoveryManager.cancelAllRetries();
  });

  it('should register recovery strategy', () => {
    const strategy = {
      name: 'Test Strategy',
      canHandle: vi.fn().mockReturnValue(true),
      execute: vi.fn().mockResolvedValue(true),
      priority: 10,
    };

    recoveryManager.registerStrategy(strategy);
    expect(recoveryManager['strategies']).toContain(strategy);
  });

  it('should sort strategies by priority', () => {
    const strategy1 = {
      name: 'Low Priority',
      canHandle: vi.fn().mockReturnValue(true),
      execute: vi.fn().mockResolvedValue(true),
      priority: 1,
    };

    const strategy2 = {
      name: 'High Priority',
      canHandle: vi.fn().mockReturnValue(true),
      execute: vi.fn().mockResolvedValue(true),
      priority: 10,
    };

    recoveryManager.registerStrategy(strategy1);
    recoveryManager.registerStrategy(strategy2);

    const strategies = recoveryManager['strategies'];
    expect(strategies[0]).toBe(strategy2); // Higher priority first
    expect(strategies[1]).toBe(strategy1);
  });

  it('should attempt recovery using registered strategies', async () => {
    const strategy = {
      name: 'Test Strategy',
      canHandle: vi.fn().mockReturnValue(true),
      execute: vi.fn().mockResolvedValue(true),
      priority: 10,
    };

    recoveryManager.registerStrategy(strategy);

    const error: ClientError = {
      id: 'test-error',
      message: 'Test error',
      type: 'network',
      severity: 'medium',
      timestamp: new Date(),
      retryable: true,
      retryCount: 0,
      maxRetries: 3,
    };

    const result = await recoveryManager.attemptRecovery(error);

    expect(strategy.canHandle).toHaveBeenCalledWith(error);
    expect(strategy.execute).toHaveBeenCalledWith(error);
    expect(result).toBe(true);
  });

  it('should return false when no strategy can handle the error', async () => {
    const strategy = {
      name: 'Test Strategy',
      canHandle: vi.fn().mockReturnValue(false),
      execute: vi.fn().mockResolvedValue(true),
      priority: 10,
    };

    recoveryManager.registerStrategy(strategy);

    const error: ClientError = {
      id: 'test-error',
      message: 'Test error',
      type: 'network',
      severity: 'medium',
      timestamp: new Date(),
      retryable: true,
      retryCount: 0,
      maxRetries: 3,
    };

    const result = await recoveryManager.attemptRecovery(error);

    expect(strategy.canHandle).toHaveBeenCalledWith(error);
    expect(strategy.execute).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should schedule retry with exponential backoff', async () => {
    const retryFn = vi.fn().mockResolvedValue(undefined);
    const onSuccess = vi.fn();
    const onFailure = vi.fn();

    const error: ClientError = {
      id: 'test-error',
      message: 'Test error',
      type: 'network',
      severity: 'medium',
      timestamp: new Date(),
      retryable: true,
      retryCount: 0,
      maxRetries: 3,
    };

    recoveryManager.scheduleRetry(error, retryFn, onSuccess, onFailure);

    // Wait for retry to execute
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(retryFn).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
    expect(onFailure).not.toHaveBeenCalled();
  });

  it('should not retry when max retries reached', () => {
    const retryFn = vi.fn();
    const onFailure = vi.fn();

    const error: ClientError = {
      id: 'test-error',
      message: 'Test error',
      type: 'network',
      severity: 'medium',
      timestamp: new Date(),
      retryable: true,
      retryCount: 3,
      maxRetries: 3,
    };

    recoveryManager.scheduleRetry(error, retryFn, undefined, onFailure);

    expect(retryFn).not.toHaveBeenCalled();
    expect(onFailure).toHaveBeenCalledWith(error);
  });

  it('should cancel retry when cancelRetry is called', () => {
    const retryFn = vi.fn();
    const onSuccess = vi.fn();

    const error: ClientError = {
      id: 'test-error',
      message: 'Test error',
      type: 'network',
      severity: 'medium',
      timestamp: new Date(),
      retryable: true,
      retryCount: 0,
      maxRetries: 3,
    };

    recoveryManager.scheduleRetry(error, retryFn, onSuccess);
    recoveryManager.cancelRetry(error.id);

    // Wait to ensure retry doesn't execute
    setTimeout(() => {
      expect(retryFn).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    }, 200);
  });
});

describe('builtInStrategies', () => {
  it('should have network retry strategy', () => {
    const networkStrategy = builtInStrategies.find(s => s.name === 'Network Retry');
    expect(networkStrategy).toBeDefined();

    const error: ClientError = {
      id: 'test-error',
      message: 'Network error',
      type: 'network',
      severity: 'medium',
      timestamp: new Date(),
      retryable: true,
      retryCount: 0,
      maxRetries: 3,
    };

    expect(networkStrategy?.canHandle(error)).toBe(true);
  });

  it('should have authentication refresh strategy', () => {
    const authStrategy = builtInStrategies.find(s => s.name === 'Authentication Refresh');
    expect(authStrategy).toBeDefined();

    const error: ClientError = {
      id: 'test-error',
      message: 'Auth error',
      type: 'authentication',
      severity: 'medium',
      timestamp: new Date(),
      retryable: true,
      retryCount: 0,
      maxRetries: 3,
    };

    expect(authStrategy?.canHandle(error)).toBe(true);
  });
});

describe('ErrorRecoveryUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createRetryableFunction', () => {
    it('should retry function on failure', async () => {
      let attempt = 0;
      const fn = vi.fn().mockImplementation(() => {
        attempt++;
        if (attempt < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });

      const retryableFn = ErrorRecoveryUtils.createRetryableFunction(fn, {
        maxRetries: 3,
        retryDelay: 10,
      });

      const result = await retryableFn();

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Permanent failure'));

      const retryableFn = ErrorRecoveryUtils.createRetryableFunction(fn, {
        maxRetries: 2,
        retryDelay: 10,
      });

      await expect(retryableFn()).rejects.toThrow('Permanent failure');
      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should not retry when retryCondition returns false', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Non-retryable error'));

      const retryableFn = ErrorRecoveryUtils.createRetryableFunction(fn, {
        maxRetries: 3,
        retryDelay: 10,
        retryCondition: () => false,
      });

      await expect(retryableFn()).rejects.toThrow('Non-retryable error');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('createCircuitBreaker', () => {
    it('should execute function normally when circuit is closed', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const circuitBreaker = ErrorRecoveryUtils.createCircuitBreaker(fn, {
        failureThreshold: 3,
        resetTimeout: 1000,
      });

      const result = await circuitBreaker();

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should open circuit after failure threshold', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Service error'));

      const circuitBreaker = ErrorRecoveryUtils.createCircuitBreaker(fn, {
        failureThreshold: 2,
        resetTimeout: 1000,
      });

      // First two failures should be allowed
      await expect(circuitBreaker()).rejects.toThrow('Service error');
      await expect(circuitBreaker()).rejects.toThrow('Service error');

      // Third call should be rejected immediately
      await expect(circuitBreaker()).rejects.toThrow('Circuit breaker is OPEN');

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should reset circuit after reset timeout', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Service error'))
        .mockRejectedValueOnce(new Error('Service error'))
        .mockResolvedValueOnce('success');

      const circuitBreaker = ErrorRecoveryUtils.createCircuitBreaker(fn, {
        failureThreshold: 2,
        resetTimeout: 100,
      });

      // Trigger circuit opening
      await expect(circuitBreaker()).rejects.toThrow('Service error');
      await expect(circuitBreaker()).rejects.toThrow('Service error');

      // Wait for reset timeout
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should work again
      const result = await circuitBreaker();
      expect(result).toBe('success');
    });
  });

  describe('withTimeout', () => {
    it('should return result when function completes within timeout', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await ErrorRecoveryUtils.withTimeout(fn(), 1000);

      expect(result).toBe('success');
    });

    it('should throw timeout error when function exceeds timeout', async () => {
      const fn = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve('success'), 2000))
      );

      await expect(ErrorRecoveryUtils.withTimeout(fn(), 1000))
        .rejects.toThrow('Operation timed out');
    });
  });

  describe('withFallback', () => {
    it('should return primary result when primary succeeds', async () => {
      const primaryFn = vi.fn().mockResolvedValue('primary success');
      const fallbackFn = vi.fn().mockResolvedValue('fallback success');

      const result = await ErrorRecoveryUtils.withFallback(primaryFn, fallbackFn)();

      expect(result).toBe('primary success');
      expect(primaryFn).toHaveBeenCalledTimes(1);
      expect(fallbackFn).not.toHaveBeenCalled();
    });

    it('should return fallback result when primary fails', async () => {
      const primaryFn = vi.fn().mockRejectedValue(new Error('Primary failed'));
      const fallbackFn = vi.fn().mockResolvedValue('fallback success');

      const result = await ErrorRecoveryUtils.withFallback(primaryFn, fallbackFn)();

      expect(result).toBe('fallback success');
      expect(primaryFn).toHaveBeenCalledTimes(1);
      expect(fallbackFn).toHaveBeenCalledTimes(1);
    });

    it('should throw error when both primary and fallback fail', async () => {
      const primaryFn = vi.fn().mockRejectedValue(new Error('Primary failed'));
      const fallbackFn = vi.fn().mockRejectedValue(new Error('Fallback failed'));

      await expect(ErrorRecoveryUtils.withFallback(primaryFn, fallbackFn)())
        .rejects.toThrow('Fallback failed');
    });

    it('should not use fallback when fallbackCondition returns false', async () => {
      const primaryFn = vi.fn().mockRejectedValue(new Error('Primary failed'));
      const fallbackFn = vi.fn().mockResolvedValue('fallback success');

      await expect(ErrorRecoveryUtils.withFallback(
        primaryFn, 
        fallbackFn, 
        () => false
      )()).rejects.toThrow('Primary failed');

      expect(fallbackFn).not.toHaveBeenCalled();
    });
  });
});
