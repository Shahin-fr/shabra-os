'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useCallback } from 'react';

import { logger } from '@/lib/logger';
import { storiesKeys } from '@/lib/queries';
import { showStatusMessage } from '@/lib/utils';
import { Story } from '@/types/story';

import { SortableStoryCard } from './SortableStoryCard';
import { StoryCard } from './StoryCard';

interface DraggableStoryListProps {
  stories: Story[];
  onStoriesReorder: (stories: Story[]) => void;
  onStorySelect?: (story: Story) => void;
  onStoryEdit?: (story: Story) => void;
  onStoryDelete?: (storyId: string) => void;
  className?: string;
}

export function DraggableStoryList({
  stories,
  onStoriesReorder,
  onStorySelect,
  onStoryEdit,
  onStoryDelete,
  className = '',
}: DraggableStoryListProps) {
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [localStories, setLocalStories] = useState<Story[]>(stories);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update local stories when prop changes
  React.useEffect(() => {
    setLocalStories(stories);
  }, [stories]);

  const updateStoryOrderMutation = useMutation({
    mutationFn: async (reorderedStories: Story[]) => {
      // API call to update story order
      const response = await fetch('/api/stories/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stories: reorderedStories.map((story, index) => ({
            id: story.id,
            order: index,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update story order');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storiesKeys.all });
      showStatusMessage('ترتیب داستان‌ها با موفقیت به‌روزرسانی شد', 3000);
    },
    onError: error => {
      logger.error('Failed to update story order:', error);
      showStatusMessage('خطا در به‌روزرسانی ترتیب داستان‌ها', 4000);
      // Revert to original order
      setLocalStories(stories);
    },
  });

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const draggedStory = localStories.find(story => story.id === active.id);
      setActiveStory(draggedStory || null);
    },
    [localStories]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        const oldIndex = localStories.findIndex(
          story => story.id === active.id
        );
        const newIndex = localStories.findIndex(story => story.id === over?.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newStories = arrayMove(localStories, oldIndex, newIndex);
          setLocalStories(newStories);

          // Call the mutation to persist the change
          await updateStoryOrderMutation.mutateAsync(newStories);

          // Notify parent component
          onStoriesReorder(newStories);
        }
      }

      setActiveStory(null);
    },
    [localStories, updateStoryOrderMutation, onStoriesReorder]
  );

  const handleDragCancel = useCallback(() => {
    setActiveStory(null);
  }, []);

  const handleStorySelect = useCallback(
    (story: Story) => {
      onStorySelect?.(story);
    },
    [onStorySelect]
  );

  const handleStoryEdit = useCallback(
    (story: Story) => {
      onStoryEdit?.(story);
    },
    [onStoryEdit]
  );

  const handleStoryDelete = useCallback(
    (storyId: string) => {
      onStoryDelete?.(storyId);
    },
    [onStoryDelete]
  );

  return (
    <div className={`space-y-2 ${className}`}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={localStories.map(story => story.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence>
            {localStories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                layout
              >
                <SortableStoryCard
                  story={story}
                  onSelect={handleStorySelect}
                  onEdit={handleStoryEdit}
                  onDelete={handleStoryDelete}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </SortableContext>

        <DragOverlay>
          {activeStory ? (
            <StoryCard
              story={activeStory}
              isDragging={true}
              onSelect={handleStorySelect}
              onEdit={handleStoryEdit}
              onDelete={handleStoryDelete}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {updateStoryOrderMutation.isPending && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='flex items-center justify-center py-2 text-sm text-muted-foreground'
        >
          در حال به‌روزرسانی ترتیب...
        </motion.div>
      )}
    </div>
  );
}
