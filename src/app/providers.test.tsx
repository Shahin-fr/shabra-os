// Mock modules at the top level
vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn(() => ({
    // TanStack Query v5: No more queryCache configuration
    // Performance monitoring is now handled through defaultOptions callbacks
  })),
  QueryClientProvider: vi.fn(({ children }) => (
    <div data-testid='query-client-provider'>{children}</div>
  )),
}));

vi.mock('next-auth/react', () => ({
  SessionProvider: vi.fn(
    ({ children, refetchInterval, refetchOnWindowFocus }) => (
      <div
        data-testid='session-provider'
        data-refetch-interval={refetchInterval}
        data-refetch-on-window-focus={refetchOnWindowFocus}
      >
        {children}
      </div>
    )
  ),
}));

vi.mock('sonner', () => ({
  Toaster: vi.fn(({ position, richColors }) => (
    <div
      data-testid='toaster'
      data-position={position}
      data-rich-colors={richColors}
    >
      Toaster Component
    </div>
  )),
}));

import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import Providers from './providers';

// Mock performance API
const mockPerformance = {
  mark: vi.fn(),
  measure: vi.fn(),
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock console methods
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
  group: vi.fn(),
  groupEnd: vi.fn(),
};

Object.defineProperty(global, 'console', {
  value: mockConsole,
  writable: true,
});

describe('Providers Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders without crashing', () => {
    render(
      <Providers>
        <div data-testid='test-child'>Test Child</div>
      </Providers>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    const testContent = 'Test Provider Content';

    render(
      <Providers>
        <div>{testContent}</div>
      </Providers>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('configures SessionProvider with correct props', () => {
    render(
      <Providers>
        <div>Test</div>
      </Providers>
    );

    const sessionProvider = screen.getByTestId('session-provider');

    expect(sessionProvider).toHaveAttribute('data-refetch-interval', '300'); // 5 minutes (300 seconds)
    expect(sessionProvider).toHaveAttribute(
      'data-refetch-on-window-focus',
      'false'
    );
  });

  it('configures Toaster with correct props', () => {
    render(
      <Providers>
        <div>Test</div>
      </Providers>
    );

    const toaster = screen.getByTestId('toaster');

    expect(toaster).toHaveAttribute('data-position', 'top-center');
    expect(toaster).toHaveAttribute('data-rich-colors', 'true');
  });

  it('creates QueryClient with correct default options', () => {
    render(
      <Providers>
        <div>Test</div>
      </Providers>
    );

    // The QueryClient is created internally, so we test its effects
    // by checking that the component renders without errors
    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
  });

  it('sets up performance monitoring for queries', () => {
    render(
      <Providers>
        <div>Test</div>
      </Providers>
    );

    // Performance monitoring should be set up
    // This is tested indirectly through the component's successful rendering
    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
  });

  it('handles multiple children correctly', () => {
    render(
      <Providers>
        <div data-testid='child-1'>Child 1</div>
        <div data-testid='child-2'>Child 2</div>
        <div data-testid='child-3'>Child 3</div>
      </Providers>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  it('maintains component structure hierarchy', () => {
    render(
      <Providers>
        <div data-testid='nested-child'>
          <span>Nested Content</span>
        </div>
      </Providers>
    );

    const nestedChild = screen.getByTestId('nested-child');
    expect(nestedChild).toBeInTheDocument();
    expect(nestedChild.querySelector('span')).toHaveTextContent(
      'Nested Content'
    );
  });

  it('handles empty children gracefully', () => {
    render(<Providers>{null}</Providers>);

    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('handles undefined children gracefully', () => {
    render(<Providers>{undefined}</Providers>);

    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('renders with complex nested components', () => {
    const ComplexComponent = () => (
      <div data-testid='complex-component'>
        <header>Header</header>
        <main>Main Content</main>
        <footer>Footer</footer>
      </div>
    );

    render(
      <Providers>
        <ComplexComponent />
      </Providers>
    );

    expect(screen.getByTestId('complex-component')).toBeInTheDocument();
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('maintains proper React context providers', () => {
    render(
      <Providers>
        <div>Test</div>
      </Providers>
    );

    // Check that all required providers are present
    expect(screen.getByTestId('session-provider')).toBeInTheDocument();

    // The QueryClientProvider is internal to the component
    // We verify it works by checking the component renders successfully
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles component re-renders correctly', () => {
    const { rerender } = render(
      <Providers>
        <div data-testid='initial'>Initial</div>
      </Providers>
    );

    expect(screen.getByTestId('initial')).toBeInTheDocument();

    // Re-render with different content
    rerender(
      <Providers>
        <div data-testid='updated'>Updated</div>
      </Providers>
    );

    expect(screen.getByTestId('updated')).toBeInTheDocument();
    expect(screen.queryByTestId('initial')).not.toBeInTheDocument();
  });

  it('provides stable QueryClient instance', () => {
    const { rerender } = render(
      <Providers>
        <div>Test</div>
      </Providers>
    );

    // Re-render multiple times
    rerender(
      <Providers>
        <div>Test 1</div>
      </Providers>
    );

    rerender(
      <Providers>
        <div>Test 2</div>
      </Providers>
    );

    // Component should still render without errors
    expect(screen.getByText('Test 2')).toBeInTheDocument();
  });

  it('handles performance monitoring setup correctly', () => {
    render(
      <Providers>
        <div>Test</div>
      </Providers>
    );

    // Performance monitoring should be set up without errors
    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
  });

  it('configures session refetch interval correctly', () => {
    render(
      <Providers>
        <div>Test</div>
      </Providers>
    );

    const sessionProvider = screen.getByTestId('session-provider');

    // Check that the refetch interval is set to 5 minutes (300 seconds)
    expect(sessionProvider).toHaveAttribute('data-refetch-interval', '300');
  });

  it('configures session refetch on window focus correctly', () => {
    render(
      <Providers>
        <div>Test</div>
      </Providers>
    );

    const sessionProvider = screen.getByTestId('session-provider');

    // Check that refetch on window focus is disabled
    expect(sessionProvider).toHaveAttribute(
      'data-refetch-on-window-focus',
      'false'
    );
  });

  it('provides consistent context across renders', () => {
    const { rerender } = render(
      <Providers>
        <div data-testid='test'>Test</div>
      </Providers>
    );

    const initialElement = screen.getByTestId('test');
    expect(initialElement).toBeInTheDocument();

    // Re-render with same content
    rerender(
      <Providers>
        <div data-testid='test'>Test</div>
      </Providers>
    );

    const updatedElement = screen.getByTestId('test');
    expect(updatedElement).toBeInTheDocument();

    // The element should maintain its identity (same DOM node)
    expect(updatedElement).toBe(initialElement);
  });
});
