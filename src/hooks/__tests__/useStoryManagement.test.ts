import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { useStoryManagement } from '../useStoryManagement';
import { Story } from '@/types/story';
import { StoryType } from '@/types/story-management';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to create mock Response
const createMockResponse = (data: any, ok: boolean = true, status: number = 200) => ({
  ok,
  status,
  json: vi.fn().mockResolvedValue(data),
});

// Add debugging to see what's happening
beforeEach(() => {
  console.log('Setting up mock fetch');
  mockFetch.mockClear();
  // Set a default mock response to prevent undefined responses
  mockFetch.mockResolvedValue(createMockResponse({ success: true }));
});

// Mock the useStoryIdeas hook
vi.mock('../useStoryIdeas', () => ({
  useStoryIdeas: () => ({
    data: [
      { id: 'idea-1', title: 'Test Idea 1', content: 'Test content 1' },
      { id: 'idea-2', title: 'Test Idea 2', content: 'Test content 2' },
    ],
    isLoading: false,
  }),
}));

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
afterEach(() => {
  console.error = originalConsoleError;
});

// Helper function to create a wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useStoryManagement', () => {
  const mockStories: Story[] = [
    {
      id: 'story-1',
      title: 'Test Story 1',
      // content: 'Test content 1', // This field doesn't exist in Story type
      // storyTypeId: 'type-1', // This field doesn't exist in Story type
      // scheduledDate: '2024-01-01', // This field doesn't exist in Story type
      status: 'DRAFT',
      order: 1, // Add order property
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'story-2',
      title: 'Test Story 2',
      // content: 'Test content 2', // This field doesn't exist in Story type
      // storyTypeId: 'type-2', // This field doesn't exist in Story type
      // scheduledDate: '2024-01-02', // This field doesn't exist in Story type
      status: 'PUBLISHED',
      order: 2, // Add order property
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  const mockStoryTypes: StoryType[] = [
    { id: 'type-1', name: 'Post', description: 'Social media post', color: '#ff0000', icon: 'FileText', isActive: true },
    { id: 'type-2', name: 'Story', description: 'Instagram story', color: '#00ff00', icon: 'Image', isActive: true },
  ];

  const defaultProps = {
    selectedDate: new Date('2024-01-01'),
    stories: mockStories,
    selectedSlotIndex: null,
    editingStory: null,
    onSelectedSlotIndexChange: vi.fn(),
    onEditingStoryChange: vi.fn(),
    onIsEditingChange: vi.fn(),
    onDialogOpenChange: vi.fn(),
    refetchStories: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useStoryManagement(defaultProps), {
      wrapper: createWrapper(),
    });

    expect(result.current.state.isCreating).toBe(false);
    expect(result.current.state.isIdeaBankOpen).toBe(false);
    expect(result.current.state.isCompleteEditModalOpen).toBe(false);
    expect(result.current.state.selectedStoryType).toBeNull();
    expect(result.current.storyIdeas).toEqual([
      { id: 'idea-1', title: 'Test Idea 1', content: 'Test content 1' },
      { id: 'idea-2', title: 'Test Idea 2', content: 'Test content 2' },
    ]);
    expect(result.current.storyIdeasLoading).toBe(false);
  });

  it('should handle slot click correctly', () => {
    const { result } = renderHook(() => useStoryManagement(defaultProps), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.actions.handleSlotClick(0);
    });

    expect(defaultProps.onSelectedSlotIndexChange).toHaveBeenCalledWith(0);
  });

  it('should handle story type selection correctly', async () => {
    const { result } = renderHook(() => useStoryManagement({
      ...defaultProps,
      selectedSlotIndex: 0, // Required for the function to execute
    }), {
      wrapper: createWrapper(),
    });

    // Mock successful API response
    mockFetch.mockResolvedValueOnce(createMockResponse({ success: true }));

    await act(async () => {
      result.current.actions.handleStoryTypeSelect(mockStoryTypes[0]!);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.stringContaining('"title":"Post"'),
    });
  });

  it('should handle story deletion correctly', async () => {
    const { result } = renderHook(() => useStoryManagement(defaultProps), {
      wrapper: createWrapper(),
    });

    // Mock successful API response
    mockFetch.mockResolvedValueOnce(createMockResponse({ success: true }));

    await act(async () => {
      result.current.actions.handleDeleteStory('story-1');
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/stories/story-1', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('should handle complete edit submit for new story', async () => {
    const { result } = renderHook(() => useStoryManagement({
      ...defaultProps,
      selectedSlotIndex: 0,
    }), {
      wrapper: createWrapper(),
    });

    // Mock successful API response
    mockFetch.mockResolvedValueOnce(createMockResponse({ success: true }));

    const storyData = {
      title: 'New Story',
      notes: 'Test notes',
      link: 'https://example.com',
      customTitle: 'Custom Title',
    };

    await act(async () => {
      result.current.actions.handleCompleteEditSubmit(storyData);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/stories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.stringContaining('"title":"New Story"'),
    });
  });

  it('should handle complete edit submit for existing story', async () => {
    const { result } = renderHook(() => useStoryManagement({
      ...defaultProps,
      editingStory: mockStories[0] || null,
    }), {
      wrapper: createWrapper(),
    });

    // Mock successful API response
    mockFetch.mockResolvedValueOnce(createMockResponse({ success: true }));

    const storyData = {
      title: 'Updated Story',
      notes: 'Updated notes',
    };

    await act(async () => {
      result.current.actions.handleCompleteEditSubmit(storyData);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/stories/story-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.stringContaining('"title":"Updated Story"'),
    });
  });

  it('should handle dialog close correctly', () => {
    const { result } = renderHook(() => useStoryManagement(defaultProps), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.actions.handleDialogClose(false);
    });

    expect(defaultProps.onDialogOpenChange).toHaveBeenCalledWith(false);
    expect(defaultProps.onEditingStoryChange).toHaveBeenCalledWith(null);
  });

  it('should handle idea selection correctly', () => {
    const { result } = renderHook(() => useStoryManagement(defaultProps), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.actions.handleIdeaSelect(mockStoryTypes[0] as any);
    });

    expect(result.current.state.isIdeaBankOpen).toBe(false);
  });

  it('should handle state updates correctly', () => {
    const { result } = renderHook(() => useStoryManagement(defaultProps), {
      wrapper: createWrapper(),
    });

    // The hook doesn't expose setState directly, so we can only test the initial state
    expect(result.current.state.isIdeaBankOpen).toBe(false);
    expect(result.current.state.isCreating).toBe(false);
    expect(result.current.state.isCompleteEditModalOpen).toBe(false);
    expect(result.current.state.selectedStoryType).toBeNull();
  });

  it('should handle story reordering correctly', async () => {
    const { result } = renderHook(() => useStoryManagement(defaultProps), {
      wrapper: createWrapper(),
    });

    // Mock successful API response
    mockFetch.mockResolvedValueOnce(createMockResponse({ success: true }));

    await act(async () => {
      result.current.actions.handleReorderStories(0, 1);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/stories/story-1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.stringContaining('"order":2'),
    });
  });
});