'use client';

import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { getYear, getMonth, getDate, setYear, setMonth, setDate, setHours, setMinutes } from 'date-fns-jalali';
import { persianMonths, persianWeekdaysShort } from '@/lib/date-utils';

interface JalaliDateTimePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function JalaliDateTimePicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ و زمان",
  disabled = false,
  className
}: JalaliDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);
  const [time, setTime] = useState({
    hours: value ? value.getHours() : 9,
    minutes: value ? value.getMinutes() : 0,
  });

  // Get Jalali date components from a Date object
  const getJalaliDate = (date: Date) => {
    return {
      year: getYear(date),
      month: getMonth(date) + 1, // getMonth returns 0-based month
      day: getDate(date)
    };
  };

  // Create a Date object from Jalali date components
  const createDateFromJalali = (year: number, month: number, day: number, hours: number = 0, minutes: number = 0) => {
    const baseDate = new Date();
    return setMinutes(setHours(setDate(setMonth(setYear(baseDate, year), month - 1), day), hours), minutes);
  };

  const [jalaliDate, setJalaliDate] = useState(() => {
    if (selectedDate) {
      return getJalaliDate(selectedDate);
    }
    const now = new Date();
    return getJalaliDate(now);
  });

  const [currentMonth, setCurrentMonth] = useState(jalaliDate.month);
  const [currentYear, setCurrentYear] = useState(jalaliDate.year);

  // Use Persian month names from date-utils
  const jalaliMonths = persianMonths;

  // Use Persian weekdays from date-utils
  const weekDays = persianWeekdaysShort;

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    const daysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
    if (month === 12 && isLeapYear(year)) {
      return 30;
    }
    return daysInMonth[month - 1];
  };

  // Check if leap year
  const isLeapYear = (year: number) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  // Get first day of month
  const getFirstDayOfMonth = (year: number, month: number) => {
    const firstDay = new Date(year + 621, month - 1, 1);
    return firstDay.getDay();
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const handleDateSelect = (day: number) => {
    const newDate = createDateFromJalali(currentYear, currentMonth, day, time.hours, time.minutes);
    setSelectedDate(newDate);
    setJalaliDate({ year: currentYear, month: currentMonth, day });
    onChange(newDate);
  };

  const handleTimeChange = (type: 'hours' | 'minutes', value: number) => {
    const newTime = { ...time, [type]: value };
    setTime(newTime);
    
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(newTime.hours, newTime.minutes, 0, 0);
      setSelectedDate(newDate);
      onChange(newDate);
    }
  };

  const formatDisplayValue = () => {
    if (!selectedDate) return placeholder;
    
    const jalali = getJalaliDate(selectedDate);
    const timeStr = `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
    
    return `${jalali.year}/${jalali.month}/${jalali.day} - ${timeStr}`;
  };

  const calendarDays = generateCalendarDays();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start rtl:justify-start text-start font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <Calendar className="me-2 h-4 w-4" />
          {formatDisplayValue()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Calendar */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (currentMonth === 1) {
                    setCurrentMonth(12);
                    setCurrentYear(currentYear - 1);
                  } else {
                    setCurrentMonth(currentMonth - 1);
                  }
                }}
              >
                ‹
              </Button>
              <div className="text-center">
                <div className="font-semibold">{jalaliMonths[currentMonth - 1]}</div>
                <div className="text-sm text-gray-500">{currentYear}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (currentMonth === 12) {
                    setCurrentMonth(1);
                    setCurrentYear(currentYear + 1);
                  } else {
                    setCurrentMonth(currentMonth + 1);
                  }
                }}
              >
                ›
              </Button>
            </div>

            {/* Week days */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div key={index} className="text-center">
                  {day && (
                    <Button
                      variant={
                        jalaliDate.year === currentYear &&
                        jalaliDate.month === currentMonth &&
                        jalaliDate.day === day
                          ? "default"
                          : "ghost"
                      }
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => handleDateSelect(day)}
                    >
                      {day}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Time picker */}
          <div className="border-l p-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">زمان</Label>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      min="0"
                      max="23"
                      value={time.hours}
                      onChange={(e) => handleTimeChange('hours', parseInt(e.target.value) || 0)}
                      className="w-16 text-center"
                    />
                    <span className="text-sm text-gray-500">:</span>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={time.minutes}
                      onChange={(e) => handleTimeChange('minutes', parseInt(e.target.value) || 0)}
                      className="w-16 text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                  className="flex-1"
                >
                  انتخاب
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedDate(null);
                    setJalaliDate(getJalaliDate(new Date()));
                    setTime({ hours: 9, minutes: 0 });
                    setIsOpen(false);
                  }}
                >
                  پاک کردن
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}