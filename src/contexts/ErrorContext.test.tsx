import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorProvider, useErrorContext, useErrorHandler } from './ErrorContext';

// Mock ErrorLogger
vi.mock('@/lib/errors', () => ({
  ErrorLogger: {
    logError: vi.fn(),
  },
}));

// Test component that uses error context
function TestErrorComponent() {
  const { state, addError, removeError, clearErrors, retryError } = useErrorContext();

  return (
    <div>
      <div data-testid="error-count">{state.errors.length}</div>
      <div data-testid="is-online">{state.isOnline.toString()}</div>
      <button onClick={() => addError({
        message: 'Test error',
        type: 'network',
        severity: 'medium',
        retryable: true,
        maxRetries: 3,
      })}>
        Add Error
      </button>
      <button onClick={() => removeError(state.errors[0]?.id || '')}>
        Remove Error
      </button>
      <button onClick={clearErrors}>
        Clear Errors
      </button>
      <button onClick={() => retryError(state.errors[0]?.id || '')}>
        Retry Error
      </button>
    </div>
  );
}

// Test component that uses error handler hook
function TestErrorHandler() {
  const { handleError, handleAsyncError, clearError, retry } = useErrorHandler();

  return (
    <div>
      <button onClick={() => handleError(new Error('Test error'), { type: 'validation' })}>
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
      <button onClick={() => retry('test-id')}>
        Retry Error
      </button>
    </div>
  );
}

describe('ErrorContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should provide error context to children', () => {
    render(
      <ErrorProvider>
        <TestErrorComponent />
      </ErrorProvider>
    );

    expect(screen.getByTestId('error-count')).toHaveTextContent('0');
    expect(screen.getByTestId('is-online')).toHaveTextContent('true');
  });

  it('should add error when addError is called', () => {
    render(
      <ErrorProvider>
        <TestErrorComponent />
      </ErrorProvider>
    );

    fireEvent.click(screen.getByText('Add Error'));

    expect(screen.getByTestId('error-count')).toHaveTextContent('1');
  });

  it('should remove error when removeError is called', () => {
    render(
      <ErrorProvider>
        <TestErrorComponent />
      </ErrorProvider>
    );

    // Add an error first
    fireEvent.click(screen.getByText('Add Error'));
    expect(screen.getByTestId('error-count')).toHaveTextContent('1');

    // Remove the error
    fireEvent.click(screen.getByText('Remove Error'));
    expect(screen.getByTestId('error-count')).toHaveTextContent('0');
  });

  it('should clear all errors when clearErrors is called', () => {
    render(
      <ErrorProvider>
        <TestErrorComponent />
      </ErrorProvider>
    );

    // Add multiple errors
    fireEvent.click(screen.getByText('Add Error'));
    fireEvent.click(screen.getByText('Add Error'));
    expect(screen.getByTestId('error-count')).toHaveTextContent('2');

    // Clear all errors
    fireEvent.click(screen.getByText('Clear Errors'));
    expect(screen.getByTestId('error-count')).toHaveTextContent('0');
  });

  it('should retry error when retryError is called', () => {
    render(
      <ErrorProvider>
        <TestErrorComponent />
      </ErrorProvider>
    );

    // Add an error first
    fireEvent.click(screen.getByText('Add Error'));
    expect(screen.getByTestId('error-count')).toHaveTextContent('1');

    // Retry the error
    fireEvent.click(screen.getByText('Retry Error'));
    // The error should still be there but retry count should increase
    expect(screen.getByTestId('error-count')).toHaveTextContent('1');
  });

  it('should handle online/offline events', () => {
    render(
      <ErrorProvider>
        <TestErrorComponent />
      </ErrorProvider>
    );

    expect(screen.getByTestId('is-online')).toHaveTextContent('true');

    // Simulate offline
    fireEvent(window, new Event('offline'));
    expect(screen.getByTestId('is-online')).toHaveTextContent('false');

    // Simulate online
    fireEvent(window, new Event('online'));
    expect(screen.getByTestId('is-online')).toHaveTextContent('true');
  });

  it('should throw error when useErrorContext is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestErrorComponent />);
    }).toThrow('useErrorContext must be used within an ErrorProvider');
    
    consoleError.mockRestore();
  });
});

describe('useErrorHandler hook', () => {
  it('should handle error when handleError is called', () => {
    render(
      <ErrorProvider>
        <TestErrorHandler />
      </ErrorProvider>
    );

    fireEvent.click(screen.getByText('Handle Error'));
    // Error should be added to context
    expect(screen.getByTestId('error-count')).toHaveTextContent('1');
  });

  it('should handle async error when handleAsyncError is called', async () => {
    render(
      <ErrorProvider>
        <TestErrorHandler />
      </ErrorProvider>
    );

    fireEvent.click(screen.getByText('Handle Async Error'));
    
    await waitFor(() => {
      expect(screen.getByTestId('error-count')).toHaveTextContent('1');
    });
  });

  it('should clear error when clearError is called', () => {
    render(
      <ErrorProvider>
        <TestErrorHandler />
      </ErrorProvider>
    );

    // Add an error first
    fireEvent.click(screen.getByText('Handle Error'));
    expect(screen.getByTestId('error-count')).toHaveTextContent('1');

    // Clear the error
    fireEvent.click(screen.getByText('Clear Error'));
    expect(screen.getByTestId('error-count')).toHaveTextContent('0');
  });

  it('should retry error when retry is called', () => {
    render(
      <ErrorProvider>
        <TestErrorHandler />
      </ErrorProvider>
    );

    // Add an error first
    fireEvent.click(screen.getByText('Handle Error'));
    expect(screen.getByTestId('error-count')).toHaveTextContent('1');

    // Retry the error
    fireEvent.click(screen.getByText('Retry Error'));
    // The error should still be there but retry count should increase
    expect(screen.getByTestId('error-count')).toHaveTextContent('1');
  });
});
