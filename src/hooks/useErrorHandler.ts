/**
 * React Hook for Unified Error Handling
 *
 * This hook provides a consistent way to handle errors in React components,
 * integrating with the consolidated state management and error tracking system.
 */

import { useCallback, useState, useRef, useEffect } from 'react';
import { ErrorHandler, ErrorHandlingResult } from '@/lib/error-handler';
import { useAppStore } from '@/stores/consolidated-store';
import { ErrorCategory, ErrorPriority, ErrorContext } from '@/types/error';

export interface UseErrorHandlerOptions {
  component: string;
  action?: string;
  autoTrack?: boolean;
  enableNotifications?: boolean;
  enableRetry?: boolean;
  maxRetries?: number;
  onError?: (_error: Error, _context: ErrorContext) => void;
  onSuccess?: (_data: any) => void;
}

export interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  category: ErrorCategory | null;
  priority: ErrorPriority | null;
  retryable: boolean;
  suggestions: string[];
  userMessage: string;
  timestamp: Date | null;
}

export interface ErrorActions {
  handleError: (_error: Error | string | unknown, _context?: Partial<ErrorContext>
  ) => string;
  clearError: () => void;
  retry: () => void;
  executeWithErrorHandling: <T>(_operation: () => Promise<T>,
    context?: Partial<ErrorContext>
  ) => Promise<ErrorHandlingResult<T>>;
  executeWithRetry: <T>(_operation: () => Promise<T>,
    context?: Partial<ErrorContext>
  ) => Promise<T>;
  executeApiCall: <T>(_apiCall: () => Promise<T>,
    apiContext?: { [key: string]: any }
  ) => Promise<ErrorHandlingResult<T>>;
}

export function useErrorHandler(options: UseErrorHandlerOptions) {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorId: null,
    category: null,
    priority: null,
    retryable: false,
    suggestions: [],
    userMessage: '',
    timestamp: null,
  });

  const [isRetrying, setIsRetrying] = useState(false);
  const lastOperation = useRef<(() => Promise<any>) | null>(null);
  const lastContext = useRef<Partial<ErrorContext> | undefined>(undefined);

  // Get error handler instance
  const errorHandler = useRef(
    new ErrorHandler({
      component: options.component,
      action: options.action,
      autoTrack: options.autoTrack ?? true,
      enableNotifications: options.enableNotifications ?? true,
      enableRetry: options.enableRetry ?? true,
      maxRetries: options.maxRetries ?? 3,
      onError: options.onError,
    })
  );

  // Get store actions for notifications
  const { addNotification, removeNotification } = useAppStore(state => ({
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
  }));

  // Clear error state
  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorId: null,
      category: null,
      priority: null,
      retryable: false,
      suggestions: [],
      userMessage: '',
      timestamp: null,
    });
  }, []);

  // Handle error with state update and optional notification
  const handleError = useCallback(
    (
      error: Error | string | unknown,
      context?: Partial<ErrorContext>
    ): string => {
      const errorId = errorHandler.current.handleError(error, context);
      const errorObj =
        error instanceof Error ? error : new Error(String(error));

      // Create error notification if enabled
      if (options.enableNotifications) {
        const notification = errorHandler.current.createErrorNotification(
          errorObj,
          context
        );
        addNotification(notification);
      }

      // Update error state
      const category = errorHandler.current.getErrorCategory(errorObj);
      const priority = errorHandler.current.getErrorPriority(
        errorObj,
        category
      );
      const suggestions = errorHandler.current.getErrorSuggestions(
        errorObj,
        category
      );
      const userMessage = errorHandler.current.getUserMessage(
        errorObj,
        category
      );

      setErrorState({
        hasError: true,
        error: errorObj,
        errorId,
        category,
        priority,
        retryable: errorHandler.current.isRetryable(errorObj, category),
        suggestions,
        userMessage,
        timestamp: new Date(),
      });

      return errorId;
    },
    [options.enableNotifications, addNotification]
  );

  // Execute operation with error handling
  const executeWithErrorHandling = useCallback(async <T>(
      operation: () => Promise<T>,
      context?: Partial<ErrorContext>
    ): Promise<ErrorHandlingResult<T>> => {
      // Store operation for potential retry
      lastOperation.current = operation;
      lastContext.current = context;

      const result = await errorHandler.current.executeWithErrorHandling(
        operation,
        context
      );

      if (!result?.success && result?.errorResponse) {
        // Update error state
        setErrorState({
          hasError: true,
          error: result?.error!,
          errorId: result?.errorResponse.errorId,
          category: result?.errorResponse.category,
          priority: result?.errorResponse.priority,
          retryable: result?.errorResponse.retryable,
          suggestions: result?.errorResponse.suggestions,
          userMessage: result?.errorResponse.userMessage,
          timestamp: new Date(),
        });

        // Create notification if enabled
        if (options.enableNotifications && result?.error) {
          const notification = errorHandler.current.createErrorNotification(
            result?.error,
            context
          );
          addNotification(notification);
        }
      } else {
        // Clear error state on success
        clearError();

        // Call success callback if provided
        if (options.onSuccess && result?.data) {
          options.onSuccess(result?.data);
        }
      }

      return result;
    },
    [
      options.enableNotifications,
      options.onSuccess,
      addNotification,
      clearError,
    ]
  );

  // Execute operation with retry
  const executeWithRetry = useCallback(async <T>(
      operation: () => Promise<T>,
      context?: Partial<ErrorContext>
    ): Promise<T> => {
      // Store operation for potential retry
      lastOperation.current = operation;
      lastContext.current = context;

      setIsRetrying(true);

      try {
        const result = await errorHandler.current.executeWithRetry(
          operation,
          context
        );
        clearError();

        // Call success callback if provided
        if (options.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (error) {
        // Handle final error after retries exhausted
        handleError(error, context);
        throw error;
      } finally {
        setIsRetrying(false);
      }
    },
    [options.onSuccess, clearError, handleError]
  );

  // Execute API call with error handling
  const executeApiCall = useCallback(async <T>(
      apiCall: () => Promise<T>,
      apiContext: { [key: string]: any } = {}
    ): Promise<ErrorHandlingResult<T>> => {
      const context = {
        ...apiContext,
        component: options.component,
        action: options.action || 'ApiCall',
      };

      return executeWithErrorHandling(apiCall, context);
    },
    [options.component, options.action, executeWithErrorHandling]
  );

  // Retry last operation
  const retry = useCallback(async () => {
    if (lastOperation.current && errorState.retryable && !isRetrying) {
      try {
        await executeWithRetry(lastOperation.current, lastContext.current);
      } catch (error) {
        // Error is already handled by executeWithRetry
      }
    }
  }, [errorState.retryable, isRetrying, executeWithRetry]);

  // Auto-clear error notifications after a delay
  useEffect(() => {
    if (errorState.hasError && options.enableNotifications) {
      const timer = setTimeout(() => {
        if (errorState.errorId) {
          removeNotification(errorState.errorId);
        }
      }, 10000); // Auto-remove after 10 seconds

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [
    errorState.hasError,
    errorState.errorId,
    options.enableNotifications,
    removeNotification,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Remove any remaining notifications
      if (errorState.errorId) {
        removeNotification(errorState.errorId);
      }
    };
  }, [errorState.errorId, removeNotification]);

  const errorActions: ErrorActions = {
    handleError,
    clearError,
    retry,
    executeWithErrorHandling,
    executeWithRetry,
    executeApiCall,
  };

  return {
    ...errorState,
    ...errorActions,
    isRetrying,
    errorHandler: errorHandler.current,
  };
}

// Convenience hook for simple error handling
export function useSimpleErrorHandler(component: string) {
  return useErrorHandler({
    component,
    enableNotifications: true,
    enableRetry: false,
  });
}

// Hook for API operations with automatic retry
export function useApiErrorHandler(component: string, action?: string) {
  return useErrorHandler({
    component,
    action,
    enableNotifications: true,
    enableRetry: true,
    maxRetries: 3,
  });
}

// Hook for critical operations (no retry, immediate notification)
export function useCriticalErrorHandler(component: string, action?: string) {
  return useErrorHandler({
    component,
    action,
    enableNotifications: true,
    enableRetry: false,
    maxRetries: 0,
  });
}
