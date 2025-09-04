import { motion } from 'framer-motion';
import { CalendarIcon } from 'lucide-react';
import React, { memo } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import StoryTypeManager from './StoryTypeManager';
import { TemplatePalette } from './TemplatePalette';

interface StoryboardPaletteProps {
  storyTypes: any[];
  selectedSlotIndex: number | null;
  onTemplateClick: (storyTypeId: string) => void;
  isLoading: boolean;
  storyTypesLoading: boolean;
  storyTypesError: boolean;
}

const StoryboardPalette = memo<StoryboardPaletteProps>(
  ({
    storyTypes,
    selectedSlotIndex,
    onTemplateClick,
    isLoading,
    storyTypesLoading,
    storyTypesError,
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card
          className='template-container'
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
            <div className='mb-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-2xl font-bold text-foreground mb-2'>
                    پالت قالب‌ها
                  </h2>
                  <p className='text-muted-foreground'>
                    قالب‌های آماده برای استوری‌های مختلف
                  </p>
                </div>
                <StoryTypeManager />
              </div>
            </div>

            {storyTypesLoading ? (
              <motion.div
                className='text-center py-8'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto'></div>
                <p className='mt-2 text-sm text-muted-foreground'>
                  در حال بارگذاری قالب‌ها...
                </p>
              </motion.div>
            ) : storyTypesError ? (
              <motion.div
                className='text-center py-8'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                  <CalendarIcon className='h-6 w-6 text-red-600' />
                </div>
                <h4 className='text-sm font-semibold text-foreground mb-2'>
                  خطا در بارگذاری قالب‌ها
                </h4>
                <p className='text-xs text-muted-foreground mb-4'>
                  مشکلی در بارگذاری قالب‌ها پیش آمده است
                </p>
                <Button
                  size='sm'
                  onClick={() => window.location.reload()}
                  className='bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white text-xs'
                >
                  تلاش مجدد
                </Button>
              </motion.div>
            ) : (
              <TemplatePalette
                storyTypes={storyTypes}
                selectedSlotIndex={selectedSlotIndex}
                onTemplateClick={onTemplateClick}
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);

StoryboardPalette.displayName = 'StoryboardPalette';

export { StoryboardPalette };
