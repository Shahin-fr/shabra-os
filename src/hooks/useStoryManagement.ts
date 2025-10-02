import { useMutation } from '@tanstack/react-query';
import { format } from 'date-fns-jalali';
import { useState } from 'react';

import { useStoryIdeas } from '@/hooks/useStoryIdeas';
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler';
import { Story } from '@/types/story';
import {
  StoryData,
  StoryManagementActions,
  StoryManagementState,
  StoryType,
} from '@/types/story-management';

interface UseStoryManagementProps {
  selectedDate: Date;
  stories: Story[];
  _storyTypes: StoryType[];
  selectedSlotIndex: number | null;
  editingStory: Story | null;
  isEditing: boolean;
  onSelectedSlotIndexChange: (index: number | null) => void;
  onEditingStoryChange: (story: Story | null) => void;
  onIsEditingChange: (editing: boolean) => void;
  onDialogOpenChange: (open: boolean) => void;
  refetchStories: () => Promise<void>;
}

export function useStoryManagement({
  selectedDate,
  stories,
  selectedSlotIndex,
  editingStory,
  onSelectedSlotIndexChange,
  onEditingStoryChange,
  onIsEditingChange,
  onDialogOpenChange,
  refetchStories,
}: Omit<UseStoryManagementProps, '_storyTypes' | 'isEditing'>) {
  // State
  const [state, setState] = useState<StoryManagementState>({
    isCreating: false,
    isIdeaBankOpen: false,
    isCompleteEditModalOpen: false,
    selectedStoryType: null,
  });

  // Error handling
  const { handleError, handleSuccess } = useApiErrorHandler();

  // Fetch story ideas
  const { data: storyIdeas = [], isLoading: storyIdeasLoading } = useStoryIdeas();

  // Create story mutation
  const createStoryMutation = useMutation({
    mutationFn: async (storyData: StoryData) => {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle different error response structures
        let errorMessage = 'Failed to create story';
        if (errorData.error?.message) {
          // Standardized API error response: { success: false, error: { message: string } }
          errorMessage = errorData.error.message;
        } else if (errorData.error) {
          // Auth middleware error response: { error: string, code: string }
          errorMessage = errorData.error;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: async () => {
      handleSuccess('استوری با موفقیت ایجاد شد!', 'useStoryManagement');
      await refetchStories();
      onSelectedSlotIndexChange(null);
    },
    onError: (error) => {
      handleError(error, 'useStoryManagement');
    },
  });

  // Update story mutation
  const updateStoryMutation = useMutation({
    mutationFn: async ({
      storyId,
      storyData,
    }: {
      storyId: string;
      storyData: Partial<StoryData>;
    }) => {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle different error response structures
        let errorMessage = 'Failed to update story';
        if (errorData.error?.message) {
          // Standardized API error response: { success: false, error: { message: string } }
          errorMessage = errorData.error.message;
        } else if (errorData.error) {
          // Auth middleware error response: { error: string, code: string }
          errorMessage = errorData.error;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: async () => {
      handleSuccess('استوری با موفقیت به‌روزرسانی شد!', 'useStoryManagement');
      await refetchStories();
      onSelectedSlotIndexChange(null);
    },
    onError: (error) => {
      handleError(error, 'useStoryManagement');
    },
  });

  // Delete story mutation
  const deleteStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle different error response structures
        let errorMessage = 'Failed to delete story';
        if (errorData.error?.message) {
          // Standardized API error response: { success: false, error: { message: string } }
          errorMessage = errorData.error.message;
        } else if (errorData.error) {
          // Auth middleware error response: { error: string, code: string }
          errorMessage = errorData.error;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    },
    onSuccess: async () => {
      handleSuccess('استوری با موفقیت حذف شد!', 'useStoryManagement');
      await refetchStories();
    },
    onError: (error) => {
      handleError(error, 'useStoryManagement');
    },
  });

  // Actions
  const actions: StoryManagementActions = {
    handleSlotClick: (index: number) => {
      const story = stories.find(s => s.order === index + 1);

      if (selectedSlotIndex === index) {
        if (story) {
          onEditingStoryChange(story);
          onIsEditingChange(true);
          setState(prev => ({ ...prev, isCompleteEditModalOpen: true }));
        }
      } else {
        onSelectedSlotIndexChange(index);
      }
    },

    handleSlotDoubleClick: (index: number) => {
      const story = stories.find(s => s.order === index + 1);
      if (story) {
        onEditingStoryChange(story);
        onIsEditingChange(true);
        setState(prev => ({ ...prev, isCompleteEditModalOpen: true }));
      }
    },

    handleStoryTypeSelect: async (storyType: StoryType) => {
      if (selectedSlotIndex === null) return;

      setState(prev => ({ ...prev, isCreating: true }));
      try {
        // Get the first available project ID
        let projectId = 'cmf5o9m110001u35cldria860'; // Default fallback
        
        try {
          const projectsResponse = await fetch('/api/projects');
          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            if (projectsData.data?.projects?.length > 0) {
              projectId = projectsData.data.projects[0].id;
            }
          }
        } catch (error) {
          console.warn('Failed to fetch projects, using default project ID:', error);
        }

        const storyData: StoryData = {
          title: storyType.name,
          day: format(selectedDate, 'yyyy-MM-dd'),
          order: selectedSlotIndex + 1,
          type: storyType.name,
          customTitle: storyType.name,
          projectId: projectId,
          storyTypeId: storyType.id,
        };

        await createStoryMutation.mutateAsync(storyData);
        onSelectedSlotIndexChange(null);
        setState(prev => ({ ...prev, selectedStoryType: null }));
      } finally {
        setState(prev => ({ ...prev, isCreating: false }));
      }
    },

    handleClearSlot: async (storyId: string) => {
      if (!storyId) return;
      try {
        await deleteStoryMutation.mutateAsync(storyId);
      } catch {
        // Error handled by mutation
      }
    },

    handleAddSlot: () => {
      // This will be handled by parent component
    },

    handleRemoveSlot: async () => {
      // This will be handled by parent component
    },

    handleReorderStories: async (fromIndex: number, toIndex: number) => {
      const fromStory = stories.find(s => s.order === fromIndex + 1);
      if (!fromStory) return;

      try {
        await updateStoryMutation.mutateAsync({
          storyId: fromStory.id,
          storyData: { order: toIndex + 1 },
        });
      } catch {
        // Error handled by mutation
      }
    },

    handleIdeaSelect: () => {
      setState(prev => ({ ...prev, isIdeaBankOpen: false }));
    },

    handleCompleteEditSubmit: async (storyData: { title: string; notes?: string; link?: string; customTitle?: string; ideaId?: string }) => {
      if (editingStory) {
        setState(prev => ({ ...prev, isCreating: true }));
        try {
          await updateStoryMutation.mutateAsync({
            storyId: editingStory.id,
            storyData: {
              title: storyData.title,
              notes: storyData.notes,
              link: storyData.link,
              customTitle: storyData.customTitle,
              storyTypeId: storyData.ideaId,
            },
          });
          setState(prev => ({ ...prev, isCompleteEditModalOpen: false }));
          onEditingStoryChange(null);
          onIsEditingChange(false);
        } finally {
          setState(prev => ({ ...prev, isCreating: false }));
        }
      } else {
        if (selectedSlotIndex === null) return;

        setState(prev => ({ ...prev, isCreating: true }));
        try {
          const newStoryData: StoryData = {
            ...storyData,
            day: format(selectedDate, 'yyyy-MM-dd'),
            order: selectedSlotIndex + 1,
            projectId: 'cmf5o9m110001u35cldria860',
            storyTypeId: 'cmf5qm8790002u38cwtdzuw1p',
          };

          await createStoryMutation.mutateAsync(newStoryData);
          setState(prev => ({ ...prev, isCompleteEditModalOpen: false }));
          onSelectedSlotIndexChange(null);
        } finally {
          setState(prev => ({ ...prev, isCreating: false }));
        }
      }
    },

    handleDeleteStory: async (storyId: string) => {
      try {
        await deleteStoryMutation.mutateAsync(storyId);
        setState(prev => ({ ...prev, isCompleteEditModalOpen: false }));
        onEditingStoryChange(null);
        onIsEditingChange(false);
      } catch {
        // Error handled by mutation
      }
    },

    handleDialogClose: (open: boolean) => {
      onDialogOpenChange(open);
      if (!open) {
        onEditingStoryChange(null);
        onIsEditingChange(false);
      }
    },
  };

  return {
    state,
    setState,
    storyIdeas,
    storyIdeasLoading,
    mutations: {
      createStory: createStoryMutation,
      updateStory: updateStoryMutation,
      deleteStory: deleteStoryMutation,
    },
    actions,
  };
}
