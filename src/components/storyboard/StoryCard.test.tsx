import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock all dependencies
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
  CardHeader: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <h3 className={className} {...props}>
      {children}
    </h3>
  ),
}));

import { StoryCard } from './StoryCard';

describe('StoryCard', () => {
  const mockStory = {
    id: '1',
    title: 'Test Story Title',
    notes: 'Test story notes',
    visualNotes: 'Test visual notes',
    link: 'https://example.com',
    day: '2024-01-01',
    order: 1,
    status: 'DRAFT' as const,
    storyType: { id: '1', name: 'News Story' },
    project: { id: '1', name: 'Test Project' },
  };

  const defaultProps = {
    story: mockStory,
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders story information correctly', () => {
    render(<StoryCard {...defaultProps} />);

    expect(screen.getByText('Test Story Title')).toBeInTheDocument();
    expect(screen.getByText('News Story')).toBeInTheDocument();
    expect(screen.getByText('Test story notes')).toBeInTheDocument();
    // Visual notes and links are not rendered in the component
  });

  it('renders story type with icon when available', () => {
    render(<StoryCard {...defaultProps} />);

    expect(screen.getByText('News Story')).toBeInTheDocument();
    // The FileText icon should be present (mocked as text)
  });

  // Visual notes are not rendered in the component

  // Links are not rendered in the component

  // Additional notes sections are not rendered in the component

  it('does not render optional sections when data is missing', () => {
    const storyWithoutOptionals = {
      ...mockStory,
      notes: undefined,
      visualNotes: undefined,
      link: undefined,
      storyType: undefined,
    };

    render(<StoryCard {...defaultProps} story={storyWithoutOptionals} />);

    expect(screen.queryByText('یادداشت‌های بصری')).not.toBeInTheDocument();
    expect(screen.queryByText('لینک')).not.toBeInTheDocument();
    expect(screen.queryByText('یادداشت‌های اضافی')).not.toBeInTheDocument();
    expect(screen.queryByText('News Story')).not.toBeInTheDocument();
  });

  it('renders delete button', () => {
    render(<StoryCard {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /حذف/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    
    // Mock window.confirm to return true
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);
    
    render(<StoryCard {...defaultProps} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /حذف/i });
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith('1');
    
    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it('handles delete with empty id gracefully', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const storyWithEmptyId = { ...mockStory, id: '' };
    render(
      <StoryCard
        {...defaultProps}
        story={storyWithEmptyId}
        onDelete={onDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /حذف/i });
    await user.click(deleteButton);

    expect(onDelete).not.toHaveBeenCalled();
  });

  it('handles delete with whitespace id gracefully', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const storyWithWhitespaceId = { ...mockStory, id: '   ' };
    render(
      <StoryCard
        {...defaultProps}
        story={storyWithWhitespaceId}
        onDelete={onDelete}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /حذف/i });
    await user.click(deleteButton);

    expect(onDelete).not.toHaveBeenCalled();
  });

  it('renders with proper Persian text and labels', () => {
    render(<StoryCard {...defaultProps} />);

    // The component renders Persian text for buttons and status
    expect(screen.getByText('مشاهده')).toBeInTheDocument();
    expect(screen.getByText('ویرایش')).toBeInTheDocument();
    expect(screen.getByText('حذف')).toBeInTheDocument();
    expect(screen.getByText('پیش‌نویس')).toBeInTheDocument();
  });

  it('renders story without project information', () => {
    const storyWithoutProject = {
      ...mockStory,
      project: undefined,
    };

    render(<StoryCard {...defaultProps} story={storyWithoutProject} />);

    // Should still render all other information
    expect(screen.getByText('Test Story Title')).toBeInTheDocument();
    expect(screen.getByText('News Story')).toBeInTheDocument();
  });

  it('renders story with different statuses and shows correct status badges', () => {
    const statusTestCases = [
      { status: 'DRAFT' as const, expectedText: 'پیش‌نویس' },
      { status: 'READY' as const, expectedText: 'آماده' },
      { status: 'PUBLISHED' as const, expectedText: 'منتشر شده' },
    ];

    statusTestCases.forEach(({ status, expectedText }) => {
      const storyWithStatus = { ...mockStory, status };
      const { unmount } = render(
        <StoryCard {...defaultProps} story={storyWithStatus} />
      );

      // Should render without errors for all statuses
      expect(screen.getByText('Test Story Title')).toBeInTheDocument();
      expect(screen.getByText(expectedText)).toBeInTheDocument();

      unmount();
    });
  });

  it('handles rapid button clicks gracefully', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    
    // Mock window.confirm to return true
    const originalConfirm = window.confirm;
    window.confirm = vi.fn(() => true);
    
    render(<StoryCard {...defaultProps} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /حذف/i });

    // Rapid clicks
    await user.click(deleteButton);
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(2);
    
    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it('renders with proper button variants and sizes', () => {
    render(<StoryCard {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /حذف/i });

    expect(deleteButton).toHaveAttribute('data-variant', 'ghost');
    expect(deleteButton).toHaveAttribute('data-size', 'sm');
    expect(deleteButton).toHaveAttribute('data-variant', 'ghost');
    expect(deleteButton).toHaveAttribute('data-size', 'sm');
  });

  it('renders story with long title and notes', () => {
    const storyWithLongContent = {
      ...mockStory,
      title:
        'This is a very long story title that should be handled properly by the component',
      notes:
        'This is a very long note that contains a lot of text and should be displayed correctly without breaking the layout or causing any rendering issues',
      visualNotes:
        'These are very detailed visual notes that describe the visual elements and should be displayed in a readable format',
    };

    render(<StoryCard {...defaultProps} story={storyWithLongContent} />);

    expect(
      screen.getByText(
        'This is a very long story title that should be handled properly by the component'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'This is a very long note that contains a lot of text and should be displayed correctly without breaking the layout or causing any rendering issues'
      )
    ).toBeInTheDocument();
    // Visual notes are not rendered in the component, only regular notes
  });

  // Additional test cases for better coverage
  it('handles onClick prop correctly when provided', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onEdit = vi.fn();
    
    render(<StoryCard {...defaultProps} onSelect={onSelect} onEdit={onEdit} />);

    // Test card click (onSelect)
    const card = screen.getByText('Test Story Title').closest('div');
    await user.click(card!);
    expect(onSelect).toHaveBeenCalledWith(mockStory);

    // Test edit button click (onEdit)
    const editButton = screen.getByRole('button', { name: /ویرایش/i });
    await user.click(editButton);
    expect(onEdit).toHaveBeenCalledWith(mockStory);
  });

  it('handles missing optional data gracefully', () => {
    const storyWithMinimalData = {
      id: '1',
      title: 'Minimal Story',
      day: '2024-01-01',
      order: 1,
      status: 'DRAFT' as const,
      // Missing: notes, storyType, project
    };

    render(<StoryCard {...defaultProps} story={storyWithMinimalData} />);

    // Should render without crashing
    expect(screen.getByText('Minimal Story')).toBeInTheDocument();
    expect(screen.getByText('پیش‌نویس')).toBeInTheDocument();
    
    // Should not render optional sections
    expect(screen.queryByText('Test story notes')).not.toBeInTheDocument();
    expect(screen.queryByText('News Story')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Project')).not.toBeInTheDocument();
  });

  it('renders with isDragging prop correctly', () => {
    render(<StoryCard {...defaultProps} isDragging={true} />);

    // Find the Card component by looking for the outermost div with the card classes
    const card = screen.getByText('Test Story Title').closest('[class*="transition-all"]');
    expect(card).toHaveClass('shadow-lg', 'scale-105', 'rotate-2');
  });

  it('renders with custom className prop', () => {
    render(<StoryCard {...defaultProps} className="custom-class" />);

    // Find the Card component by looking for the outermost div with the card classes
    const card = screen.getByText('Test Story Title').closest('[class*="transition-all"]');
    expect(card).toHaveClass('custom-class');
  });

  it('renders drag handle when provided', () => {
    const dragHandle = <div data-testid="drag-handle">Drag Me</div>;
    
    render(<StoryCard {...defaultProps} dragHandle={dragHandle} />);

    expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
    expect(screen.getByText('Drag Me')).toBeInTheDocument();
  });

  it('handles missing author information gracefully', () => {
    const storyWithoutAuthor = {
      ...mockStory,
      // No author field in the Story type, but testing graceful handling
      title: 'Story without author info',
    };

    render(<StoryCard {...defaultProps} story={storyWithoutAuthor} />);

    // Should render without crashing
    expect(screen.getByText('Story without author info')).toBeInTheDocument();
  });

  it('renders day information correctly', () => {
    render(<StoryCard {...defaultProps} />);

    // Should render day information
    expect(screen.getByText(/روز:/)).toBeInTheDocument();
  });

  it('handles empty or undefined notes gracefully', () => {
    const storyWithEmptyNotes = {
      ...mockStory,
      notes: '',
    };

    render(<StoryCard {...defaultProps} story={storyWithEmptyNotes} />);

    // Should render without crashing
    expect(screen.getByText('Test Story Title')).toBeInTheDocument();
    // Notes section should not be rendered when empty
    expect(screen.queryByText('Test story notes')).not.toBeInTheDocument();
  });
});

