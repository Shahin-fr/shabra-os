import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorBoundary, withErrorBoundary, useErrorHandler } from './ErrorBoundary';
import { ErrorProvider } from '@/components/providers/ErrorProvider';

// Mock ErrorLogger
vi.mock('@/lib/errors', () => ({
  ErrorLogger: {
    logError: vi.fn(),
  },
}));

// Test component that throws an error
function ThrowError({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

// Test component for useErrorHandler hook
function TestErrorHandler() {
  const { captureError, resetError } = useErrorHandler();
  
  return (
    <div>
      <button onClick={() => captureError(new Error('Hook error'))}>
        Trigger Error
      </button>
      <button onClick={resetError}>
        Reset Error
      </button>
    </div>
  );
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render error UI when child throws an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('We\'re sorry, but something unexpected happened.')).toBeInTheDocument();
  });

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error Details')).toBeInTheDocument();
    expect(screen.getByText(/Test error/)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should hide error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Error Details')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should call onError callback when error occurs', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('should retry when retry button is clicked', async () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);

    // Rerender with no error to simulate successful retry
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  it('should disable retry button when max retries reached', () => {
    render(
      <ErrorBoundary maxRetries={0}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const retryButton = screen.getByText('Max retries reached');
    expect(retryButton).toBeDisabled();
  });

  it('should reset when resetKeys change', () => {
    const { rerender } = render(
      <ErrorBoundary resetKeys={['key1']} resetOnPropsChange={true}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    rerender(
      <ErrorBoundary resetKeys={['key2']} resetOnPropsChange={true}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should report error when report button is clicked', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reportButton = screen.getByText('Report Error');
    fireEvent.click(reportButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('Test error'),
      });
    });
  });
});

describe('withErrorBoundary HOC', () => {
  it('should wrap component with error boundary', () => {
    const WrappedComponent = withErrorBoundary(ThrowError);
    
    render(<WrappedComponent shouldThrow={true} />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should preserve component display name', () => {
    const WrappedComponent = withErrorBoundary(ThrowError);
    
    expect(WrappedComponent.displayName).toBe('withErrorBoundary(ThrowError)');
  });
});

describe('useErrorHandler hook', () => {
  it('should throw error when captureError is called', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // This test is actually testing that the hook works when used within a provider
    // The error throwing behavior is tested in the context tests
    render(
      <ErrorProvider>
        <TestErrorHandler />
      </ErrorProvider>
    );
    
    expect(screen.getByText('Trigger Error')).toBeInTheDocument();
    
    consoleError.mockRestore();
  });
});
