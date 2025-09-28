'use client';

import { useState } from 'react';
import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import { Plus } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { AnimatedBackground } from '@/components/ui/animated-background';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import PageManager from '@/components/instapulse/page-manager';
import ReelsGrid from '@/components/instapulse/reels-grid';
import ReelsGridSkeleton from '@/components/instapulse/reels-grid-skeleton';
import { useInstapulseReels } from '@/hooks/use-instapulse-reels';

export default function InstaPulsePage() {
  // Simple state for current sort
  const [currentSort, setCurrentSort] = useState('newest');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Convert to API format
  const apiFilters = {
    dateRange,
    sortBy: currentSort === 'newest' ? 'publishedAt' : 'viewCount',
    sortOrder: 'desc',
  };

  // Fetch reels using TanStack Query
  const { reels, isLoading, isError, error } = useInstapulseReels(apiFilters);

  // Handle sort change
  const handleSortChange = (value: string) => {
    setCurrentSort(value);
  };

  // Handle date range change
  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  };

  return (
    <div className='relative min-h-screen overflow-hidden'>
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Main Content */}
      <div className='relative z-10 p-6 pt-2'>
        {/* Filter Bar - Glassmorphism Effect with Logo */}
        <OptimizedMotion
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          className='mb-8'
        >
          <div className='relative backdrop-blur-2xl bg-gradient-to-r from-pink-500/25 via-rose-500/20 to-pink-600/25 border border-white/40 shadow-2xl shadow-pink-500/40 rounded-3xl before:absolute before:inset-0 before:rounded-3xl before:p-[2px] before:bg-gradient-to-r before:from-pink-400/70 before:via-rose-400/70 before:to-pink-500/70 before:-z-10 after:absolute after:inset-0 after:rounded-3xl after:bg-gradient-to-br after:from-white/25 after:via-transparent after:to-white/15 after:pointer-events-none'>
            <div className='relative z-10 p-8'>
              <div className='flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 lg:gap-8 w-full'>
                {/* Left: Dashboard Title */}
                <div className='flex items-center order-1 lg:order-1'>
                  <div className='backdrop-blur-xl bg-gradient-to-r from-white/25 via-pink-500/25 to-rose-500/25 rounded-2xl px-6 py-3 border border-white/50 shadow-lg shadow-pink-500/30 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-pink-400/40 before:to-rose-400/40 before:-z-10 relative overflow-hidden'>
                    <h1 className='text-xl lg:text-2xl font-bold bg-gradient-to-r from-white via-pink-100 to-rose-100 bg-clip-text text-transparent drop-shadow-lg'>
                      داشبورد اینستاپالس
                    </h1>
                  </div>
                </div>

                {/* Center: Sort Segmented Control */}
                <div className='flex items-center justify-center order-2 lg:order-2 w-full lg:w-auto self-stretch lg:self-center'>
                  <div className='flex gap-3 backdrop-blur-xl bg-gradient-to-r from-white/25 via-pink-500/20 to-rose-500/25 rounded-2xl p-3 border border-white/40 shadow-lg shadow-pink-500/30 w-full max-w-lg relative overflow-hidden before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-pink-400/25 before:to-rose-400/25 before:-z-10'>
                    <Button
                      onClick={() => handleSortChange('newest')}
                      variant={currentSort === 'newest' ? 'default' : 'ghost'}
                      size="sm"
                      className="flex-1"
                    >
                      جدیدترین
                    </Button>
                    <Button
                      onClick={() => handleSortChange('most_viewed')}
                      variant={currentSort === 'most_viewed' ? 'default' : 'ghost'}
                      size="sm"
                      className="flex-1"
                    >
                      پربازدیدترین
                    </Button>
                  </div>
                </div>

                {/* Right: Date Range Picker and Manage Pages Button */}
                <div className='flex flex-col sm:flex-row items-center gap-6 order-3 lg:order-3 w-full lg:w-auto self-stretch lg:self-center'>
                  <DateRangePicker
                    date={dateRange}
                    onDateChange={handleDateRangeChange}
                    placeholder='انتخاب بازه زمانی'
                    className='w-full sm:w-56'
                  />

                  <Dialog>
                    <DialogTrigger asChild>
                      <OptimizedMotion
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant='default'
                          size='lg'
                          className='w-full sm:w-auto'
                        >
                          <Plus className='w-5 h-5 me-2' />
                          مدیریت پیج ها
                        </Button>
                      </OptimizedMotion>
                    </DialogTrigger>
                    <DialogContent className='sm:max-w-[500px]'>
                      <DialogHeader>
                        <DialogTitle>مدیریت پیج‌های دنبال شده</DialogTitle>
                      </DialogHeader>
                      <PageManager />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </OptimizedMotion>

        {/* Reels Grid with Staggered Animation */}
        <OptimizedMotion
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {isLoading ? (
            <ReelsGridSkeleton count={6} />
          ) : isError ? (
            <OptimizedMotion
              className='text-center py-12'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className='text-lg font-semibold text-red-600 mb-2'>
                خطا در بارگذاری ریلس
              </h3>
              <p className='text-muted-foreground'>
                {error?.message || 'خطای نامشخصی رخ داده است'}
              </p>
            </OptimizedMotion>
          ) : (
            <ReelsGrid reels={reels} />
          )}
        </OptimizedMotion>
      </div>
    </div>
  );
}

