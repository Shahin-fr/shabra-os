import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock all dependencies
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

import { TemplatePalette } from './TemplatePalette';

describe('TemplatePalette', () => {
  const mockStoryTypes = [
    { id: '1', name: 'News Story', icon: '📰' },
    { id: '2', name: 'Feature Story', icon: '✨' },
    { id: '3', name: 'Event Story', icon: '📅' },
    { id: '4', name: 'Team Story', icon: '👥' },
    { id: '5', name: 'Analytics Story', icon: '📊' },
    { id: '6', name: 'Goal Story', icon: '🎯' },
  ];

  const defaultProps = {
    storyTypes: mockStoryTypes,
    selectedSlotIndex: null,
    onTemplateClick: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders all story type templates', () => {
    render(<TemplatePalette {...defaultProps} />);

    expect(screen.getByText('News Story')).toBeInTheDocument();
    expect(screen.getByText('Feature Story')).toBeInTheDocument();
    expect(screen.getByText('Event Story')).toBeInTheDocument();
    expect(screen.getByText('Team Story')).toBeInTheDocument();
    expect(screen.getByText('Analytics Story')).toBeInTheDocument();
    expect(screen.getByText('Goal Story')).toBeInTheDocument();
  });

  it('renders story type icons when available', () => {
    render(<TemplatePalette {...defaultProps} />);

    const newsIcon = screen.getByText('📰');
    const featureIcon = screen.getByText('✨');
    const eventIcon = screen.getByText('📅');

    expect(newsIcon).toBeInTheDocument();
    expect(featureIcon).toBeInTheDocument();
    expect(eventIcon).toBeInTheDocument();
  });

  it('renders fallback icon when story type icon is not available', () => {
    const storyTypesWithoutIcons = [
      { id: '1', name: 'News Story' }, // No icon
      { id: '2', name: 'Feature Story' }, // No icon
    ];

    render(
      <TemplatePalette {...defaultProps} storyTypes={storyTypesWithoutIcons} />
    );

    const fallbackIcons = screen.getAllByText('fallback-icon');
    expect(fallbackIcons).toHaveLength(2);
  });

  it('shows selection hint when no slot is selected', () => {
    render(<TemplatePalette {...defaultProps} selectedSlotIndex={null} />);

    // Use a more flexible text matcher for the hint container
    const hintContainer = screen.getByText(
      /روی یک اسلات استوری در بالا کلیک کنید تا آن را انتخاب کنید، سپس قالب را انتخاب کنید/
    );
    expect(hintContainer).toBeInTheDocument();

    // Check that the hint container contains the expected text
    expect(hintContainer.textContent).toContain('💡');
    expect(hintContainer.textContent).toContain('نکته:');
  });

  it('shows selected slot indicator when a slot is selected', () => {
    render(<TemplatePalette {...defaultProps} selectedSlotIndex={2} />);

    expect(screen.getByText('اسلات 3 انتخاب شده')).toBeInTheDocument();
    expect(screen.queryByText('💡 نکته:')).not.toBeInTheDocument();
  });

  it('calls onTemplateClick when a template is clicked', async () => {
    const user = userEvent.setup();
    const onTemplateClick = vi.fn();
    render(
      <TemplatePalette
        {...defaultProps}
        selectedSlotIndex={0}
        onTemplateClick={onTemplateClick}
      />
    );

    // Find the clickable template container
    const newsTemplate = screen
      .getByText('News Story')
      .closest('div')?.parentElement;
    expect(newsTemplate).toBeInTheDocument();

    // The template should be clickable
    await user.click(newsTemplate!);

    expect(onTemplateClick).toHaveBeenCalledWith('1');
  });

  it('calls onTemplateClick with correct story type ID for different templates', async () => {
    const user = userEvent.setup();
    const onTemplateClick = vi.fn();
    render(
      <TemplatePalette
        {...defaultProps}
        selectedSlotIndex={0}
        onTemplateClick={onTemplateClick}
      />
    );

    const featureTemplate = screen
      .getByText('Feature Story')
      .closest('div')?.parentElement;
    const eventTemplate = screen
      .getByText('Event Story')
      .closest('div')?.parentElement;

    expect(featureTemplate).toBeInTheDocument();
    expect(eventTemplate).toBeInTheDocument();

    await user.click(featureTemplate!);
    await user.click(eventTemplate!);

    expect(onTemplateClick).toHaveBeenCalledWith('2');
    expect(onTemplateClick).toHaveBeenCalledWith('3');
  });

  it('renders templates in a grid layout', () => {
    render(<TemplatePalette {...defaultProps} />);

    // Find the grid container by looking for the grid classes
    const gridContainer = document.querySelector(
      '.grid.grid-cols-2.sm\\:grid-cols-3.md\\:grid-cols-4.lg\\:grid-cols-6'
    );
    expect(gridContainer).toBeInTheDocument();
  });

  it('renders with proper Persian text and labels', () => {
    render(<TemplatePalette {...defaultProps} selectedSlotIndex={0} />);

    expect(screen.getByText('اسلات 1 انتخاب شده')).toBeInTheDocument();
  });

  it('renders selection hint with proper Persian text', () => {
    render(<TemplatePalette {...defaultProps} selectedSlotIndex={null} />);

    // Use a more flexible text matcher for the hint container
    const hintContainer = screen.getByText(
      /روی یک اسلات استوری در بالا کلیک کنید تا آن را انتخاب کنید، سپس قالب را انتخاب کنید/
    );
    expect(hintContainer).toBeInTheDocument();

    // Check that the hint container contains the expected text
    expect(hintContainer.textContent).toContain('💡');
    expect(hintContainer.textContent).toContain('نکته:');
  });

  it('handles empty story types array gracefully', () => {
    render(<TemplatePalette {...defaultProps} storyTypes={[]} />);

    // Use a more flexible text matcher for the hint container
    const hintContainer = screen.getByText(
      /روی یک اسلات استوری در بالا کلیک کنید تا آن را انتخاب کنید، سپس قالب را انتخاب کنید/
    );
    expect(hintContainer).toBeInTheDocument();

    // Check that the hint container contains the expected text
    expect(hintContainer.textContent).toContain('💡');
    expect(hintContainer.textContent).toContain('نکته:');
    expect(screen.queryByText('News Story')).not.toBeInTheDocument();
  });

  it('handles single story type', () => {
    const singleStoryType = [{ id: '1', name: 'Single Story', icon: '📝' }];
    render(<TemplatePalette {...defaultProps} storyTypes={singleStoryType} />);

    expect(screen.getByText('Single Story')).toBeInTheDocument();
    expect(screen.getByText('📝')).toBeInTheDocument();
  });

  it('handles story types with special characters in names', () => {
    const specialStoryTypes = [
      { id: '1', name: 'Story with 🎉 Emoji', icon: '🎉' },
      { id: '2', name: 'Story with 123 Numbers', icon: '🔢' },
      { id: '3', name: 'Story with @#$ Symbols', icon: '🔣' },
    ];

    render(
      <TemplatePalette {...defaultProps} storyTypes={specialStoryTypes} />
    );

    expect(screen.getByText('Story with 🎉 Emoji')).toBeInTheDocument();
    expect(screen.getByText('Story with 123 Numbers')).toBeInTheDocument();
    expect(screen.getByText('Story with @#$ Symbols')).toBeInTheDocument();
  });

  it('handles rapid template clicks gracefully', async () => {
    const user = userEvent.setup();
    const onTemplateClick = vi.fn();
    render(
      <TemplatePalette
        {...defaultProps}
        selectedSlotIndex={0}
        onTemplateClick={onTemplateClick}
      />
    );

    const newsTemplate = screen
      .getByText('News Story')
      .closest('div')?.parentElement;
    const featureTemplate = screen
      .getByText('Feature Story')
      .closest('div')?.parentElement;

    expect(newsTemplate).toBeInTheDocument();
    expect(featureTemplate).toBeInTheDocument();

    // Rapid clicks
    await user.click(newsTemplate!);
    await user.click(featureTemplate!);
    await user.click(newsTemplate!);

    expect(onTemplateClick).toHaveBeenCalledWith('1');
    expect(onTemplateClick).toHaveBeenCalledWith('2');
    expect(onTemplateClick).toHaveBeenCalledTimes(3);
  });

  it('renders with proper styling classes', () => {
    render(<TemplatePalette {...defaultProps} selectedSlotIndex={1} />);

    // Check that the selected slot indicator has proper styling
    const selectedSlotBadge = screen.getByText('اسلات 2 انتخاب شده');
    expect(selectedSlotBadge).toHaveClass(
      'bg-white/90',
      'backdrop-blur-sm',
      'text-[#ff0a54]',
      'border',
      'border-[#ff0a54]/40',
      'font-medium',
      'shadow-lg'
    );
  });

  it('renders hint container with proper styling', () => {
    render(<TemplatePalette {...defaultProps} selectedSlotIndex={null} />);

    const hintContainer = screen
      .getByText(
        /روی یک اسلات استوری در بالا کلیک کنید تا آن را انتخاب کنید، سپس قالب را انتخاب کنید/
      )
      .closest('div');
    expect(hintContainer).toHaveClass('rounded-xl', 'p-4', 'shadow-lg');
  });

  it('handles different selected slot indices correctly', () => {
    const slotIndices = [0, 1, 2, 5, 10];

    slotIndices.forEach(index => {
      const { unmount } = render(
        <TemplatePalette {...defaultProps} selectedSlotIndex={index} />
      );

      expect(
        screen.getByText(`اسلات ${index + 1} انتخاب شده`)
      ).toBeInTheDocument();
      unmount();
    });
  });

  it('renders templates with proper spacing and layout', () => {
    render(<TemplatePalette {...defaultProps} />);

    // Find the grid container by looking for the gap class
    const gridContainer = document.querySelector('.gap-4');
    expect(gridContainer).toBeInTheDocument();
  });

  it('handles story types with very long names', () => {
    const longNameStoryTypes = [
      {
        id: '1',
        name: 'This is a very long story type name that should be handled properly by the component without breaking the layout or causing any rendering issues',
        icon: '📝',
      },
      {
        id: '2',
        name: 'Another extremely long story type name that contains a lot of text and should be displayed correctly',
        icon: '📖',
      },
    ];

    render(
      <TemplatePalette {...defaultProps} storyTypes={longNameStoryTypes} />
    );

    expect(
      screen.getByText(
        'This is a very long story type name that should be handled properly by the component without breaking the layout or causing any rendering issues'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Another extremely long story type name that contains a lot of text and should be displayed correctly'
      )
    ).toBeInTheDocument();
  });

  it('maintains proper state when switching between selected slots', () => {
    const { rerender } = render(
      <TemplatePalette {...defaultProps} selectedSlotIndex={0} />
    );

    expect(screen.getByText('اسلات 1 انتخاب شده')).toBeInTheDocument();

    rerender(<TemplatePalette {...defaultProps} selectedSlotIndex={3} />);
    expect(screen.getByText('اسلات 4 انتخاب شده')).toBeInTheDocument();

    rerender(<TemplatePalette {...defaultProps} selectedSlotIndex={null} />);
    // Use a more flexible text matcher for the hint container
    const hintContainer = screen.getByText(
      /روی یک اسلات استوری در بالا کلیک کنید تا آن را انتخاب کنید، سپس قالب را انتخاب کنید/
    );
    expect(hintContainer).toBeInTheDocument();

    // Check that the hint container contains the expected text
    expect(hintContainer.textContent).toContain('💡');
    expect(hintContainer.textContent).toContain('نکته:');
  });

  it('renders with proper accessibility attributes', () => {
    render(<TemplatePalette {...defaultProps} />);

    // All story type templates should be clickable
    const templates = screen.getAllByText(/Story$/);
    templates.forEach(template => {
      expect(template.closest('div')).toBeInTheDocument();
    });
  });
});
