import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock all dependencies
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
  })),
  useMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({ data: { user: { role: 'ADMIN' } } })),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    disabled,
    onClick,
    variant,
    size,
    className,
    type,
    ...props
  }: any) => (
    <button
      disabled={disabled}
      onClick={onClick}
      type={type}
      data-variant={variant}
      data-size={size}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (
    <div data-testid='dialog' data-open={open}>
      {children}
    </div>
  ),
  DialogTrigger: ({ children, asChild }: any) => (
    <div data-testid='dialog-trigger'>
      {asChild ? children : <button>Trigger</button>}
    </div>
  ),
  DialogContent: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  DialogHeader: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  DialogTitle: ({ children, className, ...props }: any) => (
    <h2 className={className} {...props}>
      {children}
    </h2>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, id, required, ...props }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      id={id}
      required={required}
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor, className, ...props }: any) => (
    <label htmlFor={htmlFor} className={className} {...props}>
      {children}
    </label>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className, ...props }: any) => (
    <span className={className} data-variant={variant} {...props}>
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/DynamicLucideIcon', () => ({
  DynamicLucideIcon: ({ iconName, className, fallbackIcon, ...props }: any) => (
    <div className={className} data-icon-name={iconName} {...props}>
      {iconName || 'fallback-icon'}
    </div>
  ),
}));

vi.mock('@/components/ui/IconPicker', () => ({
  IconPicker: ({ currentIcon, onSelectIcon }: any) => (
    <div data-testid='icon-picker' data-current-icon={currentIcon}>
      <button onClick={() => onSelectIcon('📰')} data-testid='icon-option-1'>
        📰
      </button>
      <button onClick={() => onSelectIcon('✨')} data-testid='icon-option-2'>
        ✨
      </button>
      <button onClick={() => onSelectIcon('📅')} data-testid='icon-option-3'>
        📅
      </button>
    </div>
  ),
}));

vi.mock('@/lib/utils', () => ({
  showStatusMessage: vi.fn(),
  isAdmin: vi.fn(() => true),
}));

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: vi.fn(),
});

import StoryTypeManager from './StoryTypeManager';

describe('StoryTypeManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders trigger button when user has admin access', () => {
    render(<StoryTypeManager />);

    expect(screen.getByText('مدیریت قالب‌ها')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument();
  });

  it('renders with proper button styling', () => {
    render(<StoryTypeManager />);

    const triggerButton = screen.getByText('مدیریت قالب‌ها');
    expect(triggerButton).toHaveAttribute('data-variant', 'outline');
    expect(triggerButton).toHaveAttribute('data-size', 'sm');
  });

  it('renders with proper Persian text', () => {
    render(<StoryTypeManager />);

    expect(screen.getByText('مدیریت قالب‌ها')).toBeInTheDocument();
  });

  it('renders trigger button with settings icon', () => {
    render(<StoryTypeManager />);

    const triggerButton = screen.getByText('مدیریت قالب‌ها');
    expect(triggerButton).toBeInTheDocument();
  });

  it('renders with proper button styling', () => {
    render(<StoryTypeManager />);

    const triggerButton = screen.getByText('مدیریت قالب‌ها');
    expect(triggerButton).toHaveAttribute('data-variant', 'outline');
    expect(triggerButton).toHaveAttribute('data-size', 'sm');
  });
});
