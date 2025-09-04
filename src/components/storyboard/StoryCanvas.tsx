'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

import { StorySlot } from './StorySlot';

interface Story {
  id: string;
  title: string;
  notes?: string;
  visualNotes?: string;
  link?: string;
  day: string;
  order: number;
  status: 'DRAFT' | 'READY' | 'PUBLISHED';
  storyType?: {
    id: string;
    name: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

interface StoryCanvasProps {
  stories: Story[];
  selectedSlotIndex: number | null;
  onSlotClick: (_index: number) => void;
  onSlotDoubleClick?: (_index: number) => void;
  onReorderStories: (_fromIndex: number, _toIndex: number) => void;
  onClearSlot?: (_storyId: string) => void;
  isLoading?: boolean;
  slotCount: number;
}

export function StoryCanvas({
  stories,
  selectedSlotIndex,
  onSlotClick,
  onSlotDoubleClick,
  onReorderStories,
  onClearSlot,
  isLoading = false,
  slotCount,
}: StoryCanvasProps) {
  // Fix hydration error by ensuring dnd-kit only renders on client
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Create dynamic slots, mapping stories to their order positions
  const slots = Array.from({ length: slotCount }, (_, index) => {
    const story = stories.find(s => s.order === index + 1);
    return story || null;
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = parseInt(active.id as string);
      const newIndex = parseInt(over?.id as string);
      onReorderStories(oldIndex, newIndex);
    }
  };

  // Show loading state during hydration
  if (!isMounted) {
    return (
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6'>
        {slots.map((story, index) => (
          <div key={`slot-${index}`}>
            <StorySlot
              story={story || undefined}
              index={index}
              isSelected={selectedSlotIndex === index}
              onClick={() => onSlotClick(index)}
              onDoubleClick={() => onSlotDoubleClick?.(index)}
              onClearSlot={onClearSlot}
              isLoading={isLoading && selectedSlotIndex === index}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={slots.map((_, index) => index.toString())}
          strategy={rectSortingStrategy}
        >
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6'>
            {slots.map((story, index) => (
              <motion.div
                key={`slot-${index}`}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.9 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <StorySlot
                  story={story || undefined}
                  index={index}
                  isSelected={selectedSlotIndex === index}
                  onClick={() => onSlotClick(index)}
                  onDoubleClick={() => onSlotDoubleClick?.(index)}
                  onClearSlot={onClearSlot}
                  isLoading={isLoading && selectedSlotIndex === index}
                />
              </motion.div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
