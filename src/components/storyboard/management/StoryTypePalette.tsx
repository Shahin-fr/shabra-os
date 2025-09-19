'use client';

import { StoryTypePaletteProps } from '@/types/story-management';

import { StoryTypePalette as BaseStoryTypePalette } from '../StoryTypePalette';

export function StoryTypePalette({
  storyTypes,
  selectedSlotIndex,
  onTypeSelect,
  isLoading,
}: StoryTypePaletteProps) {
  return (
    <BaseStoryTypePalette
      storyTypes={storyTypes}
      selectedSlotIndex={selectedSlotIndex}
      onTypeSelect={onTypeSelect}
      isLoading={isLoading}
    />
  );
}

