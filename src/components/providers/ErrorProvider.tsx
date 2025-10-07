'use client';

import React, { useEffect } from 'react';
import { ErrorProvider as ErrorContextProvider } from '@/contexts/ErrorContext';
import { ErrorToastContainer } from '@/components/errors/ErrorDisplay';
import { useErrorContext } from '@/contexts/ErrorContext';
import { errorReporter } from '@/lib/client-error-reporting';

// Global error display component
function GlobalErrorDisplay() {
  const { state, retryError, removeError } = useErrorContext();

  const handleRetry = (errorId: string) => {
    retryError(errorId);
  };

  const handleDismiss = (errorId: string) => {
    removeError(errorId);
    errorReporter.trackDismissal(errorId, 'user_dismissed');
  };

  const handleReport = (errorId: string) => {
    const error = state.errors.find(e => e.id === errorId);
    if (error) {
      errorReporter.reportError(error);
    }
  };

  return (
    <ErrorToastContainer
      errors={state.errors}
      onRetry={handleRetry}
      onDismiss={handleDismiss}
      onReport={handleReport}
      position="top-right"
    />
  );
}

// Error boundary for the entire app
function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  const { addError } = useErrorContext();

  useEffect(() => {
    // Global error handler
    const handleGlobalError = (event: ErrorEvent) => {
      addError({
        message: event.message,
        type: 'unknown',
        severity: 'high',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
        },
        component: 'global',
        retryable: false,
        maxRetries: 0,
      });
    };

    // Global unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addError({
        message: event.reason?.message || 'Unhandled promise rejection',
        type: 'unknown',
        severity: 'high',
        context: {
          reason: event.reason,
          stack: event.reason?.stack,
        },
        component: 'global',
        retryable: false,
        maxRetries: 0,
      });
    };

    // Add event listeners
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [addError]);

  return <>{children}</>;
}

// Main error provider component
export function ErrorProvider({ children }: { children: React.ReactNode }) {
  return (
    <ErrorContextProvider>
      <AppErrorBoundary>
        {children}
        <GlobalErrorDisplay />
      </AppErrorBoundary>
    </ErrorContextProvider>
  );
}

// Hook for easy access to error context
export { useErrorContext, useErrorHandler } from '@/contexts/ErrorContext';
export { useErrorHandling } from '@/hooks/useErrorHandling';
