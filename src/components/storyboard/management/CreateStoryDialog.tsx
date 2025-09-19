'use client';

import { Story } from '@/types/story';
import { StoryType } from '@/types/story-management';

import { CreateStoryDialog as BaseCreateStoryDialog } from '../CreateStoryDialog';

interface CreateStoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  storyTypes: StoryType[];
  isLoading: boolean;
  editingStory: Story | null;
  isEditing: boolean;
}

export function CreateStoryDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  storyTypes,
  isLoading,
  editingStory,
  isEditing,
}: CreateStoryDialogProps) {
  return (
    <BaseCreateStoryDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      storyTypes={storyTypes}
      isLoading={isLoading}
      editingStory={editingStory}
      isEditing={isEditing}
    />
  );
}

