import { format } from 'date-fns-jalali';

import { showStatusMessage } from '@/lib/utils';

export interface StoryData {
  title: string;
  notes?: string;
  visualNotes?: string;
  link?: string;
  storyTypeId?: string;
}

export function useStoryboardOperationsNew(
  selectedDate: Date,
  selectedSlotIndex: number | null,
  stories: any[],
  storyTypes: any[],
  createStoryMutation: any,
  updateStoryMutation: any,
  deleteStoryMutation: any,
  _refetchStories: () => Promise<any>
) {
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  // Get or create default project and story type
  const getDefaultProjectAndStoryType = async () => {
    let defaultProjectId: string | null = null;
    let defaultStoryTypeId: string | null = null;

    // Try to get existing project
    try {
      const projectsResponse = await fetch('/api/projects');
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        if (projectsData.data?.projects?.length > 0) {
          defaultProjectId = projectsData.data.projects[0].id;
        }
      }
    } catch (error) {
      // Error handling is done in the mutation's onError callback
    }

    // Create default project if none exists
    if (!defaultProjectId) {
      try {
        const createProjectResponse = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Storyboard Project',
            description: 'Default project for storyboard stories',
            status: 'ACTIVE',
          }),
        });

        if (createProjectResponse.ok) {
          const projectData = await createProjectResponse.json();
          defaultProjectId = projectData.data.id;
        }
      } catch (error) {
        // Error handling is done in the mutation's onError callback
      }
    }

    // Try to get existing story type
    if (storyTypes.length > 0) {
      defaultStoryTypeId = storyTypes[0].id;
    } else {
      // Create default story type
      try {
        const storyTypeResponse = await fetch('/api/story-types', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'استوری عمومی',
            description: 'نوع پیش‌فرض برای استوری‌ها',
            icon: '📝',
          }),
        });

        if (storyTypeResponse.ok) {
          const storyTypeData = await storyTypeResponse.json();
          defaultStoryTypeId = storyTypeData.id;
        }
      } catch (error) {
        // Error handling is done in the mutation's onError callback
      }
    }

    return { defaultProjectId, defaultStoryTypeId };
  };

  // Create story with defaults
  const createStoryWithDefaults = async (storyData: StoryData) => {
    const { defaultProjectId, defaultStoryTypeId } =
      await getDefaultProjectAndStoryType();

    const fullStoryData = {
      ...storyData,
      day: dateString,
      order: (selectedSlotIndex || 0) + 1,
      projectId: defaultProjectId,
      storyTypeId: storyData.storyTypeId || defaultStoryTypeId,
    };

    return createStoryMutation.mutateAsync(fullStoryData);
  };

  // Update story
  const updateStory = async (storyId: string, storyData: StoryData) => {
    return updateStoryMutation.mutateAsync({
      storyId,
      storyData,
    });
  };

  // Delete story
  const deleteStory = async (storyId: string) => {
    return deleteStoryMutation.mutateAsync(storyId);
  };

  // Apply template to slot
  const applyTemplate = async (storyTypeId: string) => {
    if (selectedSlotIndex === null) {
      showStatusMessage('لطفاً ابتدا یک اسلات انتخاب کنید', 3000);
      return;
    }

    const story = stories.find((s: any) => s.order === selectedSlotIndex + 1);
    const storyType = storyTypes.find((t: any) => t.id === storyTypeId);

    if (!storyType) {
      showStatusMessage('نوع استوری یافت نشد', 3000);
      return;
    }

    try {
      if (story) {
        // Update existing story
        await updateStory(story.id, { title: story.title, storyTypeId });
      } else {
        // Create new story
        await createStoryWithDefaults({
          title: `${storyType.name} Story`,
          storyTypeId,
        });
      }

      // Note: No need to call refetchStories() here as the mutation's onSuccess callback
      // already handles the refetch. Calling it here would create a race condition.
    } catch (error) {
      // Error handling is done in the mutation's onError callback
      throw error;
    }
  };

  return {
    createStoryWithDefaults,
    updateStory,
    deleteStory,
    applyTemplate,
  };
}
