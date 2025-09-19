'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { Palette } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { StoryCanvasProps } from '@/types/story-management';

import { StoryboardCanvas } from '../StoryboardCanvas';

export function StoryCanvas({
  stories,
  selectedSlotIndex,
  onSlotClick,
  onSlotDoubleClick,
  onReorderStories,
  onClearSlot,
  isLoading,
  slotCount,
  onAddSlot,
  onRemoveSlot,
  storiesError,
  storiesErrorDetails,
  storiesLoading,
}: StoryCanvasProps) {
  if (storiesError) {
    return (
      <OptimizedMotion
        className='text-center py-12 mb-6'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <Palette className='h-8 w-8 text-red-600' />
        </div>
        <h3 className='text-lg font-semibold text-foreground mb-2'>
          خطا در بارگذاری استوری‌ها
        </h3>
        <p className='text-muted-foreground mb-6'>
          مشکلی در بارگذاری استوری‌ها پیش آمده است
        </p>
        {storiesErrorDetails && (
          <details className='text-xs text-red-600 mb-4'>
            <summary>جزئیات خطا (برای توسعه‌دهنده)</summary>
            <pre className='mt-2 text-left direction-ltr'>
              {JSON.stringify(storiesErrorDetails, null, 2)}
            </pre>
          </details>
        )}
        <Button
          onClick={() => window.location.reload()}
          className='bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white'
        >
          تلاش مجدد
        </Button>
      </OptimizedMotion>
    );
  }

  return (
    <StoryboardCanvas
      stories={stories}
      selectedSlotIndex={selectedSlotIndex}
      onSlotClick={onSlotClick}
      onSlotDoubleClick={onSlotDoubleClick}
      onReorderStories={onReorderStories}
      onClearSlot={onClearSlot}
      isLoading={isLoading}
      slotCount={slotCount}
      onAddSlot={onAddSlot}
      onRemoveSlot={onRemoveSlot}
      storiesError={storiesError}
      storiesErrorDetails={storiesErrorDetails}
      storiesLoading={storiesLoading}
    />
  );
}

