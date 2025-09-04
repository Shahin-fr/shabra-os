/**
 * Enhanced Error Boundary Component
 *
 * This component provides comprehensive error handling for React components,
 * integrating with the unified error handling system and consolidated state management.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';
import { useAppStore } from '@/stores/consolidated-store';
import { ErrorCategory, ErrorPriority } from '@/types/error';
import { ErrorHandler, ErrorNotification } from '@/lib/error-handler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, errorInfo: ErrorInfo) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  component?: string;
  action?: string;
  enableNotifications?: boolean;
  enableRecovery?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  category: ErrorCategory | null;
  priority: ErrorPriority | null;
  retryable: boolean;
  suggestions: string[];
  userMessage: string;
}

/**
 * Error Boundary Class Component
 */
export class ErrorBoundary extends Component<Props, State> {
  private errorHandler: ErrorHandler;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      category: null,
      priority: null,
      retryable: false,
      suggestions: [],
      userMessage: '',
    };

    this.errorHandler = new ErrorHandler({
      component: props.component || 'ErrorBoundary',
      action: props.action || 'ErrorHandling',
      enableNotifications: props.enableNotifications ?? true,
      enableRetry: false,
    });
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging
    logger.error('Error boundary caught an error:', error, {
      component: this.props.component || 'ErrorBoundary',
      action: 'ErrorHandling',
      stack: errorInfo.componentStack,
    });

    // Handle error through unified error handler
    const errorId = this.errorHandler.handleError(error, {
      component: this.props.component || 'ErrorBoundary',
      action: 'ErrorHandling',
      stackTrace: errorInfo.componentStack || 'No component stack',
    });

    // Get error details
    const category = this.errorHandler.getErrorCategory(error);
    const priority = this.errorHandler.getErrorPriority(error, category);
    const suggestions = this.errorHandler.getErrorSuggestions(error, category);
    const userMessage = this.errorHandler.getUserMessage(error, category);

    // Update state with error details
    this.setState({
      errorId,
      category,
      priority,
      retryable: this.errorHandler.isRetryable(error, category),
      suggestions,
      userMessage,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Add error notification to store if enabled
    if (this.props.enableNotifications) {
      this.addErrorNotification(
        error,
        category,
        priority,
        userMessage,
        suggestions
      );
    }
  }

  private addErrorNotification(
    _error: Error,
    category: ErrorCategory,
    priority: ErrorPriority,
    userMessage: string,
    _suggestions: string[]
  ) {
    // This will be handled by the store integration
    // For now, we'll use a simple approach
    const notification: ErrorNotification = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type:
        priority === 'CRITICAL'
          ? 'error'
          : priority === 'HIGH'
            ? 'warning'
            : 'info',
      title: this.getNotificationTitle(category),
      message: userMessage,
      category,
      priority,
      timestamp: new Date(),
      dismissible: priority !== 'CRITICAL',
      action:
        priority === 'CRITICAL'
          ? {
              label: 'Contact Support',
              onClick: () => {
                // Contact support functionality
              },
            }
          : undefined,
    };

    // Add to store if available - only on client side to prevent hydration issues
    if (typeof window !== 'undefined') {
      try {
        const store = useAppStore.getState();
        store.addNotification(notification);
      } catch (e) {
        // Fallback to console if store is not available
        // Error handling is done in the mutation's onError callback
      }
    }
  }

  private getNotificationTitle(category: ErrorCategory): string {
    switch (category) {
      case 'VALIDATION_ERROR':
        return 'Input Error';
      case 'AUTHENTICATION_ERROR':
        return 'Authentication Error';
      case 'DATABASE_ERROR':
        return 'Database Error';
      case 'NETWORK_ERROR':
        return 'Network Error';
      case 'API_ERROR':
        return 'API Error';
      case 'PERFORMANCE_ERROR':
        return 'Performance Issue';
      case 'BUILD_ERROR':
        return 'System Error';
      default:
        return 'Application Error';
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      category: null,
      priority: null,
      retryable: false,
      suggestions: [],
      userMessage: '',
    });
  };

  private handleReportError = () => {
    if (this.state.error && this.state.errorInfo) {
      // This would integrate with error reporting system
      logger.error('Error reported by user:', this.state.error, {
        component: this.props.component || 'ErrorBoundary',
        action: 'ErrorReporting',
        stack: this.state.errorInfo.componentStack,
        userReported: true,
      });

      // Show confirmation to user
      alert('Error has been reported. Thank you for your feedback.');
    }
  };

  private handleContactSupport = () => {
    // This would integrate with support system
    window.open('mailto:support@shabra-os.com?subject=Error Report', '_blank');
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error!, this.state.errorInfo!);
        }
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className='flex items-center justify-center bg-gray-50'>
          <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-6'>
            <div className='flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full'>
              <svg
                className='w-6 h-6 text-red-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>

            <div className='mt-4 text-center'>
              <h3 className='text-lg font-medium text-gray-900'>
                {this.getNotificationTitle(
                  this.state.category || 'UNKNOWN_ERROR'
                )}
              </h3>
              <p className='mt-2 text-sm text-gray-500'>
                {this.state.userMessage}
              </p>
            </div>

            {this.state.suggestions.length > 0 && (
              <div className='mt-4'>
                <h4 className='text-sm font-medium text-gray-700 mb-2'>
                  Suggestions:
                </h4>
                <ul className='text-sm text-gray-600 space-y-1'>
                  {this.state.suggestions.map((suggestion, index) => (
                    <li key={index} className='flex items-start'>
                      <span className='text-blue-500 mr-2'>•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className='mt-6 flex space-x-3'>
              {this.state.retryable && (
                <button
                  onClick={this.handleRetry}
                  className='flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                  Try Again
                </button>
              )}

              <button
                onClick={this.handleReportError}
                className='flex-1 bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
              >
                Report Error
              </button>
            </div>

            {this.state.priority === 'CRITICAL' && (
              <div className='mt-4'>
                <button
                  onClick={this.handleContactSupport}
                  className='w-full bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                >
                  Contact Support
                </button>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className='mt-4'>
                <summary className='text-sm text-gray-500 cursor-pointer hover:text-gray-700'>
                  Technical Details (Development)
                </summary>
                <div className='mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40'>
                  <div>
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div>
                    <strong>Stack:</strong>
                  </div>
                  <pre className='whitespace-pre-wrap'>
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <>
                      <div>
                        <strong>Component Stack:</strong>
                      </div>
                      <pre className='whitespace-pre-wrap'>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for functional components to handle errors
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    setError(error);

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      logger.error('useErrorHandler caught an error:', error);
    }
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, resetError };
}

/**
 * Higher-order component for error handling
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Hook for using error boundary context
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = React.useState<ErrorInfo | null>(null);

  const handleError = React.useCallback(
    (error: Error, errorInfo: ErrorInfo) => {
      setError(error);
      setErrorInfo(errorInfo);
    },
    []
  );

  const resetError = React.useCallback(() => {
    setError(null);
    setErrorInfo(null);
  }, []);

  return { error, errorInfo, handleError, resetError };
}
