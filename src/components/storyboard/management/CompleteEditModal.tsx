'use client';

import { CompleteEditModalProps } from '@/types/story-management';

import { CompleteEditStoryModal } from '../CompleteEditStoryModal';

export function CompleteEditModal({
  isOpen,
  onOpenChange,
  onSubmit,
  onDelete,
  onSelectIdea,
  story,
  storyIdeas,
  isLoading,
}: CompleteEditModalProps) {
  return (
    <CompleteEditStoryModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      onDelete={onDelete}
      onSelectIdea={onSelectIdea}
      story={story}
      storyIdeas={storyIdeas}
      isLoading={isLoading}
    />
  );
}

