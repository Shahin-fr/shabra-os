'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { ErrorLogger } from '@/lib/errors';

// Error types for client-side
export interface ClientError {
  id: string;
  message: string;
  type: 'network' | 'validation' | 'authentication' | 'authorization' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  context?: Record<string, any>;
  stack?: string;
  component?: string;
  retryable: boolean;
  retryCount: number;
  maxRetries: number;
}

export interface ErrorState {
  errors: ClientError[];
  isOnline: boolean;
  retryQueue: ClientError[];
  globalError: ClientError | null;
}

export type ErrorAction =
  | { type: 'ADD_ERROR'; payload: Omit<ClientError, 'id' | 'timestamp' | 'retryCount'> }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'UPDATE_ERROR'; payload: { id: string; updates: Partial<ClientError> } }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'ADD_TO_RETRY_QUEUE'; payload: ClientError }
  | { type: 'REMOVE_FROM_RETRY_QUEUE'; payload: string }
  | { type: 'CLEAR_RETRY_QUEUE' }
  | { type: 'SET_GLOBAL_ERROR'; payload: ClientError | null }
  | { type: 'RETRY_ERROR'; payload: string };

interface ErrorContextType {
  state: ErrorState;
  addError: (error: Omit<ClientError, 'id' | 'timestamp' | 'retryCount'>) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
  updateError: (id: string, updates: Partial<ClientError>) => void;
  retryError: (id: string) => void;
  retryAllErrors: () => void;
  setGlobalError: (error: ClientError | null) => void;
  clearGlobalError: () => void;
  isOnline: boolean;
  setOnlineStatus: (isOnline: boolean) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

// Error reducer
function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
  switch (action.type) {
    case 'ADD_ERROR': {
      const newError: ClientError = {
        ...action.payload,
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        retryCount: 0,
      };

      return {
        ...state,
        errors: [...state.errors, newError],
      };
    }

    case 'REMOVE_ERROR': {
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload),
      };
    }

    case 'CLEAR_ERRORS': {
      return {
        ...state,
        errors: [],
        globalError: null,
      };
    }

    case 'UPDATE_ERROR': {
      return {
        ...state,
        errors: state.errors.map(error =>
          error.id === action.payload.id
            ? { ...error, ...action.payload.updates }
            : error
        ),
      };
    }

    case 'SET_ONLINE_STATUS': {
      return {
        ...state,
        isOnline: action.payload,
      };
    }

    case 'ADD_TO_RETRY_QUEUE': {
      return {
        ...state,
        retryQueue: [...state.retryQueue, action.payload],
      };
    }

    case 'REMOVE_FROM_RETRY_QUEUE': {
      return {
        ...state,
        retryQueue: state.retryQueue.filter(error => error.id !== action.payload),
      };
    }

    case 'CLEAR_RETRY_QUEUE': {
      return {
        ...state,
        retryQueue: [],
      };
    }

    case 'SET_GLOBAL_ERROR': {
      return {
        ...state,
        globalError: action.payload,
      };
    }

    case 'RETRY_ERROR': {
      const error = state.errors.find(e => e.id === action.payload);
      if (!error || error.retryCount >= error.maxRetries) {
        return state;
      }

      const updatedError = {
        ...error,
        retryCount: error.retryCount + 1,
      };

      return {
        ...state,
        errors: state.errors.map(e => e.id === action.payload ? updatedError : e),
        retryQueue: [...state.retryQueue, updatedError],
      };
    }

    default:
      return state;
  }
}

// Initial state
const initialState: ErrorState = {
  errors: [],
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  retryQueue: [],
  globalError: null,
};

// Error provider component
export function ErrorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  // Add error
  const addError = useCallback((error: Omit<ClientError, 'id' | 'timestamp' | 'retryCount'>) => {
    dispatch({ type: 'ADD_ERROR', payload: error });
    
    // Log error to server
    ErrorLogger.logError(new Error(error.message), {
      type: error.type,
      severity: error.severity,
      context: error.context,
      component: error.component,
      retryable: error.retryable,
    });
  }, []);

  // Remove error
  const removeError = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ERROR', payload: id });
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  // Update error
  const updateError = useCallback((id: string, updates: Partial<ClientError>) => {
    dispatch({ type: 'UPDATE_ERROR', payload: { id, updates } });
  }, []);

  // Retry error
  const retryError = useCallback((id: string) => {
    dispatch({ type: 'RETRY_ERROR', payload: id });
  }, []);

  // Retry all errors
  const retryAllErrors = useCallback(() => {
    state.errors.forEach(error => {
      if (error.retryable && error.retryCount < error.maxRetries) {
        dispatch({ type: 'RETRY_ERROR', payload: error.id });
      }
    });
  }, [state.errors]);

  // Set global error
  const setGlobalError = useCallback((error: ClientError | null) => {
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: error });
  }, []);

  // Clear global error
  const clearGlobalError = useCallback(() => {
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: null });
  }, []);

  // Set online status
  const setOnlineStatus = useCallback((isOnline: boolean) => {
    dispatch({ type: 'SET_ONLINE_STATUS', payload: isOnline });
  }, []);

  // Listen for online/offline events
  React.useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  // Auto-retry when coming back online
  React.useEffect(() => {
    if (state.isOnline && state.retryQueue.length > 0) {
      retryAllErrors();
      dispatch({ type: 'CLEAR_RETRY_QUEUE' });
    }
  }, [state.isOnline, state.retryQueue.length, retryAllErrors]);

  const contextValue: ErrorContextType = {
    state,
    addError,
    removeError,
    clearErrors,
    updateError,
    retryError,
    retryAllErrors,
    setGlobalError,
    clearGlobalError,
    isOnline: state.isOnline,
    setOnlineStatus,
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
}

// Hook to use error context
export function useErrorContext() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
}

// Hook for specific error operations
export function useErrorHandler() {
  const { addError, removeError, updateError, retryError } = useErrorContext();

  const handleError = useCallback((
    error: Error,
    options: {
      type?: ClientError['type'];
      severity?: ClientError['severity'];
      context?: Record<string, any>;
      component?: string;
      retryable?: boolean;
      maxRetries?: number;
    } = {}
  ) => {
    const {
      type = 'unknown',
      severity = 'medium',
      context = {},
      component,
      retryable = false,
      maxRetries = 3,
    } = options;

    addError({
      message: error.message,
      type,
      severity,
      context: {
        ...context,
        stack: error.stack,
        name: error.name,
      },
      component,
      retryable,
      maxRetries,
    });
  }, [addError]);

  const handleAsyncError = useCallback(async <T,>(
    asyncFn: () => Promise<T>,
    options?: Parameters<typeof handleError>[1]
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, options);
      return null;
    }
  }, [handleError]);

  const clearError = useCallback((id: string) => {
    removeError(id);
  }, [removeError]);

  const retry = useCallback((id: string) => {
    retryError(id);
  }, [retryError]);

  return {
    handleError,
    handleAsyncError,
    clearError,
    retry,
  };
}
