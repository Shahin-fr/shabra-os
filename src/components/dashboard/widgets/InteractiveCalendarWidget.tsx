'use client';

import { OptimizedMotion } from '@/components/ui/OptimizedMotion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

// Mock events data
const events = [
  { date: 5, type: 'meeting', title: 'جلسه تیم' },
  { date: 12, type: 'deadline', title: 'تسک پروژه A' },
  { date: 18, type: 'meeting', title: 'بررسی عملکرد' },
  { date: 25, type: 'deadline', title: 'گزارش ماهانه' },
  { date: 28, type: 'alert', title: 'تست سیستم' },
];

const monthNames = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

const dayNames = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export function InteractiveCalendarWidget() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const today = isClient ? new Date().getDate() : 1; // Default to 1 for SSR

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get first day of month and number of days
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Adjust for Persian calendar (Sunday = 0, but we want Saturday = 0)
  const adjustedFirstDay = (firstDay + 1) % 7;

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventType = (date: number) => {
    return events.find(event => event.date === date)?.type;
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-[#ff0a54]';
      case 'deadline':
        return 'bg-orange-500';
      case 'alert':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return Calendar;
      case 'deadline':
        return Clock;
      case 'alert':
        return AlertCircle;
      default:
        return Calendar;
    }
  };

  return (
    <OptimizedMotion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className='h-full'
    >
      <Card className='h-full bg-white border border-gray-200 shadow-sm'>
        <CardHeader className='pb-4'>
          <CardTitle className='text-lg font-bold text-gray-900 flex items-center gap-2'>
            <Calendar className='h-5 w-5 text-[#ff0a54]' />
            تقویم رویدادها
          </CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col h-full'>
          {/* Month Navigation */}
          <div className='flex items-center justify-between mb-6'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => navigateMonth('prev')}
              className='p-2'
            >
              <ChevronRight className="rtl:rotate-180 h-4 w-4" />
            </Button>
            <h3 className='text-lg font-semibold text-gray-900'>
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <Button
              variant='outline'
              size='sm'
              onClick={() => navigateMonth('next')}
              className='p-2'
            >
              <ChevronLeft className="rtl:rotate-180 h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className='flex-1'>
            {/* Day Headers */}
            <div className='grid grid-cols-7 gap-1 mb-2'>
              {dayNames.map(day => (
                <div
                  key={day}
                  className='text-center text-xs font-medium text-gray-500 py-2'
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className='grid grid-cols-7 gap-1'>
              {/* Empty cells for first day */}
              {Array.from({ length: adjustedFirstDay }).map((_, index) => (
                <div key={`empty-${index}`} className='h-8' />
              ))}

              {/* Calendar days */}
              {Array.from({ length: daysInMonth }, (_, index) => {
                const date = index + 1;
                const eventType = getEventType(date);
                const isToday = date === today;
                const isSelected = selectedDate === date;

                return (
                  <OptimizedMotion
                    as="button"
                    key={date}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.01 }}
                    onClick={() =>
                      setSelectedDate(selectedDate === date ? null : date)
                    }
                    className={`
                      relative h-8 w-8 rounded-lg text-sm font-medium transition-all duration-200
                      ${isToday ? 'bg-[#ff0a54] text-white' : ''}
                      ${isSelected && !isToday ? 'bg-[#ff0a54]/10 text-[#ff0a54]' : ''}
                      ${!isToday && !isSelected ? 'hover:bg-gray-100 text-gray-700' : ''}
                    `}
                  >
                    {date}
                    {eventType && (
                      <div
                        className={`
                        absolute -top-1 -end-1 w-2 h-2 rounded-full
                        ${getEventColor(eventType)}
                      `}
                      />
                    )}
                  </OptimizedMotion>
                );
              })}
            </div>
          </div>

          {/* Selected Date Events */}
          {selectedDate && (
            <OptimizedMotion
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              className='mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200'
            >
              <div className='text-sm font-medium text-gray-900 mb-2'>
                رویدادهای {selectedDate} {monthNames[currentMonth]}
              </div>
              {events
                .filter(event => event.date === selectedDate)
                .map((event, index) => {
                  const IconComponent = getEventIcon(event.type);
                  return (
                    <div
                      key={index}
                      className='flex items-center gap-2 text-sm text-gray-600'
                    >
                      <IconComponent className='h-4 w-4' />
                      <span>{event.title}</span>
                    </div>
                  );
                })}
              {events.filter(event => event.date === selectedDate).length ===
                0 && (
                <div className='text-sm text-gray-500'>
                  رویدادی برای این روز وجود ندارد
                </div>
              )}
            </OptimizedMotion>
          )}

          {/* Upcoming Events Summary */}
          <div className='mt-4 space-y-2'>
            <div className='text-sm font-medium text-gray-900'>
              رویدادهای پیش رو
            </div>
            <div className='space-y-1'>
              {events.slice(0, 3).map((event, index) => {
                return (
                  <div
                    key={index}
                    className='flex items-center gap-2 text-xs text-gray-600'
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${getEventColor(event.type)}`}
                    />
                    <span>
                      {event.date} {monthNames[currentMonth]}
                    </span>
                    <span className='text-gray-500'>-</span>
                    <span>{event.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </OptimizedMotion>
  );
}

