import { useCallback } from 'react';

import { Story } from '@/types/story';

export function useSlotManagement(
  slotCount: number,
  setSlotCount: React.Dispatch<React.SetStateAction<number>>,
  selectedSlotIndex: number | null,
  setSelectedSlotIndex: (index: number | null) => void,
  stories: Story[],
  deleteStoryMutation: any
) {
  // Handle add slot
  const handleAddSlot = useCallback(() => {
    setSlotCount(prev => prev + 1);
  }, [setSlotCount]);

  // Handle remove slot with orphaned story deletion
  const handleRemoveSlot = useCallback(async () => {
    if (slotCount <= 1) return;

    const newSlotCount = slotCount - 1;

    // Find stories that will be orphaned (order > newSlotCount)
    const orphanedStories = stories.filter(story => story.order > newSlotCount);

    // Delete orphaned stories from database using mutation
    if (orphanedStories.length > 0) {
      try {
        await Promise.all(
          orphanedStories.map(story =>
            deleteStoryMutation.mutateAsync(story.id)
          )
        );
      } catch {
        // Silent error handling
      }
    }

    setSlotCount(newSlotCount);

    // Clear selection if the selected slot is being removed
    if (selectedSlotIndex !== null && selectedSlotIndex >= newSlotCount) {
      setSelectedSlotIndex(null);
    }
  }, [
    slotCount,
    setSlotCount,
    selectedSlotIndex,
    setSelectedSlotIndex,
    stories,
    deleteStoryMutation,
  ]);

  return {
    handleAddSlot,
    handleRemoveSlot,
  };
}
