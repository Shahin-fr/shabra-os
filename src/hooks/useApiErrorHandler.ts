'use client';

import { toast } from 'sonner';
import { logger } from '@/lib/logger';

/**
 * Centralized API Error Handler Hook
 * Provides consistent error handling and user feedback for API operations
 */
export function useApiErrorHandler() {
  /**
   * Parse error to extract user-friendly message
   */
  const parseErrorMessage = (error: unknown): string => {
    // Handle different error types
    if (error instanceof Error) {
      // Check if it's a structured API error response
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.error?.message) {
          return errorData.error.message;
        }
        if (errorData.error) {
          return errorData.error;
        }
        if (errorData.message) {
          return errorData.message;
        }
      } catch {
        // Not a JSON error, use the error message directly
      }
      
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message);
    }
    
    return 'خطای غیرمنتظره‌ای رخ داده است. لطفاً دوباره تلاش کنید.';
  };

  /**
   * Determine error severity and appropriate toast type
   */
  const getErrorSeverity = (error: unknown): 'error' | 'warning' | 'info' => {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // Network errors
      if (message.includes('network') || message.includes('fetch')) {
        return 'error';
      }
      
      // Authentication errors
      if (message.includes('unauthorized') || message.includes('forbidden')) {
        return 'error';
      }
      
      // Validation errors
      if (message.includes('validation') || message.includes('required')) {
        return 'warning';
      }
      
      // Server errors
      if (message.includes('server') || message.includes('internal')) {
        return 'error';
      }
    }
    
    return 'error';
  };

  /**
   * Handle API error with consistent user feedback
   */
  const handleError = (error: unknown, context?: string) => {
    const message = parseErrorMessage(error);
    const severity = getErrorSeverity(error);
    
    // Log error for debugging
    logger.error('API Error handled', error as Error, {
      context: context || 'useApiErrorHandler',
      operation: 'handleError',
      userMessage: message,
    });
    
    // Show appropriate toast notification
    switch (severity) {
      case 'error':
        toast.error(message, {
          duration: 5000,
          position: 'top-center',
        });
        break;
      case 'warning':
        toast.warning(message, {
          duration: 4000,
          position: 'top-center',
        });
        break;
      case 'info':
        toast.info(message, {
          duration: 3000,
          position: 'top-center',
        });
        break;
    }
  };

  /**
   * Handle success with consistent user feedback
   */
  const handleSuccess = (message: string, context?: string) => {
    logger.info('API Success', {
      context: context || 'useApiErrorHandler',
      operation: 'handleSuccess',
      message,
    });
    
    toast.success(message, {
      duration: 3000,
      position: 'top-center',
    });
  };

  /**
   * Handle loading state with consistent user feedback
   */
  const handleLoading = (message: string, context?: string) => {
    logger.info('API Loading', {
      context: context || 'useApiErrorHandler',
      operation: 'handleLoading',
      message,
    });
    
    toast.loading(message, {
      duration: 2000,
      position: 'top-center',
    });
  };

  return {
    handleError,
    handleSuccess,
    handleLoading,
    parseErrorMessage,
  };
}

/**
 * Standalone error handler for use outside of React components
 */
export const apiErrorHandler = {
  handleError: (error: unknown, context?: string) => {
    const message = parseErrorMessage(error);
    const severity = getErrorSeverity(error);
    
    logger.error('API Error handled (standalone)', error as Error, {
      context: context || 'apiErrorHandler',
      operation: 'handleError',
      userMessage: message,
    });
    
    switch (severity) {
      case 'error':
        toast.error(message, { duration: 5000, position: 'top-center' });
        break;
      case 'warning':
        toast.warning(message, { duration: 4000, position: 'top-center' });
        break;
      case 'info':
        toast.info(message, { duration: 3000, position: 'top-center' });
        break;
    }
  },
  
  handleSuccess: (message: string, context?: string) => {
    logger.info('API Success (standalone)', {
      context: context || 'apiErrorHandler',
      operation: 'handleSuccess',
      message,
    });
    
    toast.success(message, { duration: 3000, position: 'top-center' });
  },
  
  handleLoading: (message: string, context?: string) => {
    logger.info('API Loading (standalone)', {
      context: context || 'apiErrorHandler',
      operation: 'handleLoading',
      message,
    });
    
    toast.loading(message, { duration: 2000, position: 'top-center' });
  },
};

// Helper functions for standalone use
function parseErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    try {
      const errorData = JSON.parse(error.message);
      if (errorData.error?.message) return errorData.error.message;
      if (errorData.error) return errorData.error;
      if (errorData.message) return errorData.message;
    } catch {
      // Not a JSON error, use the error message directly
    }
    return error.message;
  }
  
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'خطای غیرمنتظره‌ای رخ داده است. لطفاً دوباره تلاش کنید.';
}

function getErrorSeverity(error: unknown): 'error' | 'warning' | 'info' {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) return 'error';
    if (message.includes('unauthorized') || message.includes('forbidden')) return 'error';
    if (message.includes('validation') || message.includes('required')) return 'warning';
    if (message.includes('server') || message.includes('internal')) return 'error';
  }
  
  return 'error';
}
