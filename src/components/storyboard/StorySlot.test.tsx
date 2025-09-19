import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock all dependencies
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: vi.fn(() => ({
    attributes: { 'data-testid': 'sortable-attributes' },
    listeners: { 'data-testid': 'sortable-listeners' },
    setNodeRef: vi.fn(),
    transform: { x: 0, y: 0 },
    transition: 'none',
    isDragging: false,
  })),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => 'transform(0px, 0px)'),
    },
  },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, ...props }: any) => (
    <span className={className} {...props}>
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    disabled,
    onClick,
    variant,
    size,
    className,
    ...props
  }: any) => (
    <button
      disabled={disabled}
      onClick={onClick}
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
  Card: ({ children, className, ref, ...props }: any) => (
    <div className={className} ref={ref} {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/DynamicLucideIcon', () => ({
  DynamicLucideIcon: ({ iconName, className, fallbackIcon, ...props }: any) => (
    <div className={className} data-icon-name={iconName} {...props}>
      {iconName || 'fallback-icon'}
    </div>
  ),
}));

vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | undefined | null | false)[]) =>
    classes.filter(Boolean).join(' '),
}));

import { StorySlot } from './StorySlot';

describe('StorySlot', () => {
  const mockStory = {
    id: '1',
    title: 'Test Story Title',
    notes: 'Test story notes',
    visualNotes: 'Test visual notes',
    link: 'https://example.com',
    day: '2024-01-01',
    order: 1,
    status: 'DRAFT' as const,
    storyType: { id: '1', name: 'News Story', icon: '📰' },
    project: { id: '1', name: 'Test Project' },
  };

  const defaultProps = {
    story: mockStory,
    index: 0,
    isSelected: false,
    onClick: vi.fn(),
    onClearSlot: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders story slot with story content when story exists', () => {
    render(<StorySlot {...defaultProps} />);

    expect(screen.getByText('News Story')).toBeInTheDocument();
    expect(screen.getByText('Test Story Title')).toBeInTheDocument();
    expect(screen.getByText('پیش‌نویس')).toBeInTheDocument(); // DRAFT status
  });

  it('renders empty slot when no story exists', () => {
    render(<StorySlot {...defaultProps} story={undefined} />);

    expect(screen.getByText('اسلات خالی')).toBeInTheDocument();
    expect(screen.getByText('کلیک برای انتخاب')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Order number
  });

  it('renders order number correctly', () => {
    render(<StorySlot {...defaultProps} index={2} />);

    expect(screen.getByText('3')).toBeInTheDocument(); // index + 1
  });

  it('renders status badge with correct text and styling', () => {
    render(<StorySlot {...defaultProps} />);

    const statusBadge = screen.getByText('پیش‌نویس');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('text-xs', 'font-medium', 'px-2', 'py-1');
  });

  it('renders different status badges for different statuses', () => {
    const statuses = [
      { status: 'DRAFT' as const, expectedText: 'پیش‌نویس' },
      { status: 'READY' as const, expectedText: 'آماده' },
      { status: 'PUBLISHED' as const, expectedText: 'منتشر شده' },
    ];

    statuses.forEach(({ status, expectedText }) => {
      const storyWithStatus = { ...mockStory, status };
      const { unmount } = render(
        <StorySlot {...defaultProps} story={storyWithStatus} />
      );

      expect(screen.getByText(expectedText)).toBeInTheDocument();
      unmount();
    });
  });

  it('renders story type icon when available', () => {
    render(<StorySlot {...defaultProps} />);

    const iconElement = screen.getByText('📰');
    expect(iconElement).toBeInTheDocument();
    expect(iconElement).toHaveAttribute('data-icon-name', '📰');
  });

  it('renders fallback icon when story type icon is not available', () => {
    const storyWithoutIcon = {
      ...mockStory,
      storyType: { id: '1', name: 'News Story' }, // No icon
    };

    render(<StorySlot {...defaultProps} story={storyWithoutIcon} />);

    const iconElement = screen.getByText('fallback-icon');
    expect(iconElement).toBeInTheDocument();
  });

  it('renders story title when different from story type name', () => {
    const storyWithDifferentTitle = {
      ...mockStory,
      title: 'Different Title',
      storyType: { id: '1', name: 'News Story' },
    };

    render(<StorySlot {...defaultProps} story={storyWithDifferentTitle} />);

    expect(screen.getByText('News Story')).toBeInTheDocument(); // Story type name (main)
    expect(screen.getByText('Different Title')).toBeInTheDocument(); // Story title (secondary)
  });

  it('does not render story title when same as story type name', () => {
    const storyWithSameTitle = {
      ...mockStory,
      title: 'News Story', // Same as story type name
      storyType: { id: '1', name: 'News Story' },
    };

    render(<StorySlot {...defaultProps} story={storyWithSameTitle} />);

    expect(screen.getByText('News Story')).toBeInTheDocument();
    // Should not render the title separately since it's the same
  });

  it('renders visual notes indicator when available', () => {
    render(<StorySlot {...defaultProps} />);

    expect(screen.getByText('تصویر')).toBeInTheDocument();
  });

  it('does not render visual notes indicator when not available', () => {
    const storyWithoutVisualNotes = {
      ...mockStory,
      visualNotes: undefined,
    };

    render(<StorySlot {...defaultProps} story={storyWithoutVisualNotes} />);

    expect(screen.queryByText('تصویر')).not.toBeInTheDocument();
  });

  it('calls onClick when slot is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<StorySlot {...defaultProps} onClick={onClick} />);

    // Find the Card element by looking for the CardContent and then going up three levels
    const cardContent = screen.getByText('News Story').closest('div');
    const cardElement =
      cardContent?.parentElement?.parentElement?.parentElement;
    expect(cardElement).toBeInTheDocument();

    // Click on the slot
    await user.click(cardElement!);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClearSlot when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onClearSlot = vi.fn();
    render(<StorySlot {...defaultProps} onClearSlot={onClearSlot} />);

    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();

    await user.click(clearButton);

    expect(onClearSlot).toHaveBeenCalledWith('1');
  });

  it('prevents event propagation when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onClearSlot = vi.fn();
    render(
      <StorySlot
        {...defaultProps}
        onClick={onClick}
        onClearSlot={onClearSlot}
      />
    );

    const clearButton = screen.getByRole('button');
    await user.click(clearButton);

    // The onClick should not be called when clear button is clicked
    expect(onClearSlot).toHaveBeenCalledWith('1');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies selected styling when isSelected is true', () => {
    render(<StorySlot {...defaultProps} isSelected={true} />);

    // Find the Card element by looking for the CardContent and then going up three levels
    const cardContent = screen.getByText('News Story').closest('div');
    const cardElement =
      cardContent?.parentElement?.parentElement?.parentElement;
    expect(cardElement).toHaveClass(
      'border-[#ff0a54]',
      'border-solid',
      'shadow-xl',
      'ring-2',
      'ring-[#ff0a54]/30',
      'bg-white'
    );
  });

  it('applies default styling when isSelected is false', () => {
    render(<StorySlot {...defaultProps} isSelected={false} />);

    // Find the Card element by looking for the CardContent and then going up three levels
    const cardContent = screen.getByText('News Story').closest('div');
    const cardElement =
      cardContent?.parentElement?.parentElement?.parentElement;
    expect(cardElement).toHaveClass(
      'border-dashed',
      'border-gray-400',
      'hover:border-[#ff0a54]/70'
    );
  });

  it('applies loading styling when isLoading is true and isSelected is true', () => {
    render(<StorySlot {...defaultProps} isSelected={true} isLoading={true} />);

    // Find the Card element by looking for the CardContent and then going up three levels
    const cardContent = screen.getByText('News Story').closest('div');
    const cardElement =
      cardContent?.parentElement?.parentElement?.parentElement;
    expect(cardElement).toHaveClass('animate-pulse');
  });

  it('does not apply loading styling when isLoading is false', () => {
    render(<StorySlot {...defaultProps} isSelected={true} isLoading={false} />);

    const slotCard = screen.getByText('News Story').closest('div');
    expect(slotCard).not.toHaveClass('animate-pulse');
  });

  it('renders with proper Persian text and labels', () => {
    render(<StorySlot {...defaultProps} />);

    expect(screen.getByText('پیش‌نویس')).toBeInTheDocument();
    expect(screen.getByText('تصویر')).toBeInTheDocument();
  });

  it('renders empty slot with proper Persian text', () => {
    render(<StorySlot {...defaultProps} story={undefined} />);

    expect(screen.getByText('اسلات خالی')).toBeInTheDocument();
    expect(screen.getByText('کلیک برای انتخاب')).toBeInTheDocument();
  });

  it('handles story without story type gracefully', () => {
    const storyWithoutType = {
      ...mockStory,
      storyType: undefined,
    };

    render(<StorySlot {...defaultProps} story={storyWithoutType} />);

    // Should fall back to title
    expect(screen.getByText('Test Story Title')).toBeInTheDocument();
    expect(screen.getByText('fallback-icon')).toBeInTheDocument();
  });

  it('handles story with minimal data gracefully', () => {
    const minimalStory = {
      id: '1',
      title: 'Minimal Story',
      day: '2024-01-01',
      order: 1,
      status: 'DRAFT' as const,
    };

    render(<StorySlot {...defaultProps} story={minimalStory} />);

    expect(screen.getByText('Minimal Story')).toBeInTheDocument();
    expect(screen.getByText('پیش‌نویس')).toBeInTheDocument();
    expect(screen.getByText('fallback-icon')).toBeInTheDocument();
  });

  it('renders drag handle with correct styling', () => {
    render(<StorySlot {...defaultProps} />);

    const orderNumber = screen.getByText('1');
    const dragHandle = orderNumber.closest('div');

    expect(dragHandle).toHaveClass(
      'w-8',
      'h-8',
      'bg-[#ff0a54]/30',
      'rounded-full',
      'cursor-grab'
    );
  });

  it('renders clear button with correct styling', () => {
    render(<StorySlot {...defaultProps} />);

    const clearButton = screen.getByRole('button');
    expect(clearButton).toHaveClass(
      'h-6',
      'w-6',
      'p-0',
      'rounded-full',
      'bg-red-100',
      'hover:bg-red-200',
      'text-red-600',
      'hover:text-red-700',
      'border',
      'border-red-200'
    );
  });

  it('renders with proper aspect ratio and dimensions', () => {
    render(<StorySlot {...defaultProps} />);

    // Find the Card element by looking for the CardContent and then going up three levels
    const cardContent = screen.getByText('News Story').closest('div');
    const cardElement =
      cardContent?.parentElement?.parentElement?.parentElement;
    expect(cardElement).toHaveClass(
      'aspect-[9/16]',
      'min-h-[300px]',
      'max-h-[450px]'
    );
  });

  it('handles rapid interactions gracefully', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onClearSlot = vi.fn();
    render(
      <StorySlot
        {...defaultProps}
        onClick={onClick}
        onClearSlot={onClearSlot}
      />
    );

    // Find the Card element by looking for the CardContent and then going up three levels
    const cardContent = screen.getByText('News Story').closest('div');
    const cardElement =
      cardContent?.parentElement?.parentElement?.parentElement;
    const clearButton = screen.getByRole('button');

    // Rapid interactions
    await user.click(cardElement!);
    await user.click(clearButton);
    await user.click(cardElement!);

    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onClearSlot).toHaveBeenCalledTimes(1);
  });
});

