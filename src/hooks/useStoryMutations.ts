import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

// import { logger } from '@/lib/logger';
import { storiesKeys } from '@/lib/queries';
import { showStatusMessage } from '@/lib/utils';
import { Story } from '@/types/story';

export interface StoryData {
  title: string;
  notes?: string;
  visualNotes?: string;
  link?: string;
  customTitle?: string;
  storyTypeId?: string;
  storyIdeaId?: string;
}

export interface CreateStoryData extends StoryData {
  day: string;
  order: number;
}

export interface UpdateStoryData {
  storyId: string;
  storyData: StoryData;
}

export interface UpdateOrderData {
  storyId: string;
  order: number;
}

export function useStoryMutations(selectedDate: Date) {
  const queryClient = useQueryClient();
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  // Mutation for creating stories
  const createStoryMutation = useMutation({
    mutationFn: async (storyData: CreateStoryData) => {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      });
      if (!response.ok) {
        throw new Error('Failed to create story');
      }
      return response.json();
    },
    onMutate: async storyData => {
      showStatusMessage('در حال ایجاد استوری...', 2000);

      await queryClient.cancelQueries({
        queryKey: storiesKeys.byDay(dateString),
      });

      const previousStories = queryClient.getQueryData(
        storiesKeys.byDay(dateString)
      );

      queryClient.setQueryData(
        storiesKeys.byDay(dateString),
        (old: Story[] | undefined) => {
          if (!old) return old;
          return [...old, { ...storyData, id: `temp-${Date.now()}` } as Story];
        }
      );

      return { previousStories };
    },
    onSuccess: () => {
      showStatusMessage('استوری با موفقیت ایجاد شد!', 3000);
      queryClient.invalidateQueries({
        queryKey: storiesKeys.byDay(dateString),
      });
    },
    onError: (_err, _variables, context) => {
      showStatusMessage(
        'ایجاد استوری با خطا مواجه شد. لطفاً دوباره تلاش کنید.',
        4000
      );

      if (context?.previousStories) {
        queryClient.setQueryData(
          storiesKeys.byDay(dateString),
          context.previousStories
        );
      }
    },
  });

  // Mutation for updating stories
  const updateStoryMutation = useMutation({
    mutationFn: async ({ storyId, storyData }: UpdateStoryData) => {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      });
      if (!response.ok) {
        throw new Error('Failed to update story');
      }
      return response.json();
    },
    onMutate: async ({ storyId, storyData }) => {
      showStatusMessage('در حال بروزرسانی استوری...', 2000);

      await queryClient.cancelQueries({
        queryKey: storiesKeys.byDay(dateString),
      });

      const previousStories = queryClient.getQueryData(
        storiesKeys.byDay(dateString)
      );

      queryClient.setQueryData(
        storiesKeys.byDay(dateString),
        (old: Story[] | undefined) => {
          if (!old) return old;
          return old.map(story =>
            story.id === storyId ? { ...story, ...storyData } : story
          );
        }
      );

      return { previousStories };
    },
    onSuccess: () => {
      showStatusMessage('استوری با موفقیت بروزرسانی شد!', 3000);
      queryClient.invalidateQueries({
        queryKey: storiesKeys.byDay(dateString),
      });
    },
    onError: (_err, _variables, context) => {
      showStatusMessage(
        'بروزرسانی استوری با خطا مواجه شد. لطفاً دوباره تلاش کنید.',
        4000
      );

      if (context?.previousStories) {
        queryClient.setQueryData(
          storiesKeys.byDay(dateString),
          context.previousStories
        );
      }
    },
  });

  // Mutation for deleting stories
  const deleteStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete story');
      }
      return response.json();
    },
    onMutate: async storyId => {
      showStatusMessage('در حال حذف استوری...', 2000);

      await queryClient.cancelQueries({
        queryKey: storiesKeys.byDay(dateString),
      });

      const previousStories = queryClient.getQueryData(
        storiesKeys.byDay(dateString)
      );

      queryClient.setQueryData(
        storiesKeys.byDay(dateString),
        (old: Story[] | undefined) => {
          if (!old) return old;
          return old.filter(story => story.id !== storyId);
        }
      );

      return { previousStories };
    },
    onSuccess: () => {
      showStatusMessage('استوری با موفقیت حذف شد!', 3000);
      queryClient.invalidateQueries({
        queryKey: storiesKeys.byDay(dateString),
      });
    },
    onError: (_err, _storyId, context) => {
      showStatusMessage(
        'حذف استوری با خطا مواجه شد. لطفاً دوباره تلاش کنید.',
        4000
      );

      if (context?.previousStories) {
        queryClient.setQueryData(
          storiesKeys.byDay(dateString),
          context.previousStories
        );
      }
    },
  });

  // Mutation for updating story order (drag and drop)
  const updateStoryOrderMutation = useMutation({
    mutationFn: async ({ storyId, order }: UpdateOrderData) => {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order }),
      });
      if (!response.ok) {
        throw new Error('Failed to update story order');
      }
      return response.json();
    },
    onMutate: async ({ storyId, order }) => {
      showStatusMessage('در حال تغییر ترتیب...', 2000);

      await queryClient.cancelQueries({
        queryKey: storiesKeys.byDay(dateString),
      });

      const previousStories = queryClient.getQueryData(
        storiesKeys.byDay(dateString)
      );

      queryClient.setQueryData(
        storiesKeys.byDay(dateString),
        (old: Story[] | undefined) => {
          if (!old) return old;
          return old.map(story =>
            story.id === storyId ? { ...story, order } : story
          );
        }
      );

      return { previousStories };
    },
    onSuccess: () => {
      showStatusMessage('ترتیب استوری با موفقیت تغییر یافت!', 3000);
      queryClient.invalidateQueries({
        queryKey: storiesKeys.byDay(dateString),
      });
    },
    onError: (_err, _variables, context) => {
      showStatusMessage(
        'تغییر ترتیب استوری با خطا مواجه شد. لطفاً دوباره تلاش کنید.',
        4000
      );

      if (context?.previousStories) {
        queryClient.setQueryData(
          storiesKeys.byDay(dateString),
          context.previousStories
        );
      }
    },
  });

  return {
    createStoryMutation,
    updateStoryMutation,
    deleteStoryMutation,
    updateStoryOrderMutation,
  };
}
