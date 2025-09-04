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
    expect(screen.getByText('Test visual notes')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });

  it('renders story type with icon when available', () => {
    render(<StoryCard {...defaultProps} />);

    expect(screen.getByText('News Story')).toBeInTheDocument();
    // The FileText icon should be present (mocked as text)
  });

  it('renders visual notes section when available', () => {
    render(<StoryCard {...defaultProps} />);

    expect(screen.getByText('یادداشت‌های بصری')).toBeInTheDocument();
    expect(screen.getByText('Test visual notes')).toBeInTheDocument();
  });

  it('renders link section when available', () => {
    render(<StoryCard {...defaultProps} />);

    expect(screen.getByText('لینک')).toBeInTheDocument();
    const linkElement = screen.getByText('https://example.com');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.closest('a')).toHaveAttribute(
      'href',
      'https://example.com'
    );
    expect(linkElement.closest('a')).toHaveAttribute('target', '_blank');
    expect(linkElement.closest('a')).toHaveAttribute(
      'rel',
      'noopener noreferrer'
    );
  });

  it('renders notes section when available', () => {
    render(<StoryCard {...defaultProps} />);

    expect(screen.getByText('یادداشت‌های اضافی')).toBeInTheDocument();
    expect(screen.getByText('Test story notes')).toBeInTheDocument();
  });

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

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<StoryCard {...defaultProps} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith('1');
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

    const deleteButton = screen.getByRole('button', { name: /delete/i });
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

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(onDelete).not.toHaveBeenCalled();
  });

  it('renders with proper Persian text and labels', () => {
    render(<StoryCard {...defaultProps} />);

    expect(screen.getByText('یادداشت‌های بصری')).toBeInTheDocument();
    expect(screen.getByText('لینک')).toBeInTheDocument();
    expect(screen.getByText('یادداشت‌های اضافی')).toBeInTheDocument();
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

  it('renders story with different statuses', () => {
    const statuses = ['DRAFT', 'READY', 'PUBLISHED'] as const;

    statuses.forEach(status => {
      const storyWithStatus = { ...mockStory, status };
      const { unmount } = render(
        <StoryCard {...defaultProps} story={storyWithStatus} />
      );

      // Should render without errors for all statuses
      expect(screen.getByText('Test Story Title')).toBeInTheDocument();

      unmount();
    });
  });

  it('handles rapid button clicks gracefully', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<StoryCard {...defaultProps} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });

    // Rapid clicks
    await user.click(deleteButton);
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(2);
  });

  it('renders with proper button variants and sizes', () => {
    render(<StoryCard {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });

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
    expect(
      screen.getByText(
        'These are very detailed visual notes that describe the visual elements and should be displayed in a readable format'
      )
    ).toBeInTheDocument();
  });
});
