'use client';

import { IdeaBankProps } from '@/types/story-management';

import { IdeaBank as BaseIdeaBank } from '../IdeaBank';

export function IdeaBank({
  isOpen,
  onOpenChange,
  onSelectIdea,
  storyIdeas,
  isLoading,
  selectedStoryType,
}: IdeaBankProps) {
  return (
    <BaseIdeaBank
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onSelectIdea={onSelectIdea}
      storyIdeas={storyIdeas}
      isLoading={isLoading}
      selectedStoryType={selectedStoryType}
    />
  );
}

