"use client";

import { useState, useEffect } from "react";
import { StorySlot } from "./StorySlot";
import { Palette } from "lucide-react";
import { motion } from "framer-motion";
import { Story } from "@/types/story";
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

interface StoryCanvasProps {
  stories: Story[];
  selectedSlotIndex: number | null;
  onSlotClick: (_slotIndex: number) => void;
  onReorderStories: (_oldIndex: number, _newIndex: number) => void;
  onClearSlot?: (_id: string) => void;
  isLoading?: boolean;
  slotCount: number;
}

export function StoryCanvas({ 
  stories, 
  selectedSlotIndex, 
  onSlotClick, 
  onReorderStories,
  onClearSlot,
  isLoading = false,
  slotCount
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
      handleReorderStories(oldIndex, newIndex);
    }
  };

  const handleReorderStories = (oldIndex: number, newIndex: number) => {
    // Use the parameters to validate before calling the parent function
    if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
      onReorderStories(oldIndex, newIndex);
    }
  };

  const handleClearSlot = (id: string) => {
    // Use the id parameter to validate before calling the parent function
    if (id && onClearSlot) {
      onClearSlot(id);
    }
  };

  const handleSlotClick = (slotIndex: number) => {
    // Use the slotIndex parameter to validate before calling the parent function
    if (slotIndex >= 0) {
      onSlotClick(slotIndex);
    }
  };

  // Show loading state during hydration
  if (!isMounted) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {slots.map((story, _index) => (
          <div key={story?.id || `empty-${_index}`}>
            <StorySlot
              story={story || undefined}
              index={_index}
              isSelected={selectedSlotIndex === _index}
              onClick={() => handleSlotClick(_index)}
              onClearSlot={handleClearSlot}
              isLoading={isLoading && selectedSlotIndex === _index}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={slots.map((_, _index) => _index.toString())} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {slots.map((story, _index) => (
              <motion.div
                key={story?.id || `empty-${_index}`}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.9 },
                  visible: { opacity: 1, y: 0, scale: 1 }
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <StorySlot
                  story={story || undefined}
                  index={_index}
                  isSelected={selectedSlotIndex === _index}
                  onClick={() => handleSlotClick(_index)}
                  onClearSlot={handleClearSlot}
                  isLoading={isLoading && selectedSlotIndex === _index}
                />
              </motion.div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {stories.length === 0 && (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div 
            className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: `
                0 12px 35px rgba(255, 10, 84, 0.25),
                inset 0 1px 0 rgba(255, 255, 255, 0.4)
              `
            }}
          >
            <Palette className="h-8 w-8 text-[#ff0a54]" />
          </motion.div>
          <p className="text-gray-800 text-lg mb-2">هیچ استوری برای این تاریخ یافت نشد</p>
          <p className="text-sm text-gray-600">
            یک اسلات انتخاب کنید و قالب انتخاب کنید تا شروع کنید
          </p>
        </motion.div>
      )}
    </div>
  );
}
