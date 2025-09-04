import { motion } from 'framer-motion';
import { CalendarIcon } from 'lucide-react';
import React, { memo } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { JalaliCalendar } from '@/components/ui/jalali-calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatJalaliDate } from '@/lib/date-utils';
import { Story } from '@/types/story';

import { CreateStoryDialog } from './CreateStoryDialog';

interface StoryboardHeaderProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  isDialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  onSubmit: (storyData: any) => void;
  storyTypes: any[];
  isLoading: boolean;
  editingStory: Story | null;
  isEditing: boolean;
}

const StoryboardHeader = memo<StoryboardHeaderProps>(
  ({
    selectedDate,
    onDateSelect,
    isDialogOpen,
    onDialogOpenChange,
    onSubmit,
    storyTypes,
    isLoading,
    editingStory,
    isEditing,
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card
          className='mb-8'
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
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-6'>
                <div className='flex flex-col gap-2'>
                  <Label className='text-sm font-semibold text-foreground'>
                    انتخاب تاریخ
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className='w-48 justify-start text-left font-normal border-primary/30 hover:border-primary/50 hover:bg-primary/5'
                      >
                        <CalendarIcon className='mr-2 h-4 w-4 text-[#ff0a54]' />
                        {formatJalaliDate(selectedDate, 'yyyy/M/d')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <JalaliCalendar
                        selected={selectedDate}
                        onSelect={date => date && onDateSelect(date)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className='flex items-center gap-4'>
                <CreateStoryDialog
                  isOpen={isDialogOpen}
                  onOpenChange={onDialogOpenChange}
                  onSubmit={onSubmit}
                  storyTypes={storyTypes}
                  isLoading={isLoading}
                  editingStory={editingStory}
                  isEditing={isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);

StoryboardHeader.displayName = 'StoryboardHeader';

export { StoryboardHeader };
