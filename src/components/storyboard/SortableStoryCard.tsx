'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';

import { Story } from '@/types/story';

import { StoryCard } from './StoryCard';

interface SortableStoryCardProps {
  story: Story;
  onSelect?: (story: Story) => void;
  onEdit?: (story: Story) => void;
  onDelete?: (storyId: string) => void;
}

export function SortableStoryCard({
  story,
  onSelect,
  onEdit,
  onDelete,
}: SortableStoryCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: story.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className={isDragging ? 'z-50' : ''}>
        <StoryCard
          story={story}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          isDragging={isDragging}
        />
      </div>
    </div>
  );
}
