'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { Palette, CalendarIcon, Settings } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import { StoryManagement } from '@/components/lazy';
import { Button } from '@/components/ui/button';
import ClientOnly from '@/components/ui/ClientOnly';
import { JalaliCalendar } from '@/components/ui/jalali-calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useStoryboardData } from '@/hooks/useStoryboardData';
import { formatJalaliDate } from '@/lib/date-utils';
import { Story } from '@/types/story';

export default function StoryboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if date parameter exists in URL
    const dateParam = searchParams.get('date');
    if (dateParam) {
      try {
        // Parse the date parameter (expecting YYYY-MM-DD format)
        const parsedDate = new Date(dateParam);
        if (!isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate);
        } else {
          setSelectedDate(new Date());
        }
      } catch (error) {
        setSelectedDate(new Date());
      }
    } else {
      setSelectedDate(new Date());
    }
  }, [searchParams]);
  const [slotCount, setSlotCount] = useState(6);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(
    null
  );

  const {
    storyTypes,
    stories,
    storyTypesLoading,
    storiesLoading,
    storyTypesError,
    storiesError,
    storiesErrorDetails,
    refetchStories,
  } = useStoryboardData(selectedDate || new Date());

  const isLoading = storyTypesLoading || storiesLoading;
  const isError = storyTypesError || storiesError;

  return (
    <div className='bg-gradient-to-br from-pink-50 via-white to-purple-50'>
      {/* Header */}
      <OptimizedMotion
        className='bg-white/80 backdrop-blur-md border-b border-pink-200/50 px-6 py-6'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className='flex items-center justify-between'>
          {/* Title Section - Left Side */}
          <div className='flex items-center space-x-4 space-x-reverse'>
            <OptimizedMotion
              className='w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center'
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            >
              <Palette className='h-6 w-6 text-white' />
            </OptimizedMotion>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>استوری‌بورد</h1>
              <p className='text-gray-600 mt-1'>
                برنامه‌ریزی بصری برای محتوای روزانه
              </p>
            </div>
          </div>

          {/* Right Side - Date Selection and Management */}
          <div className='flex items-center gap-4'>
            {/* Settings Button */}
            <Link href='/admin/storyboard'>
              <Button className='flex items-center gap-2 bg-gradient-to-r from-[#ff0a54] to-[#ff0a54]/80 hover:from-[#ff0a54]/90 hover:to-[#ff0a54]/70 text-white px-6 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200'>
                <Settings className='h-5 w-5' />
                تنظیمات
              </Button>
            </Link>

            {/* Date Selection */}
            <div className='flex flex-col gap-2'>
              <Label className='text-sm font-semibold text-gray-700'>
                انتخاب تاریخ
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className='w-48 justify-start text-left font-normal border-pink-200 hover:border-pink-300 hover:bg-pink-50'
                  >
                    <CalendarIcon className='mr-2 h-4 w-4 text-pink-600' />
                    <ClientOnly fallback='...'>
                      {selectedDate
                        ? formatJalaliDate(selectedDate, 'yyyy/M/d')
                        : '...'}
                    </ClientOnly>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <JalaliCalendar
                    selected={selectedDate || undefined}
                    onSelect={date => date && setSelectedDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </OptimizedMotion>

      {/* Main Content */}
      <div className='p-6 space-y-8'>
        {/* Story Management */}
        <StoryManagement
          selectedDate={selectedDate || new Date()}
          stories={Array.isArray(stories) ? stories : []}
          storyTypes={Array.isArray(storyTypes) ? storyTypes : []}
          isLoading={isLoading}
          isError={isError}
          errorDetails={storiesErrorDetails ? { message: storiesErrorDetails.message, code: storiesErrorDetails.name } : undefined}
          slotCount={slotCount}
          onSlotCountChange={setSlotCount}
          isDialogOpen={isDialogOpen}
          onDialogOpenChange={setIsDialogOpen}
          editingStory={editingStory}
          onEditingStoryChange={setEditingStory}
          isEditing={isEditing}
          onIsEditingChange={setIsEditing}
          selectedSlotIndex={selectedSlotIndex}
          onSelectedSlotIndexChange={setSelectedSlotIndex}
          refetchStories={async () => { await refetchStories(); }}
        />
      </div>
    </div>
  );
}

