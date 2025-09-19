import { format } from 'date-fns';
import { useCallback } from 'react';

import { Story } from '@/types/story';

export interface StoryData {
  title: string;
  notes?: string;
  visualNotes?: string;
  link?: string;
  storyTypeId?: string;
}

export function useStoryboardOperations(
  selectedDate: Date,
  selectedSlotIndex: number | null,
  stories: Story[],
  storyTypes: any[],
  createStoryMutation: any,
  updateStoryMutation: any,
  setIsCreating: (creating: boolean) => void,
  setEditingStory: (story: Story | null) => void,
  setIsEditing: (editing: boolean) => void,
  setIsDialogOpen: (open: boolean) => void,
  _setSelectedSlotIndex: (index: number | null) => void
) {
  // Handle template application
  const handleTemplateClick = useCallback(
    async (storyTypeId: string) => {
      if (selectedSlotIndex === null) return;

      const story = stories.find(s => s.order === selectedSlotIndex + 1);
      const storyType = storyTypes.find(t => t.id === storyTypeId);

      if (!storyType) return;

      setIsCreating(true);

      try {
        if (story) {
          // Update existing story using mutation
          await updateStoryMutation.mutateAsync({
            storyId: story.id,
            storyData: { storyTypeId },
          });
        } else {
          // Create new story for this slot using mutation
          const dateString = format(selectedDate, 'yyyy-MM-dd');
          const newStory = await createStoryMutation.mutateAsync({
            title: `${storyType.name} Story`,
            day: dateString,
            storyTypeId,
            order: selectedSlotIndex + 1,
          });

          setEditingStory(newStory);
          setIsEditing(true);
          setIsDialogOpen(true);
        }

        // Keep the slot selected to show the template was applied successfully
        // Don't clear selectedSlotIndex here
      } catch {
        // Silent error handling
      } finally {
        setIsCreating(false);
      }
    },
    [
      selectedSlotIndex,
      stories,
      storyTypes,
      selectedDate,
      createStoryMutation,
      updateStoryMutation,
      setIsCreating,
      setEditingStory,
      setIsEditing,
      setIsDialogOpen,
    ]
  );

  // Create new story in a specific slot
  const handleCreateNewStory = useCallback(
    async (slotIndex: number) => {
      setIsCreating(true);
      try {
        const dateString = format(selectedDate, 'yyyy-MM-dd');

        // Use mutation to create story
        const newStory = await createStoryMutation.mutateAsync({
          title: 'استوری جدید',
          day: dateString,
          order: slotIndex + 1,
        });

        setEditingStory(newStory);
        setIsEditing(true);
        setIsDialogOpen(true);
      } catch {
        // Silent error handling
      } finally {
        setIsCreating(false);
      }
    },
    [
      selectedDate,
      createStoryMutation,
      setIsCreating,
      setEditingStory,
      setIsEditing,
      setIsDialogOpen,
    ]
  );

  // Handle story creation from dialog
  const handleCreateStory = useCallback(
    async (storyData: StoryData) => {
      if (selectedSlotIndex === null) return;

      setIsCreating(true);
      try {
        const dateString = format(selectedDate, 'yyyy-MM-dd');

        const newStory = await createStoryMutation.mutateAsync({
          ...storyData,
          day: dateString,
          order: selectedSlotIndex + 1,
        });

        setEditingStory(newStory);
        setIsEditing(true);
      } catch {
        // Silent error handling
      } finally {
        setIsCreating(false);
      }
    },
    [
      selectedSlotIndex,
      selectedDate,
      createStoryMutation,
      setIsCreating,
      setEditingStory,
      setIsEditing,
    ]
  );

  // Handle story update from dialog
  const handleUpdateStory = useCallback(
    async (storyData: StoryData) => {
      const story = stories.find(s => s.order === (selectedSlotIndex || 0) + 1);
      if (!story) return;

      setIsCreating(true);
      try {
        await updateStoryMutation.mutateAsync({
          storyId: story.id,
          storyData,
        });

        setIsEditing(false);
        setIsDialogOpen(false);
      } catch {
        // Silent error handling
      } finally {
        setIsCreating(false);
      }
    },
    [
      stories,
      selectedSlotIndex,
      updateStoryMutation,
      setIsCreating,
      setIsEditing,
      setIsDialogOpen,
    ]
  );

  // Handle dialog submit
  const handleDialogSubmit = useCallback(
    (storyData: StoryData) => {
      const story = stories.find(s => s.order === (selectedSlotIndex || 0) + 1);

      if (story) {
        handleUpdateStory(storyData);
      } else {
        handleCreateStory(storyData);
      }
    },
    [stories, selectedSlotIndex, handleUpdateStory, handleCreateStory]
  );

  return {
    handleTemplateClick,
    handleCreateNewStory,
    handleCreateStory,
    handleUpdateStory,
    handleDialogSubmit,
  };
}
