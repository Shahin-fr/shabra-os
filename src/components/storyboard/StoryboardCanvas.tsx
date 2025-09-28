import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { CalendarIcon, Palette, Plus, Minus } from 'lucide-react';
import React, { memo } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Story } from '@/types/story';

import { StoryCanvas } from './StoryCanvas';

interface StoryboardCanvasProps {
  stories: Story[];
  selectedSlotIndex: number | null;
  onSlotClick: (index: number) => void;
  onSlotDoubleClick?: (index: number) => void;
  onReorderStories: (fromIndex: number, toIndex: number) => void;
  onClearSlot: (storyId: string) => void;
  isLoading: boolean;
  slotCount: number;
  onAddSlot: () => void;
  onRemoveSlot: () => void;
  storiesError: boolean;
  storiesErrorDetails: { message: string; code?: string; details?: Record<string, unknown> } | undefined;
  storiesLoading: boolean;
}

const StoryboardCanvas = memo<StoryboardCanvasProps>(
  ({
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
  }) => {
    return (
      <OptimizedMotion
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card
          className='storyboard-container'
          style={{
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.2),
              0 10px 30px rgba(255, 10, 84, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.4)
            `,
          }}
        >
          <CardContent className='p-8'>
            <div className='flex items-center justify-between mb-6'>
              <div>
                <h2 className='text-2xl font-bold text-foreground mb-2'>
                  استوری بورد
                </h2>
                <p className='text-muted-foreground'>
                  بوم بصری برای برنامه‌ریزی استوری‌ها
                </p>
              </div>

              {/* Slot Counter */}
              <div className='flex items-center bg-white border border-[#fdd6e8]/40 rounded-lg shadow-sm'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={onRemoveSlot}
                  disabled={slotCount <= 1}
                  className='h-10 w-10 p-0 rounded-e-none border-r border-[#fdd6e8]/30 hover:bg-[#fdd6e8]/10 disabled:opacity-50'
                >
                  <Minus className='h-4 w-4 text-[#ff0a54]' />
                </Button>
                <div className='px-4 py-2 text-sm font-medium text-foreground bg-[#fdd6e8]/5 min-w-[80px] text-center'>
                  {slotCount} اسلات
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={onAddSlot}
                  className='h-10 w-10 p-0 rounded-s-none border-l border-[#fdd6e8]/30 hover:bg-[#fdd6e8]/10'
                >
                  <Plus className='h-4 w-4 text-[#ff0a54]' />
                </Button>
              </div>
            </div>

            {storiesError ? (
              <OptimizedMotion
                className='text-center py-12'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <CalendarIcon className='h-8 w-8 text-red-600' />
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
                    <pre className='mt-2 text-start direction-ltr'>
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
            ) : (
              <OptimizedMotion
                className='relative'
                initial='hidden'
                animate='visible'
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.08,
                      delayChildren: 0.3,
                    },
                  },
                }}
              >
                {/* No stories found message */}
                {stories.length === 0 && (
                  <OptimizedMotion
                    className='text-center py-8 mb-6'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <OptimizedMotion
                      className='rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4'
                      style={{
                        background: 'rgba(255, 255, 255, 0.25)',
                        backdropFilter: 'blur(40px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: `
                          0 12px 35px rgba(255, 10, 84, 0.25),
                          inset 0 1px 0 rgba(255, 255, 255, 0.4)
                        `,
                      }}
                    >
                      <Palette className='h-8 w-8 text-[#ff0a54]' />
                    </OptimizedMotion>
                    <p className='text-gray-800 text-lg mb-2'>
                      هیچ استوری برای این تاریخ یافت نشد
                    </p>
                    <p className='text-sm text-gray-600'>
                      یک اسلات انتخاب کنید و قالب انتخاب کنید تا شروع کنید
                    </p>
                  </OptimizedMotion>
                )}

                <StoryCanvas
                  stories={stories}
                  selectedSlotIndex={selectedSlotIndex}
                  onSlotClick={onSlotClick}
                  onSlotDoubleClick={onSlotDoubleClick}
                  onReorderStories={onReorderStories}
                  onClearSlot={onClearSlot}
                  isLoading={isLoading}
                  slotCount={slotCount}
                />

                {/* Loading overlay for initial load */}
                {storiesLoading && (
                  <OptimizedMotion
                    className='absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-lg z-10'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className='text-center'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
                      <p className='mt-3 text-muted-foreground'>
                        در حال بارگذاری استوری‌ها...
                      </p>
                    </div>
                  </OptimizedMotion>
                )}
              </OptimizedMotion>
            )}
          </CardContent>
        </Card>
      </OptimizedMotion>
    );
  }
);

StoryboardCanvas.displayName = 'StoryboardCanvas';

export { StoryboardCanvas };

