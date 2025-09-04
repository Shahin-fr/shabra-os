import { useState, useCallback } from 'react';

import { logUI } from '@/lib/logger';
import { Story } from '@/types/story';

export interface StoryboardState {
  selectedDate: Date;
  isDialogOpen: boolean;
  isCreating: boolean;
  selectedSlotIndex: number | null;
  editingStory: Story | null;
  isEditing: boolean;
  slotCount: number;
}

export interface StoryboardActions {
  setSelectedDate: (date: Date) => void;
  setIsDialogOpen: (open: boolean) => void;
  setIsCreating: (creating: boolean) => void;
  setSelectedSlotIndex: (index: number | null) => void;
  setEditingStory: (story: Story | null) => void;
  setIsEditing: (editing: boolean) => void;
  setSlotCount: (count: number) => void;
  resetState: () => void;
  handleSlotClick: (index: number, stories: Story[]) => void;
  handleDialogClose: () => void;
  selectTemplate: (storyTypeId: string) => void;
}

export function useStoryboardState(): [StoryboardState, StoryboardActions] {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(
    null
  );
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [slotCount, setSlotCount] = useState(8);

  const resetState = useCallback(() => {
    setIsDialogOpen(false);
    setEditingStory(null);
    setIsEditing(false);
    setSelectedSlotIndex(null);
  }, []);

  const handleSlotClick = useCallback(
    (index: number, stories: Story[]) => {
      const story = stories.find(s => s.order === index + 1);

      if (selectedSlotIndex === index) {
        // Second click on already selected slot - open edit dialog
        if (story) {
          // Edit existing story
          setEditingStory(story);
          setIsEditing(true);
          setIsDialogOpen(true);
        } else {
          // Create new story in this slot
          setSelectedSlotIndex(index);
          setIsDialogOpen(true);
        }
      } else {
        // First click - select the slot
        setSelectedSlotIndex(index);
      }
    },
    [selectedSlotIndex]
  );

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setEditingStory(null);
    setIsEditing(false);
  }, []);

  const selectTemplate = useCallback((storyTypeId: string) => {
    setSelectedSlotIndex(null); // Clear selected slot when a template is selected
    setIsDialogOpen(true); // Open dialog for template selection
    logUI('Storyboard template selected', { storyTypeId });
  }, []);

  const state: StoryboardState = {
    selectedDate,
    isDialogOpen,
    isCreating,
    selectedSlotIndex,
    editingStory,
    isEditing,
    slotCount,
  };

  const actions: StoryboardActions = {
    setSelectedDate,
    setIsDialogOpen,
    setIsCreating,
    setSelectedSlotIndex,
    setEditingStory,
    setIsEditing,
    setSlotCount,
    resetState,
    handleSlotClick,
    handleDialogClose,
    selectTemplate,
  };

  return [state, actions];
}
