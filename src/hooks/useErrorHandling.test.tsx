import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorProvider } from '@/components/providers/ErrorProvider';
import { useErrorHandling } from './useErrorHandling';

// Mock dependencies
vi.mock('@/lib/client-error-reporting', () => ({
  errorReporter: {
    reportError: vi.fn(),
    trackRecovery: vi.fn(),
    trackRetry: vi.fn(),
    trackDismissal: vi.fn(),
  },
}));

vi.mock('@/lib/client-error-recovery', () => ({
  errorRecoveryManager: {
    attemptRecovery: vi.fn(),
  },
  createRetryableFunction: vi.fn(),
  withTimeout: vi.fn(),
  withFallback: vi.fn(),
}));

// Test component that uses the hook
function TestErrorHandling() {
  const {
    errors,
    isOnline,
    globalError,
    handleError,
    handleAsyncError,
    clearError,
    clearAllErrors,
    retryError,
    retryAllErrors,
    getErrorsByType,
    getErrorsBySeverity,
    getRetryableErrors,
    hasCriticalErrors,
    hasRetryableErrors,
    errorCount,
    criticalErrorCount,
    retryableErrorCount,
  } = useErrorHandling();

  return (
    <div>
      <div data-testid="error-count">{errorCount}</div>
      <div data-testid="critical-error-count">{criticalErrorCount}</div>
      <div data-testid="retryable-error-count">{retryableErrorCount}</div>
      <div data-testid="is-online">{isOnline.toString()}</div>
      <div data-testid="has-critical-errors">{hasCriticalErrors().toString()}</div>
      <div data-testid="has-retryable-errors">{hasRetryableErrors().toString()}</div>
      
      <button onClick={() => handleError(new Error('Test error'), { type: 'network' })}>
        Handle Error
      </button>
      
      <button onClick={() => handleAsyncError(async () => {
        throw new Error('Async error');
      })}>
        Handle Async Error
      </button>
      
      <button onClick={() => clearError('test-id')}>
        Clear Error
      </button>
      
      <button onClick={clearAllErrors}>
        Clear All Errors
      </button>
      
      <button onClick={() => retryError('test-id', async () => {})}>
        Retry Error
      </button>
      
      <button onClick={retryAllErrors}>
        Retry All Errors
      </button>
      
      <div data-testid="network-errors">{getErrorsByType('network').length}</div>
      <div data-testid="critical-errors">{getErrorsBySeverity('critical').length}</div>
      <div data-testid="retryable-errors">{getRetryableErrors().length}</div>
    </div>
  );
}

describe('useErrorHandling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should provide error handling functionality', () => {
    render(
      <ErrorProvider>
        <TestErrorHandling />
      </ErrorProvider>
    );

    expect(screen.getByTestId('error-count')).toHaveTextContent('0');
    expect(screen.getByTestId('critical-error-count')).toHaveTextContent('0');
    expect(screen.getByTestId('retryable-error-count')).toHaveTextContent('0');
    expect(screen.getByTestId('is-online')).toHaveTextContent('true');
    expect(screen.getByTestId('has-critical-errors')).toHaveTextContent('false');
    expect(screen.getByTestId('has-retryable-errors')).toHaveTextContent('false');
  });

  it('should handle error when handleError is called', async () => {
    const { errorReporter } = await import('@/lib/client-error-reporting');
    const { errorRecoveryManager } = await import('@/lib/client-error-recovery');
    
    errorRecoveryManager.attemptRecovery.mockResolvedValue(false);

    render(
      <ErrorProvider>
        <TestErrorHandling />
      </ErrorProvider>
    );

    fireEvent.click(screen.getByText('Handle Error'));

    await waitFor(() => {
      expect(screen.getByTestId('error-count')).toHaveTextContent('1');
    });

    expect(errorReporter.reportError).toHaveBeenCalled();
    expect(errorRecoveryManager.attemptRecovery).toHaveBeenCalled();
  });

  it('should handle async error when handleAsyncError is called', async () => {
    const { errorReporter } = await import('@/lib/client-error-reporting');
    const { errorRecoveryManager } = await import('@/lib/client-error-recovery');
    
    errorRecoveryManager.attemptRecovery.mockResolvedValue(false);

    render(
      <ErrorProvider>
        <TestErrorHandling />
      </ErrorProvider>
    );

    fireEvent.click(screen.getByText('Handle Async Error'));

    await waitFor(() => {
      expect(screen.getByTestId('error-count')).toHaveTextContent('1');
    });

    expect(errorReporter.reportError).toHaveBeenCalled();
  });

  it('should clear error when clearError is called', () => {
    render(
      <ErrorProvider>
        <TestErrorHandling />
      </ErrorProvider>
    );

    // Add an error first
    fireEvent.click(screen.getByText('Handle Error'));
    expect(screen.getByTestId('error-count')).toHaveTextContent('1');

    // Clear the error
    fireEvent.click(screen.getByText('Clear Error'));
    expect(screen.getByTestId('error-count')).toHaveTextContent('0');
  });

  it('should clear all errors when clearAllErrors is called', () => {
    render(
      <ErrorProvider>
        <TestErrorHandling />
      </ErrorProvider>
    );

    // Add multiple errors
    fireEvent.click(screen.getByText('Handle Error'));
    fireEvent.click(screen.getByText('Handle Error'));
    expect(screen.getByTestId('error-count')).toHaveTextContent('2');

    // Clear all errors
    fireEvent.click(screen.getByText('Clear All Errors'));
    expect(screen.getByTestId('error-count')).toHaveTextContent('0');
  });

  it('should retry error when retryError is called', async () => {
    const { errorReporter } = await import('@/lib/client-error-reporting');

    render(
      <ErrorProvider>
        <TestErrorHandling />
      </ErrorProvider>
    );

    // Add an error first
    fireEvent.click(screen.getByText('Handle Error'));
    expect(screen.getByTestId('error-count')).toHaveTextContent('1');

    // Retry the error
    fireEvent.click(screen.getByText('Retry Error'));

    await waitFor(() => {
      expect(errorReporter.trackRetry).toHaveBeenCalled();
    });
  });

  it('should retry all errors when retryAllErrors is called', async () => {
    const { errorReporter } = await import('@/lib/client-error-reporting');

    render(
      <ErrorProvider>
        <TestErrorHandling />
      </ErrorProvider>
    );

    // Add multiple errors
    fireEvent.click(screen.getByText('Handle Error'));
    fireEvent.click(screen.getByText('Handle Error'));
    expect(screen.getByTestId('error-count')).toHaveTextContent('2');

    // Retry all errors
    fireEvent.click(screen.getByText('Retry All Errors'));

    await waitFor(() => {
      expect(errorReporter.trackRetry).toHaveBeenCalled();
    });
  });

  it('should filter errors by type', () => {
    render(
      <ErrorProvider>
        <TestErrorHandling />
      </ErrorProvider>
    );

    // Add network errors
    fireEvent.click(screen.getByText('Handle Error'));
    fireEvent.click(screen.getByText('Handle Error'));

    expect(screen.getByTestId('network-errors')).toHaveTextContent('2');
  });

  it('should filter errors by severity', () => {
    render(
      <ErrorProvider>
        <TestErrorHandling />
      </ErrorProvider>
    );

    // Add errors with different severities
    fireEvent.click(screen.getByText('Handle Error'));

    expect(screen.getByTestId('critical-errors')).toHaveTextContent('0');
  });

  it('should identify retryable errors', () => {
    render(
      <ErrorProvider>
        <TestErrorHandling />
      </ErrorProvider>
    );

    // Add retryable errors
    fireEvent.click(screen.getByText('Handle Error'));

    expect(screen.getByTestId('retryable-errors')).toHaveTextContent('0');
  });

  it('should detect critical errors', () => {
    render(
      <ErrorProvider>
        <TestErrorHandling />
      </ErrorProvider>
    );

    expect(screen.getByTestId('has-critical-errors')).toHaveTextContent('false');
  });

  it('should detect retryable errors', () => {
    render(
      <ErrorProvider>
        <TestErrorHandling />
      </ErrorProvider>
    );

    expect(screen.getByTestId('has-retryable-errors')).toHaveTextContent('false');
  });
});
