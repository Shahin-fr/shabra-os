'use client';

import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useState } from 'react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  date,
  onDateChange,
  placeholder = 'Pick a date range',
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedDate: DateRange | undefined) => {
    onDateChange?.(selectedDate);
    // Close the popover when both dates are selected
    if (selectedDate?.from && selectedDate?.to) {
      setOpen(false);
    }
  };

  const formatDateRange = (dateRange: DateRange | undefined) => {
    if (!dateRange?.from) return placeholder;

    if (dateRange.to) {
      return `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd, yyyy')}`;
    }

    return format(dateRange.from, 'MMM dd, yyyy');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'w-full justify-start text-left font-semibold backdrop-blur-xl bg-gradient-to-r from-white/25 via-pink-500/20 to-rose-500/25 border border-white/40 text-white hover:bg-gradient-to-r hover:from-white/30 hover:via-pink-500/25 hover:to-rose-500/30 hover:border-white/50 rounded-2xl px-6 py-3 shadow-lg shadow-pink-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/40 hover:scale-105 relative overflow-hidden before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-pink-400/20 before:to-rose-400/20 before:-z-10',
            !date && 'text-white/70',
            className
          )}
        >
          <CalendarIcon className='mr-2 h-5 w-5 text-white/80' />
          {formatDateRange(date)}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-auto p-0 backdrop-blur-2xl bg-gradient-to-r from-pink-500/20 via-rose-500/15 to-pink-600/20 border border-white/40 shadow-2xl shadow-pink-500/40 rounded-3xl before:absolute before:inset-0 before:rounded-3xl before:p-[2px] before:bg-gradient-to-r before:from-pink-400/60 before:via-rose-400/60 before:to-pink-500/60 before:-z-10 after:absolute after:inset-0 after:rounded-3xl after:bg-gradient-to-br after:from-white/20 after:via-transparent after:to-white/10 after:pointer-events-none relative overflow-hidden'
        align='start'
      >
        <div className='relative z-10 p-6'>
          <Calendar
            initialFocus
            mode='range'
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            className='bg-transparent'
            components={{
              Chevron: ({ className, orientation, ...props }) => {
                if (orientation === 'left') {
                  return (
                    <ChevronRightIcon
                      className={cn('size-4', className)}
                      {...props}
                    />
                  );
                }

                if (orientation === 'right') {
                  return (
                    <ChevronLeftIcon
                      className={cn('size-4', className)}
                      {...props}
                    />
                  );
                }

                return (
                  <ChevronRightIcon
                    className={cn('size-4', className)}
                    {...props}
                  />
                );
              },
            }}
            classNames={{
              root: 'w-fit bg-transparent',
              months: 'relative flex flex-col gap-4 md:flex-row',
              month: 'flex w-full flex-col gap-4',
              nav: 'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1',
              button_previous:
                'h-8 w-8 select-none p-0 text-white hover:bg-white/10 hover:shadow-lg hover:shadow-pink-500/20 rounded-lg transition-all duration-200 backdrop-blur-sm flex items-center justify-center',
              button_next:
                'h-8 w-8 select-none p-0 text-white hover:bg-white/10 hover:shadow-lg hover:shadow-pink-500/20 rounded-lg transition-all duration-200 backdrop-blur-sm flex items-center justify-center',
              month_caption:
                'flex h-8 w-full items-center justify-center px-8 text-white font-semibold',
              dropdowns:
                'flex h-8 w-full items-center justify-center gap-1.5 text-sm font-medium',
              dropdown_root:
                'has-focus:border-pink-400/50 border-white/30 shadow-sm has-focus:ring-pink-400/50 has-focus:ring-2 relative rounded-lg border bg-white/10 backdrop-blur-sm',
              dropdown: 'bg-white/20 absolute inset-0 opacity-0',
              caption_label: 'select-none font-semibold text-white',
              table: 'w-full border-collapse',
              weekdays: 'flex',
              weekday:
                'text-white/70 flex-1 select-none rounded-md text-sm font-medium',
              week: 'mt-2 flex w-full',
              week_number_header: 'w-8 select-none',
              week_number: 'text-white/50 select-none text-xs',
              day: 'group/day relative aspect-square h-full w-full select-none p-0 text-center text-white hover:bg-white/10 hover:shadow-lg hover:shadow-pink-500/20 rounded-lg transition-all duration-200 backdrop-blur-sm',
              range_start:
                'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-l-lg shadow-lg shadow-pink-500/40',
              range_middle:
                'bg-gradient-to-r from-pink-500/50 to-rose-500/50 text-white rounded-none',
              range_end:
                'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-r-lg shadow-lg shadow-pink-500/40',
              today:
                'bg-white/20 text-white rounded-lg data-[selected=true]:rounded-none font-semibold',
              outside: 'text-white/30 aria-selected:text-white/30',
              disabled: 'text-white/20 opacity-50',
              hidden: 'invisible',
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

