'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  className?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <motion.div
          className={cn(
            'min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-pink-50',
            this.props.className
          )}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-md w-full text-center">
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </motion.div>

            <motion.h1
              className="text-2xl font-bold text-gray-900 font-vazirmatn mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              خطای غیرمنتظره
            </motion.h1>

            <motion.p
              className="text-gray-600 font-vazirmatn mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              متأسفانه خطایی رخ داده است. لطفاً صفحه را بازخوانی کنید یا به صفحه اصلی برگردید.
            </motion.p>

            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={this.handleRetry}
                className="w-full font-vazirmatn bg-blue-500 hover:bg-blue-600 text-white"
              >
                <RefreshCw className="h-4 w-4 ms-2" />
                تلاش مجدد
              </Button>

              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full font-vazirmatn"
              >
                <Home className="h-4 w-4 ms-2" />
                بازگشت به صفحه اصلی
              </Button>
            </motion.div>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <motion.details
                className="mt-8 text-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <summary className="cursor-pointer text-sm text-gray-500 font-vazirmatn mb-2">
                  جزئیات خطا (فقط در حالت توسعه)
                </summary>
                <div className="bg-gray-100 p-4 rounded-lg text-xs font-mono text-gray-700 overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div>
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1">
                      {this.state.error.stack}
                    </pre>
                  </div>
                </div>
              </motion.details>
            )}
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

// Hook for error handling
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError };
}

// Error retry component
interface ErrorRetryProps {
  error: Error;
  onRetry: () => void;
  className?: string;
}

export function ErrorRetry({ error, onRetry, className }: ErrorRetryProps) {
  return (
    <motion.div
      className={cn(
        'flex flex-col items-center justify-center p-6 text-center bg-red-50 rounded-xl border border-red-200',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <Bug className="h-6 w-6 text-red-500" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 font-vazirmatn mb-2">
        خطا در بارگذاری
      </h3>

      <p className="text-gray-600 font-vazirmatn mb-4 text-sm">
        {error.message || 'خطای غیرمنتظره‌ای رخ داده است'}
      </p>

      <Button
        onClick={onRetry}
        variant="outline"
        className="font-vazirmatn border-red-300 text-red-600 hover:bg-red-50"
      >
        <RefreshCw className="h-4 w-4 ms-2" />
        تلاش مجدد
      </Button>
    </motion.div>
  );
}

// Global error handler
export function setupGlobalErrorHandling() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // You can add additional error reporting here
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    // You can add additional error reporting here
  });
}
