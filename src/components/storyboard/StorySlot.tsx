'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { Plus, FileText, Image, Trash2 } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DynamicLucideIcon } from '@/components/ui/DynamicLucideIcon';
import { cn } from '@/lib/utils';

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
    icon?: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

interface StorySlotProps {
  story?: Story;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
  onClearSlot?: (_storyId: string) => void;
  isLoading?: boolean;
  isMobile?: boolean;
}

const statusConfig = {
  DRAFT: {
    label: 'پیش‌نویس',
    color: 'bg-muted text-muted-foreground border border-border',
  },
  READY: {
    label: 'آماده',
    color:
      'bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800',
  },
  PUBLISHED: {
    label: 'منتشر شده',
    color:
      'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-yellow-800',
  },
};

export function StorySlot({
  story,
  index,
  isSelected,
  onClick,
  onDoubleClick,
  onClearSlot,
  isLoading = false,
}: StorySlotProps) {
  const status = story ? statusConfig[story.status] : null;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: index.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClearSlot = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (story && onClearSlot) {
      onClearSlot(story.id);
    }
  };

  return (
    <OptimizedMotion
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Card
        ref={setNodeRef}
        {...attributes}
        className={cn(
          'relative cursor-pointer transition-all duration-300',
          'aspect-[9/16] min-h-[300px] max-h-[450px]',
          'border-2 border-dashed border-gray-400 hover:border-[#ff0a54]/70',
          'bg-gray-50 hover:bg-gray-100',
          'shadow-lg hover:shadow-xl',
          isSelected &&
            'border-[#ff0a54] border-solid shadow-xl ring-2 ring-[#ff0a54]/30 bg-white',
          isLoading && isSelected && 'animate-pulse',
          isDragging && 'opacity-50 scale-105 z-50'
        )}
        style={{
          ...style,
          background: isSelected
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(248, 250, 252, 0.9)',
          border: isSelected
            ? '2px solid rgba(255, 10, 84, 0.8)'
            : '2px dashed rgba(156, 163, 175, 0.7)',
          boxShadow: isSelected
            ? `
              0 12px 40px rgba(0, 0, 0, 0.15),
              0 6px 20px rgba(255, 10, 84, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.8)
            `
            : `
              0 8px 25px rgba(0, 0, 0, 0.1),
              0 4px 15px rgba(0, 0, 0, 0.05),
              inset 0 1px 0 rgba(255, 255, 255, 0.6)
            `,
        }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
      >
        <CardContent className='p-6 h-full flex flex-col'>
          {story ? (
            // Story content - Refined layout
            <div className='flex flex-col h-full'>
              {/* Top row - Status badge in corner and Order number */}
              <div className='flex items-start justify-between mb-3'>
                {status && (
                  <OptimizedMotion
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Badge
                      className={cn(
                        'text-xs font-medium px-2 py-1',
                        status.color
                      )}
                    >
                      {status.label}
                    </Badge>
                  </OptimizedMotion>
                )}
                <div className='flex items-center gap-2'>
                  {/* Clear slot button */}
                  <OptimizedMotion
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleClearSlot}
                      className='h-6 w-6 p-0 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 border border-red-200'
                      title='حذف استوری'
                    >
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  </OptimizedMotion>
                  <OptimizedMotion
                    {...listeners}
                    className='w-8 h-8 bg-[#ff0a54]/30 rounded-full flex items-center justify-center text-sm font-medium text-[#ff0a54] cursor-grab active:cursor-grabbing'
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {index + 1}
                  </OptimizedMotion>
                </div>
              </div>

              {/* Main content - Large centered icon */}
              <div className='flex-1 flex flex-col items-center justify-center text-center'>
                <OptimizedMotion
                  className={cn(
                    'w-20 h-20 rounded-full flex items-center justify-center mb-6',
                    'bg-gradient-to-br from-[#ff0a54]/40 to-[#ff0a54]/60',
                    'border-2 border-[#ff0a54]/50'
                  )}
                  style={{
                    boxShadow: `
                      0 8px 25px rgba(255, 10, 84, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.6)
                    `,
                  }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <DynamicLucideIcon
                    iconName={story.storyType?.icon}
                    className='h-10 w-10 text-white'
                    fallbackIcon={FileText}
                  />
                </OptimizedMotion>

                {/* Story type name - Most prominent text */}
                <h3 className='text-lg font-bold text-gray-900 mb-3 leading-tight line-clamp-2'>
                  {story.storyType?.name || story.title}
                </h3>

                {/* Story title (if different from type name) - Smaller and muted */}
                {story.storyType && story.title !== story.storyType.name && (
                  <p className='text-sm text-gray-700 leading-tight line-clamp-2'>
                    {story.title}
                  </p>
                )}
              </div>

              {/* Bottom indicators - Smaller and less prominent */}
              <div className='flex items-center justify-between mt-3 pt-2 border-t border-gray-200/50'>
                {story.visualNotes && (
                  <div className='flex items-center gap-1 text-xs text-gray-600'>
                    <Image className='h-3 w-3 text-[#ff0a54]' />
                    <span>تصویر</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Empty slot - Refined layout
            <div className='flex flex-col items-center justify-center h-full text-gray-600'>
              {/* Order number */}
              <div className='absolute top-3 right-3'>
                <OptimizedMotion
                  {...listeners}
                  className='w-8 h-8 bg-[#ff0a54]/30 rounded-full flex items-center justify-center text-sm font-medium text-[#ff0a54] cursor-grab active:cursor-grabbing'
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {index + 1}
                </OptimizedMotion>
              </div>

              {/* Main content */}
              <div className='flex flex-col items-center'>
                <OptimizedMotion
                  className={cn(
                    'w-20 h-20 rounded-full flex items-center justify-center mb-6',
                    'bg-gradient-to-br from-[#ff0a54]/30 to-[#ff0a54]/40',
                    'border-2 border-dashed border-[#ff0a54]/50'
                  )}
                  style={{
                    boxShadow: `
                      0 6px 20px rgba(255, 10, 84, 0.2),
                      inset 0 1px 0 rgba(255, 255, 255, 0.4)
                    `,
                  }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <Plus className='h-10 w-10 text-[#ff0a54]' />
                </OptimizedMotion>
                <p className='text-base text-center font-medium text-gray-800 mb-2'>
                  اسلات خالی
                </p>
                <p className='text-sm text-center text-gray-600'>
                  کلیک برای انتخاب
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </OptimizedMotion>
  );
}

