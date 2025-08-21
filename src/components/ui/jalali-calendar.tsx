"use client"

import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  getDay,
  getDate,
  getMonth,
  getYear,
  isSameDay,
  isToday,
  addDays,
  subDays
} from "date-fns-jalali"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { persianMonths, persianWeekdaysShort } from "@/lib/date-utils";

interface JalaliCalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
  className?: string
}

function JalaliCalendar({
  className,
  selected,
  onSelect,
  buttonVariant = "ghost",
}: JalaliCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(() => {
    if (selected) {
      return selected
    }
    // Default to current date
    return new Date()
  })

  // Convert Jalali date to Gregorian Date object
  const convertToGregorian = (jalaliDate: Date): Date => {
    // date-fns-jalali returns Date objects, so we can use them directly
    return jalaliDate
  }

  // Handle month navigation
  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1))
  }

  // Handle date selection
  const handleDateSelect = (jalaliDate: Date) => {
    if (onSelect) {
      const gregorianDate = convertToGregorian(jalaliDate)
      onSelect(gregorianDate)
    }
  }

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const startOfMonthDate = startOfMonth(currentMonth)
    const endOfMonthDate = endOfMonth(currentMonth)
    
    // Get the first day of the month (0 = Saturday in Jalali)
    const firstDayOfMonth = getDay(startOfMonthDate)
    
    // Calculate how many days from previous month to show
    const daysFromPrevMonth = firstDayOfMonth === 6 ? 0 : firstDayOfMonth + 1
    
    // Get days from previous month
    const prevMonthDays = []
    if (daysFromPrevMonth > 0) {
      const prevMonth = subMonths(currentMonth, 1)
      const prevMonthEnd = endOfMonth(prevMonth)
      for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
        prevMonthDays.push(subDays(prevMonthEnd, i))
      }
    }
    
    // Get days from current month
    const currentMonthDays = eachDayOfInterval({
      start: startOfMonthDate,
      end: endOfMonthDate
    })
    
    // Get days from next month to complete the grid
    const totalDays = prevMonthDays.length + currentMonthDays.length
    const remainingSlots = 42 - totalDays // 6 rows * 7 days
    const nextMonthDays = []
    if (remainingSlots > 0) {
      const nextMonth = addMonths(currentMonth, 1)
      for (let i = 0; i < remainingSlots; i++) {
        nextMonthDays.push(addDays(nextMonth, i))
      }
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]
  }

  const calendarDays = generateCalendarDays()

  return (
    <div className={cn("bg-background group/calendar p-3 [--cell-size:2.5rem]", className)}>
      {/* Header with month navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant={buttonVariant}
          size="icon"
          onClick={handlePreviousMonth}
          className="h-8 w-8"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
        
        <div className="text-lg font-semibold text-foreground">
          {persianMonths[getMonth(currentMonth)]} {getYear(currentMonth)}
        </div>
        
        <Button
          variant={buttonVariant}
          size="icon"
          onClick={handleNextMonth}
          className="h-8 w-8"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {persianWeekdaysShort.map((day, index) => (
          <div
            key={index}
            className="flex items-center justify-center text-xs font-medium text-muted-foreground h-[--cell-size]"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const isCurrentMonth = getMonth(day) === getMonth(currentMonth)
          const isSelected = selected && isSameDay(day, selected)
          const isTodayDate = isToday(day)
          
          return (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              onClick={() => handleDateSelect(day)}
              className={cn(
                "h-[--cell-size] w-[--cell-size] p-0 text-sm font-normal",
                !isCurrentMonth && "text-muted-foreground opacity-50",
                isSelected && "bg-[#ff0a54] text-white hover:bg-[#ff0a54]/90",
                isTodayDate && !isSelected && "bg-[#ff0a54]/10 text-[#ff0a54] hover:bg-[#ff0a54]/20",
                isCurrentMonth && !isSelected && !isTodayDate && "hover:bg-[#ff0a54]/5 hover:text-[#ff0a54]"
              )}
            >
              {getDate(day)}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export { JalaliCalendar }
