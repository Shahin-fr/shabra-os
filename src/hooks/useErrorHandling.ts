'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useErrorContext, useErrorHandler } from '@/contexts/ErrorContext';
import { errorReporter } from '@/lib/client-error-reporting';
import { errorRecoveryManager } from '@/lib/client-error-recovery';
import { createRetryableFunction, withTimeout, withFallback } from '@/lib/client-error-recovery';

export interface UseErrorHandlingOptions {
  enableReporting?: boolean;
  enableRecovery?: boolean;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  fallbackFn?: () => Promise<any>;
}

export function useErrorHandling(options: UseErrorHandlingOptions = {}) {
  const {
    enableReporting = true,
    enableRecovery = true,
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    timeout,
    fallbackFn,
  } = options;

  const { state, removeError, updateError } = useErrorContext();
  const { handleError } = useErrorHandler();
  const retryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      retryTimeouts.current.forEach(timeout => clearTimeout(timeout));
      retryTimeouts.current.clear();
    };
  }, []);

  // Enhanced error handler with recovery and reporting
  const handleErrorWithRecovery = useCallback(async (
    error: Error,
    options: {
      type?: 'network' | 'validation' | 'authentication' | 'authorization' | 'unknown';
      severity?: 'low' | 'medium' | 'high' | 'critical';
      context?: Record<string, any>;
      component?: string;
      retryable?: boolean;
      maxRetries?: number;
      recovery?: boolean;
    } = {}
  ) => {
    const {
      type = 'unknown',
      severity = 'medium',
      context = {},
      component,
      retryable = false,
      maxRetries: errorMaxRetries = maxRetries,
      recovery = enableRecovery,
    } = options;

    // Add error to context
    handleError(error, {
      type,
      severity,
      context,
      component,
      retryable,
      maxRetries: errorMaxRetries,
    });

    // Report error if enabled
    if (enableReporting) {
      const clientError = state.errors[state.errors.length - 1]; // Get the last added error
      if (clientError) {
        await errorReporter.reportError(clientError, context);
      }
    }

    // Attempt recovery if enabled
    if (recovery && retryable) {
      const clientError = state.errors[state.errors.length - 1];
      if (clientError) {
        const recovered = await errorRecoveryManager.attemptRecovery(clientError);
        if (recovered) {
          errorReporter.trackRecovery(clientError.id, 'automatic');
          removeError(clientError.id);
          return true;
        }
      }
    }

    return false;
  }, [handleError, state.errors, enableReporting, enableRecovery, maxRetries, removeError]);

  // Enhanced async error handler
  const handleAsyncErrorWithRecovery = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: Parameters<typeof handleErrorWithRecovery>[1] = {}
  ): Promise<T | null> => {
    try {
      let fn = asyncFn;

      // Add timeout if specified
      if (timeout) {
        fn = () => withTimeout(asyncFn(), timeout);
      }

      // Add fallback if specified
      if (fallbackFn) {
        fn = withFallback(asyncFn, fallbackFn);
      }

      // Add retry logic if enabled
      if (enableRetry && options.retryable !== false) {
        fn = createRetryableFunction(asyncFn, {
          maxRetries: options.maxRetries || maxRetries,
          retryDelay,
          retryCondition: (error) => {
            // Only retry on network errors or specific error types
            return error.name === 'NetworkError' || 
                   error.message.includes('timeout') ||
                   error.message.includes('network');
          },
        });
      }

      return await fn();
    } catch (error) {
      const recovered = await handleErrorWithRecovery(error as Error, options);
      return recovered ? null : null;
    }
  }, [handleErrorWithRecovery, timeout, fallbackFn, enableRetry, maxRetries, retryDelay]);

  // Retry function with exponential backoff
  const retryWithBackoff = useCallback(async (
    errorId: string,
    retryFn: () => Promise<void>
  ): Promise<void> => {
    const error = state.errors.find(e => e.id === errorId);
    if (!error || !error.retryable || error.retryCount >= error.maxRetries) {
      return;
    }

    // Cancel any existing retry for this error
    const existingTimeout = retryTimeouts.current.get(errorId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Calculate delay with exponential backoff
    const delay = retryDelay * Math.pow(2, error.retryCount);
    const jitter = delay * 0.1 * Math.random(); // Add 10% jitter
    const finalDelay = Math.min(delay + jitter, 30000); // Cap at 30 seconds

    const timeoutId = setTimeout(async () => {
      try {
        await retryFn();
        errorReporter.trackRetry(errorId, error.retryCount + 1);
        removeError(errorId);
      } catch (retryError) {
        updateError(errorId, {
          retryCount: error.retryCount + 1,
        });
        errorReporter.trackRetry(errorId, error.retryCount + 1);
      }
      retryTimeouts.current.delete(errorId);
    }, finalDelay);

    retryTimeouts.current.set(errorId, timeoutId);
  }, [state.errors, retryDelay, removeError, updateError]);

  // Clear error function
  const clearError = useCallback((errorId: string) => {
    const timeout = retryTimeouts.current.get(errorId);
    if (timeout) {
      clearTimeout(timeout);
      retryTimeouts.current.delete(errorId);
    }
    removeError(errorId);
  }, [removeError]);

  // Clear all errors function
  const clearAllErrors = useCallback(() => {
    retryTimeouts.current.forEach(timeout => clearTimeout(timeout));
    retryTimeouts.current.clear();
    // This would need to be implemented in the context
    // clearErrors();
  }, [retryTimeouts]);

  // Get errors by type
  const getErrorsByType = useCallback((type: string) => {
    return state.errors.filter(error => error.type === type);
  }, [state.errors]);

  // Get errors by severity
  const getErrorsBySeverity = useCallback((severity: string) => {
    return state.errors.filter(error => error.severity === severity);
  }, [state.errors]);

  // Get retryable errors
  const getRetryableErrors = useCallback(() => {
    return state.errors.filter(error => 
      error.retryable && error.retryCount < error.maxRetries
    );
  }, [state.errors]);

  // Check if there are critical errors
  const hasCriticalErrors = useCallback(() => {
    return state.errors.some(error => error.severity === 'critical');
  }, [state.errors]);

  // Check if there are retryable errors
  const hasRetryableErrors = useCallback(() => {
    return getRetryableErrors().length > 0;
  }, [getRetryableErrors]);

  return {
    // Error state
    errors: state.errors,
    isOnline: state.isOnline,
    globalError: state.globalError,
    
    // Error handling functions
    handleError: handleErrorWithRecovery,
    handleAsyncError: handleAsyncErrorWithRecovery,
    clearError,
    clearAllErrors,
    
    // Retry functions
    retryError: retryWithBackoff,
    retryAllErrors: () => {
      getRetryableErrors().forEach(error => {
        retryWithBackoff(error.id, async () => {
          // This would need to be implemented based on the specific error
          console.log(`Retrying error ${error.id}`);
        });
      });
    },
    
    // Utility functions
    getErrorsByType,
    getErrorsBySeverity,
    getRetryableErrors,
    hasCriticalErrors,
    hasRetryableErrors,
    
    // Error counts
    errorCount: state.errors.length,
    criticalErrorCount: getErrorsBySeverity('critical').length,
    retryableErrorCount: getRetryableErrors().length,
  };
}
