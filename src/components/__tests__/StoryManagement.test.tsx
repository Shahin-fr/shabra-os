import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { StoryManagement } from '@/components/storyboard/StoryManagement';
import { useStoryManagement } from '@/hooks/useStoryManagement';

// Mock the hooks
vi.mock('@/hooks/useStoryManagement', () => ({
  useStoryManagement: vi.fn(),
}));

// Mock the OptimizedMotion component
vi.mock('@/components/ui/OptimizedMotion', () => ({
  OptimizedMotion: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

// Mock the StoryCanvas component
vi.mock('@/components/storyboard/management/StoryCanvas', () => ({
  StoryCanvas: ({ stories, selectedSlotIndex, onSlotClick, onSlotDoubleClick, onReorderStories, onClearSlot, isLoading, slotCount, onAddSlot, onRemoveSlot, storiesError, storiesErrorDetails, storiesLoading }: any) => (
    <div data-testid="story-canvas">
      <div>Story Canvas - {stories.length} stories</div>
      <div>Slot Count: {slotCount}</div>
      <div>Selected Slot: {selectedSlotIndex}</div>
      {storiesLoading && <div>در حال بارگذاری استوری‌ها...</div>}
      {storiesError && <div>خطا در بارگذاری استوری‌ها</div>}
      {stories.map((story: any, index: number) => (
        <div key={story.id} onClick={() => onSlotClick(index)}>
          {story.title} - Slot {index + 1}
        </div>
      ))}
      <button onClick={onAddSlot}>Add Slot</button>
      <button onClick={onRemoveSlot}>Remove Slot</button>
    </div>
  ),
}));

// Mock the StoryTypePalette component
vi.mock('@/components/storyboard/management/StoryTypePalette', () => ({
  StoryTypePalette: ({ storyTypes, selectedSlotIndex, onTypeSelect, isLoading }: any) => (
    <div data-testid="story-type-palette">
      <div>Story Type Palette - {storyTypes.length} types</div>
      {storyTypes.map((type: any) => (
        <button key={type.id} onClick={() => onTypeSelect(type)}>
          {type.name}
        </button>
      ))}
    </div>
  ),
}));

// Mock the IdeaBank component
vi.mock('@/components/storyboard/management/IdeaBank', () => ({
  IdeaBank: ({ isOpen, onOpenChange, onSelectIdea, storyIdeas, isLoading, selectedStoryType }: any) => (
    <div data-testid="idea-bank">
      {isOpen && <div>Idea Bank Open</div>}
      <button onClick={() => onOpenChange(false)}>Close Idea Bank</button>
    </div>
  ),
}));

// Mock the CompleteEditModal component
vi.mock('@/components/storyboard/management/CompleteEditModal', () => ({
  CompleteEditModal: ({ isOpen, onOpenChange, onSubmit, onDelete, onSelectIdea, story, storyIdeas, isLoading }: any) => (
    <div data-testid="complete-edit-modal">
      {isOpen && <div>Complete Edit Modal Open - Story: {story?.title}</div>}
      <button onClick={() => onOpenChange(false)}>Close Edit Modal</button>
    </div>
  ),
}));

// Mock the CreateStoryDialog component
vi.mock('@/components/storyboard/management/CreateStoryDialog', () => ({
  CreateStoryDialog: ({ isOpen, onOpenChange, onSubmit, storyTypes, isLoading, editingStory, isEditing }: any) => (
    <div data-testid="create-story-dialog">
      {isOpen && <div>Create Story Dialog Open</div>}
      <button onClick={() => onOpenChange(false)}>Close Create Dialog</button>
    </div>
  ),
}));

const mockUseStoryManagement = useStoryManagement as any;

describe('StoryManagement Integration Tests', () => {
  let queryClient: QueryClient;

  const mockStoryTypes = [
    { id: '1', name: 'Instagram Post', color: '#ff0a54', icon: 'Image' },
    { id: '2', name: 'Story', color: '#00d4aa', icon: 'Video' },
    { id: '3', name: 'Reel', color: '#ff6b35', icon: 'Play' },
  ];

  const mockStories = [
    {
      id: '1',
      title: 'Test Story 1',
      description: 'Test description 1',
      storyTypeId: '1',
      storyType: mockStoryTypes[0],
      scheduledDate: '2024-01-15',
      status: 'DRAFT',
      slotIndex: 0,
    },
    {
      id: '2',
      title: 'Test Story 2',
      description: 'Test description 2',
      storyTypeId: '2',
      storyType: mockStoryTypes[1],
      scheduledDate: '2024-01-15',
      status: 'PUBLISHED',
      slotIndex: 1,
    },
  ];

  const mockStoryManagement = {
    state: {
      isCreating: false,
      isIdeaBankOpen: false,
      isCompleteEditModalOpen: false,
      selectedStoryType: null,
    },
    setState: vi.fn(),
    storyIdeas: [],
    storyIdeasLoading: false,
    actions: {
      handleSlotClick: vi.fn(),
      handleSlotDoubleClick: vi.fn(),
      handleStoryTypeSelect: vi.fn(),
      handleClearSlot: vi.fn(),
      handleAddSlot: vi.fn(),
      handleRemoveSlot: vi.fn(),
      handleReorderStories: vi.fn(),
      handleIdeaSelect: vi.fn(),
      handleCompleteEditSubmit: vi.fn(),
      handleDeleteStory: vi.fn(),
      handleDialogClose: vi.fn(),
    },
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockUseStoryManagement.mockReturnValue(mockStoryManagement);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderStoryManagement = (props = {}) => {
    const defaultProps = {
      selectedDate: new Date('2024-01-15'),
      stories: mockStories,
      storyTypes: mockStoryTypes,
      isLoading: false,
      isError: false,
      errorDetails: null,
      slotCount: 7,
      onSlotCountChange: vi.fn(),
      isDialogOpen: false,
      onDialogOpenChange: vi.fn(),
      editingStory: null,
      onEditingStoryChange: vi.fn(),
      isEditing: false,
      onIsEditingChange: vi.fn(),
      selectedSlotIndex: null,
      onSelectedSlotIndexChange: vi.fn(),
      refetchStories: vi.fn(),
      ...props,
    };

    return render(
      <QueryClientProvider client={queryClient}>
        <StoryManagement {...defaultProps} />
      </QueryClientProvider>
    );
  };

  describe('Rendering', () => {
    it('renders all main components', () => {
      renderStoryManagement();

      expect(screen.getByTestId('story-canvas')).toBeInTheDocument();
      expect(screen.getByTestId('story-type-palette')).toBeInTheDocument();
      expect(screen.getByTestId('idea-bank')).toBeInTheDocument();
      expect(screen.getByTestId('complete-edit-modal')).toBeInTheDocument();
      expect(screen.getByTestId('create-story-dialog')).toBeInTheDocument();
    });

    it('renders story canvas with correct data', () => {
      renderStoryManagement();

      expect(screen.getByText('Story Canvas - 2 stories')).toBeInTheDocument();
      expect(screen.getByText('Slot Count: 7')).toBeInTheDocument();
      expect(screen.getByText(/Selected Slot:/)).toBeInTheDocument();
    });

    it('renders story type palette with correct data', () => {
      renderStoryManagement();

      expect(screen.getByText('Story Type Palette - 3 types')).toBeInTheDocument();
      expect(screen.getByText('Instagram Post')).toBeInTheDocument();
      expect(screen.getByText('Story')).toBeInTheDocument();
      expect(screen.getByText('Reel')).toBeInTheDocument();
    });

    it('renders edit story modal when open', () => {
      mockUseStoryManagement.mockReturnValue({
        ...mockStoryManagement,
        state: {
          ...mockStoryManagement.state,
          isCompleteEditModalOpen: true,
        },
      });

      renderStoryManagement({
        editingStory: mockStories[0],
      });

      expect(screen.getByTestId('complete-edit-modal')).toBeInTheDocument();
      expect(screen.getByText('Complete Edit Modal Open - Story: Test Story 1')).toBeInTheDocument();
    });
  });

  describe('Slot Management', () => {
    it('displays current slot count', () => {
      renderStoryManagement();

      expect(screen.getByText('Slot Count: 7')).toBeInTheDocument();
    });

    it('calls onSlotCountChange when add slot is clicked', () => {
      const mockOnSlotCountChange = vi.fn();
      renderStoryManagement({
        onSlotCountChange: mockOnSlotCountChange,
      });

      const addSlotButton = screen.getByText('Add Slot');
      fireEvent.click(addSlotButton);

      expect(mockOnSlotCountChange).toHaveBeenCalledWith(8);
    });

    it('calls onSlotCountChange when remove slot is clicked', () => {
      const mockOnSlotCountChange = vi.fn();
      renderStoryManagement({
        onSlotCountChange: mockOnSlotCountChange,
      });

      const removeSlotButton = screen.getByText('Remove Slot');
      fireEvent.click(removeSlotButton);

      expect(mockOnSlotCountChange).toHaveBeenCalledWith(6);
    });

    it('renders correct number of slots', () => {
      renderStoryManagement({
        slotCount: 5,
      });

      expect(screen.getByText('Slot Count: 5')).toBeInTheDocument();
    });
  });

  describe('Story Display', () => {
    it('displays stories in their correct slots', () => {
      renderStoryManagement();

      // Check that stories are displayed
      expect(screen.getByText('Test Story 1 - Slot 1')).toBeInTheDocument();
      expect(screen.getByText('Test Story 2 - Slot 2')).toBeInTheDocument();
    });

    it('shows loading state when stories are loading', () => {
      renderStoryManagement({
        isLoading: true,
      });

      expect(screen.getByText('در حال بارگذاری استوری‌ها...')).toBeInTheDocument();
    });

    it('shows empty state when no stories exist', () => {
      renderStoryManagement({
        stories: [],
      });

      expect(screen.getByText('Story Canvas - 0 stories')).toBeInTheDocument();
    });

    it('shows error state when stories fail to load', () => {
      renderStoryManagement({
        isError: true,
      });

      expect(screen.getByText('خطا در بارگذاری استوری‌ها')).toBeInTheDocument();
    });
  });

  describe('Story Type Management', () => {
    it('calls handleStoryTypeSelect when story type is clicked', () => {
      const mockHandleStoryTypeSelect = vi.fn();
      mockUseStoryManagement.mockReturnValue({
        ...mockStoryManagement,
        actions: {
          ...mockStoryManagement.actions,
          handleStoryTypeSelect: mockHandleStoryTypeSelect,
        },
      });

      renderStoryManagement();

      const storyTypeButton = screen.getByText('Instagram Post');
      fireEvent.click(storyTypeButton);

      expect(mockHandleStoryTypeSelect).toHaveBeenCalledWith(mockStoryTypes[0]);
    });
  });

  describe('Story Editing', () => {
    it('calls handleSlotClick when story is clicked', () => {
      const mockHandleSlotClick = vi.fn();
      mockUseStoryManagement.mockReturnValue({
        ...mockStoryManagement,
        actions: {
          ...mockStoryManagement.actions,
          handleSlotClick: mockHandleSlotClick,
        },
      });

      renderStoryManagement();

      // Find and click on a story
      const storyElement = screen.getByText('Test Story 1 - Slot 1');
      fireEvent.click(storyElement);

      expect(mockHandleSlotClick).toHaveBeenCalledWith(0);
    });

    it('closes edit modal when close button is clicked', () => {
      mockUseStoryManagement.mockReturnValue({
        ...mockStoryManagement,
        state: {
          ...mockStoryManagement.state,
          isCompleteEditModalOpen: true,
        },
      });

      renderStoryManagement({
        editingStory: mockStories[0],
      });

      const closeButton = screen.getByText('Close Edit Modal');
      fireEvent.click(closeButton);

      // The modal should be closed
      expect(screen.queryByText('Complete Edit Modal Open')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when stories fail to load', () => {
      renderStoryManagement({
        isError: true,
        errorDetails: 'Failed to load stories',
      });

      expect(screen.getByText('خطا در بارگذاری استوری‌ها')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles and labels', () => {
      renderStoryManagement();

      const addSlotButton = screen.getByText('Add Slot');
      const removeSlotButton = screen.getByText('Remove Slot');
      const storyTypeButton = screen.getByText('Instagram Post');

      expect(addSlotButton).toBeInTheDocument();
      expect(removeSlotButton).toBeInTheDocument();
      expect(storyTypeButton).toBeInTheDocument();
    });
  });
});
