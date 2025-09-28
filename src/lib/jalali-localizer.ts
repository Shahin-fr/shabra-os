import { format, parse, startOfWeek, endOfWeek, startOfDay, endOfDay, getDay, addDays, addWeeks, addMonths, addYears, subDays, subWeeks, subMonths, subYears, startOfMonth, endOfMonth, startOfYear, endOfYear, isSameDay, isSameMonth, isSameYear, isToday, isWeekend, getWeek, getMonth, getYear, getDate, getHours, getMinutes, getSeconds, setHours, setMinutes, setSeconds, setDate, setMonth, setYear, addHours, addMinutes, addSeconds, subHours, subMinutes, subSeconds, isEqual, isAfter, isBefore, addMinutes as addMinutesJalali, subMinutes as subMinutesJalali, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, differenceInWeeks, differenceInMonths, differenceInYears } from 'date-fns-jalali';
import { persianMonths, persianDays, persianWeekdaysShort } from './date-utils';

// Complete Jalali localizer for react-big-calendar - implements full DateLocalizer interface
export const jalaliLocalizer = {
  // Format functions
  format: (date: Date, formatStr: string) => {
    try {
      // Defensive check: ensure date is valid
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        console.warn('Invalid date passed to format function:', date);
        return 'تاریخ نامعتبر';
      }
      
      // Defensive check: ensure formatStr is valid
      if (!formatStr || typeof formatStr !== 'string') {
        console.warn('Invalid format string passed to format function:', formatStr);
        return date.toLocaleDateString('fa-IR');
      }
      
      return format(date, formatStr);
    } catch (error) {
      console.error('Error formatting Jalali date:', error, { date, formatStr });
      return date.toLocaleDateString('fa-IR');
    }
  },

  // Parse functions
  parse: (dateStr: string, formatStr: string) => {
    try {
      return parse(dateStr, formatStr, new Date());
    } catch (error) {
      console.error('Error parsing Jalali date:', error);
      return new Date(dateStr);
    }
  },

  // Start of week (Saturday in Jalali calendar)
  startOfWeek: (date: Date) => {
    return startOfWeek(date, { weekStartsOn: 6 }); // 6 = Saturday
  },

  // Get day of week (0 = Saturday, 1 = Sunday, etc.)
  getDay: (date: Date) => {
    return getDay(date);
  },

  // Locale data
  locales: {
    'fa': {
      week: {
        dow: 6, // Saturday
        doy: 1, // First day of year
      },
      dayNames: persianDays,
      dayNamesShort: persianWeekdaysShort,
      monthNames: persianMonths,
      monthNamesShort: persianMonths,
      formats: {
        dayFormat: 'dddd',
        weekdayFormat: 'dddd',
        monthFormat: 'MMMM',
        yearFormat: 'yyyy',
        dayHeaderFormat: 'dddd، d MMMM',
        dayRangeFormat: 'd MMMM - d MMMM',
        monthHeaderFormat: 'MMMM yyyy',
        agendaDateFormat: 'dddd، d MMMM',
        agendaTimeFormat: 'HH:mm',
        agendaTimeRangeFormat: 'HH:mm - HH:mm',
        timeGutterFormat: 'HH:mm',
        eventTimeRangeFormat: 'HH:mm - HH:mm',
        dateFormat: 'yyyy/MM/dd',
        dateTimeFormat: 'yyyy/MM/dd HH:mm',
        workWeekFormat: 'dddd',
      },
      messages: {
        next: 'بعدی',
        previous: 'قبلی',
        today: 'امروز',
        month: 'ماه',
        week: 'هفته',
        day: 'روز',
        agenda: 'برنامه',
        date: 'تاریخ',
        time: 'زمان',
        event: 'رویداد',
        noEventsInRange: 'هیچ رویدادی در این بازه زمانی وجود ندارد',
        showMore: (total: number) => `+${total} بیشتر`,
        allDay: 'تمام روز',
        work_week: 'هفته کاری',
        yesterday: 'دیروز',
        tomorrow: 'فردا',
      }
    }
  },

  // Culture
  culture: 'fa',

  // Additional utility functions (removed duplicates - using custom implementations below)

  // Required methods for react-big-calendar (moved to comprehensive implementation below)
  
  // Week calculation
  week: (date: Date) => getWeek(date),
  
  // Date manipulation (moved to comprehensive implementation below)

  // Required method for react-big-calendar
  visibleDays: (date: Date, view: string) => {
    try {
      // Defensive validation
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        console.warn('Invalid date passed to visibleDays method:', { date, view });
        return [];
      }
      
      const start = startOfWeek(date, { weekStartsOn: 6 });
      const end = endOfWeek(date, { weekStartsOn: 6 });
      
      // Validate the calculated dates
      if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.warn('Invalid calculated dates in visibleDays method:', { date, view, start, end });
        return [];
      }
      
      const days = [];
      let current = new Date(start);
      
      // Add safety counter to prevent infinite loops
      let iterations = 0;
      const maxIterations = 10; // Should never need more than 7 days for a week
      
      while (current <= end && iterations < maxIterations) {
        days.push(new Date(current));
        current = addDays(current, 1);
        iterations++;
      }
      
      // If we hit the max iterations, log a warning
      if (iterations >= maxIterations) {
        console.warn('visibleDays method hit max iterations:', { date, view, iterations });
      }
      
      return days;
    } catch (error) {
      console.error('Error in visibleDays method:', error, { date, view });
      return [];
    }
  },

  // Additional required methods
  firstVisibleDay: (date: Date, view: string) => {
    try {
      // Defensive validation
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        console.warn('Invalid date passed to firstVisibleDay method:', { date, view });
        return new Date(); // Return current date as fallback
      }
      
      let result;
      switch (view) {
        case 'month':
          result = startOfMonth(date);
          break;
        case 'week':
          result = startOfWeek(date, { weekStartsOn: 6 });
          break;
        case 'day':
          result = startOfDay(date);
          break;
        default:
          result = startOfMonth(date);
      }
      
      // Validate the result
      if (!result || !(result instanceof Date) || isNaN(result.getTime())) {
        console.warn('Invalid result from firstVisibleDay method:', { date, view, result });
        return new Date(); // Return current date as fallback
      }
      
      return result;
    } catch (error) {
      console.error('Error in firstVisibleDay method:', error, { date, view });
      return new Date(); // Return current date as fallback
    }
  },

  lastVisibleDay: (date: Date, view: string) => {
    try {
      // Defensive validation
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        console.warn('Invalid date passed to lastVisibleDay method:', { date, view });
        return new Date(); // Return current date as fallback
      }
      
      let result;
      switch (view) {
        case 'month':
          result = endOfMonth(date);
          break;
        case 'week':
          result = endOfWeek(date, { weekStartsOn: 6 });
          break;
        case 'day':
          result = endOfDay(date);
          break;
        default:
          result = endOfMonth(date);
      }
      
      // Validate the result
      if (!result || !(result instanceof Date) || isNaN(result.getTime())) {
        console.warn('Invalid result from lastVisibleDay method:', { date, view, result });
        return new Date(); // Return current date as fallback
      }
      
      return result;
    } catch (error) {
      console.error('Error in lastVisibleDay method:', error, { date, view });
      return new Date(); // Return current date as fallback
    }
  },

  // Time zone methods (using UTC for consistency)
  timezone: () => 'UTC',
  
  // Date creation methods
  create: (year: number, month: number, day: number, hour: number = 0, minute: number = 0, second: number = 0) => {
    return new Date(year, month - 1, day, hour, minute, second);
  },

  // Date parsing
  parseDate: (dateStr: string) => {
    return new Date(dateStr);
  },

  // Date serialization
  serializeDate: (date: Date) => {
    return date.toISOString();
  },

  // Weekday methods
  weekdays: () => {
    return [0, 1, 2, 3, 4, 5, 6]; // Sunday = 0, Saturday = 6
  },

  weekdaysShort: () => {
    return persianWeekdaysShort;
  },

  weekdaysMin: () => {
    return persianWeekdaysShort;
  },

  // Month methods
  months: () => {
    return persianMonths;
  },

  monthsShort: () => {
    return persianMonths;
  },

  // Locale data
  locale: () => ({
    code: 'fa',
    week: {
      dow: 6, // Saturday
      doy: 1, // First day of year
    },
  }),

  // Required range method for react-big-calendar
  range: (start: Date, end: Date, unit: string) => {
    try {
      // Defensive validation
      if (!start || !end || !(start instanceof Date) || !(end instanceof Date)) {
        console.warn('Invalid dates passed to range method:', { start, end, unit });
        return [];
      }
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.warn('Invalid date values passed to range method:', { start, end, unit });
        return [];
      }
      
      // Ensure start is before or equal to end
      if (start > end) {
        console.warn('Start date is after end date in range method:', { start, end, unit });
        return [];
      }
      
      
      const ranges = [];
      let current = new Date(start);
      
      // Add safety counter to prevent infinite loops
      let iterations = 0;
      const maxIterations = 1000; // Reasonable upper limit
      
      while (current <= end && iterations < maxIterations) {
        ranges.push(new Date(current));
        
        switch (unit) {
          case 'day':
            current = addDays(current, 1);
            break;
          case 'week':
            current = addWeeks(current, 1);
            break;
          case 'month':
            current = addMonths(current, 1);
            break;
          case 'year':
            current = addYears(current, 1);
            break;
          default:
            current = addDays(current, 1);
        }
        
        iterations++;
      }
      
      // If we hit the max iterations, log a warning
      if (iterations >= maxIterations) {
        console.warn('Range method hit max iterations, possible infinite loop:', { start, end, unit, iterations });
      }
      
      return ranges;
    } catch (error) {
      console.error('Error in range method:', error, { start, end, unit });
      return [];
    }
  },

  // Additional required methods for react-big-calendar (moved to comprehensive implementation below)

  // Date manipulation methods
  addMinutes: (date: Date, amount: number) => {
    return addMinutesJalali(date, amount);
  },

  addHours: (date: Date, amount: number) => {
    return addHours(date, amount);
  },

  addDays: (date: Date, amount: number) => {
    return addDays(date, amount);
  },

  addWeeks: (date: Date, amount: number) => {
    return addWeeks(date, amount);
  },

  addMonths: (date: Date, amount: number) => {
    return addMonths(date, amount);
  },

  addYears: (date: Date, amount: number) => {
    return addYears(date, amount);
  },

  // Subtraction methods
  subtractMinutes: (date: Date, amount: number) => {
    return subMinutesJalali(date, amount);
  },

  subtractHours: (date: Date, amount: number) => {
    return subHours(date, amount);
  },

  subtractDays: (date: Date, amount: number) => {
    return subDays(date, amount);
  },

  subtractWeeks: (date: Date, amount: number) => {
    return subWeeks(date, amount);
  },

  subtractMonths: (date: Date, amount: number) => {
    return subMonths(date, amount);
  },

  subtractYears: (date: Date, amount: number) => {
    return subYears(date, amount);
  },

  // Date comparison methods
  isSameDay: (date1: Date, date2: Date) => {
    return isSameDay(date1, date2);
  },

  isSameMonth: (date1: Date, date2: Date) => {
    return isSameMonth(date1, date2);
  },

  isSameYear: (date1: Date, date2: Date) => {
    return isSameYear(date1, date2);
  },

  isToday: (date: Date) => {
    return isToday(date);
  },

  isWeekend: (date: Date) => {
    return isWeekend(date);
  },

  // Date boundary methods
  startOfDay: (date: Date) => {
    return startOfDay(date);
  },

  endOfDay: (date: Date) => {
    return endOfDay(date);
  },

  endOfWeek: (date: Date) => {
    return endOfWeek(date, { weekStartsOn: 6 });
  },

  startOfMonth: (date: Date) => {
    return startOfMonth(date);
  },

  endOfMonth: (date: Date) => {
    return endOfMonth(date);
  },

  startOfYear: (date: Date) => {
    return startOfYear(date);
  },

  endOfYear: (date: Date) => {
    return endOfYear(date);
  },

  // Date component getters
  getYear: (date: Date) => {
    return getYear(date);
  },

  getMonth: (date: Date) => {
    return getMonth(date);
  },

  getDate: (date: Date) => {
    return getDate(date);
  },

  getHours: (date: Date) => {
    return getHours(date);
  },

  getMinutes: (date: Date) => {
    return getMinutes(date);
  },

  getSeconds: (date: Date) => {
    return getSeconds(date);
  },

  getWeek: (date: Date) => {
    return getWeek(date);
  },

  // Date component setters
  setYear: (date: Date, year: number) => {
    return setYear(date, year);
  },

  setMonth: (date: Date, month: number) => {
    return setMonth(date, month);
  },

  setDate: (date: Date, day: number) => {
    return setDate(date, day);
  },

  setHours: (date: Date, hours: number) => {
    return setHours(date, hours);
  },

  setMinutes: (date: Date, minutes: number) => {
    return setMinutes(date, minutes);
  },

  setSeconds: (date: Date, seconds: number) => {
    return setSeconds(date, seconds);
  },

  // Utility methods (moved to comprehensive implementation below)

  // Date parsing and formatting
  parseISO: (dateStr: string) => {
    return new Date(dateStr);
  },

  toISOString: (date: Date) => {
    return date.toISOString();
  },

  // Weekday utilities
  getDayOfWeek: (date: Date) => {
    return getDay(date);
  },

  isWeekday: (date: Date) => {
    const day = getDay(date);
    return day !== 0 && day !== 6; // Not Sunday (0) or Saturday (6)
  },

  // Month utilities
  getDaysInMonth: (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  },

  // Year utilities
  isLeapYear: (date: Date) => {
    const year = getYear(date);
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  },

  // ===== REQUIRED METHODS FOR REACT-BIG-CALENDAR =====
  
  // Core required methods
  firstOfWeek: () => 6, // Saturday in Jalali calendar
  
  // Date arithmetic methods
  add: (date: Date, amount: number, unit: string) => {
    switch (unit) {
      case 'minutes':
        return addMinutesJalali(date, amount);
      case 'hours':
        return addHours(date, amount);
      case 'days':
        return addDays(date, amount);
      case 'weeks':
        return addWeeks(date, amount);
      case 'months':
        return addMonths(date, amount);
      case 'years':
        return addYears(date, amount);
      default:
        return addDays(date, amount);
    }
  },
  
  subtract: (date: Date, amount: number, unit: string) => {
    switch (unit) {
      case 'minutes':
        return subMinutesJalali(date, amount);
      case 'hours':
        return subHours(date, amount);
      case 'days':
        return subDays(date, amount);
      case 'weeks':
        return subWeeks(date, amount);
      case 'months':
        return subMonths(date, amount);
      case 'years':
        return subYears(date, amount);
      default:
        return subDays(date, amount);
    }
  },
  
  // Date comparison methods
  lt: (a: Date, b: Date) => isBefore(a, b),
  lte: (a: Date, b: Date) => isBefore(a, b) || isEqual(a, b),
  gt: (a: Date, b: Date) => isAfter(a, b),
  gte: (a: Date, b: Date) => isAfter(a, b) || isEqual(a, b),
  eq: (a: Date, b: Date) => isEqual(a, b),
  neq: (a: Date, b: Date) => !isEqual(a, b),
  
  // Date range methods
  inRange: (date: Date, start: Date, end: Date) => {
    return (isAfter(date, start) || isEqual(date, start)) && (isBefore(date, end) || isEqual(date, end));
  },
  
  // Date manipulation methods
  startOf: (date: Date, unit: string) => {
    try {
      // Defensive validation
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        console.warn('Invalid date passed to startOf method:', { date, unit });
        return new Date(); // Return current date as fallback
      }
      
      let result;
      switch (unit) {
        case 'day':
          result = startOfDay(date);
          break;
        case 'week':
          result = startOfWeek(date, { weekStartsOn: 6 });
          break;
        case 'month':
          result = startOfMonth(date);
          break;
        case 'year':
          result = startOfYear(date);
          break;
        default:
          result = startOfDay(date);
      }
      
      // Validate the result
      if (!result || !(result instanceof Date) || isNaN(result.getTime())) {
        console.warn('Invalid result from startOf method:', { date, unit, result });
        return new Date(); // Return current date as fallback
      }
      
      return result;
    } catch (error) {
      console.error('Error in startOf method:', error, { date, unit });
      return new Date(); // Return current date as fallback
    }
  },
  
  endOf: (date: Date, unit: string) => {
    try {
      // Defensive validation
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        console.warn('Invalid date passed to endOf method:', { date, unit });
        return new Date(); // Return current date as fallback
      }
      
      let result;
      switch (unit) {
        case 'day':
          result = endOfDay(date);
          break;
        case 'week':
          result = endOfWeek(date, { weekStartsOn: 6 });
          break;
        case 'month':
          result = endOfMonth(date);
          break;
        case 'year':
          result = endOfYear(date);
          break;
        default:
          result = endOfDay(date);
      }
      
      // Validate the result
      if (!result || !(result instanceof Date) || isNaN(result.getTime())) {
        console.warn('Invalid result from endOf method:', { date, unit, result });
        return new Date(); // Return current date as fallback
      }
      
      return result;
    } catch (error) {
      console.error('Error in endOf method:', error, { date, unit });
      return new Date(); // Return current date as fallback
    }
  },
  
  // Difference calculation
  diff: (dateA: Date, dateB: Date, unit: string) => {
    switch (unit) {
      case 'days':
        return differenceInDays(dateA, dateB);
      case 'hours':
        return differenceInHours(dateA, dateB);
      case 'minutes':
        return differenceInMinutes(dateA, dateB);
      case 'seconds':
        return differenceInSeconds(dateA, dateB);
      case 'weeks':
        return differenceInWeeks(dateA, dateB);
      case 'months':
        return differenceInMonths(dateA, dateB);
      case 'years':
        return differenceInYears(dateA, dateB);
      default:
        return differenceInDays(dateA, dateB);
    }
  },
  
  // Ceiling function
  ceil: (date: Date, unit: string) => {
    const start = jalaliLocalizer.startOf(date, unit);
    if (isEqual(start, date)) {
      return date;
    }
    return jalaliLocalizer.add(start, 1, unit);
  },
  
  // Min/Max functions
  min: (...dates: Date[]) => {
    return new Date(Math.min(...dates.map(d => d.getTime())));
  },
  
  max: (...dates: Date[]) => {
    return new Date(Math.max(...dates.map(d => d.getTime())));
  },
  
  // Minutes calculation
  minutes: (date: Date) => {
    return getHours(date) * 60 + getMinutes(date);
  },
  
  // Merge date and time
  merge: (date: Date, time: Date) => {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes(),
      time.getSeconds(),
      time.getMilliseconds()
    );
  },
  
  // Event range methods
  inEventRange: (event: any, range: { start: Date; end: Date }) => {
    // Defensive check: ensure range and event are valid
    if (!range || !event) {
      return false;
    }
    
    // Ensure range has required properties
    if (!range.start || !range.end) {
      return false;
    }
    
    // Ensure event has required properties
    if (!event.start || !event.end) {
      return false;
    }
    
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    
    // Validate that dates are valid
    if (isNaN(eventStart.getTime()) || isNaN(eventEnd.getTime())) {
      return false;
    }
    
    return (
      (isAfter(eventStart, range.start) || isEqual(eventStart, range.start)) &&
      (isBefore(eventEnd, range.end) || isEqual(eventEnd, range.end))
    );
  },
  
  // Event continuation methods
  continuesPrior: (event: any, range: { start: Date; end: Date }) => {
    // Defensive check: ensure range and event are valid
    if (!range || !event || !range.start || !event.start) {
      return false;
    }
    
    const eventStart = new Date(event.start);
    if (isNaN(eventStart.getTime())) {
      return false;
    }
    
    return isBefore(eventStart, range.start);
  },
  
  continuesAfter: (event: any, range: { start: Date; end: Date }) => {
    // Defensive check: ensure range and event are valid
    if (!range || !event || !range.end || !event.end) {
      return false;
    }
    
    const eventEnd = new Date(event.end);
    if (isNaN(eventEnd.getTime())) {
      return false;
    }
    
    return isAfter(eventEnd, range.end);
  },
  
  // Event sorting
  sortEvents: (eventA: any, eventB: any) => {
    // Defensive check: ensure both events are valid
    if (!eventA || !eventB) {
      return 0;
    }
    
    if (!eventA.start || !eventB.start) {
      return 0;
    }
    
    const startA = new Date(eventA.start);
    const startB = new Date(eventB.start);
    
    // Validate that dates are valid
    if (isNaN(startA.getTime()) || isNaN(startB.getTime())) {
      return 0;
    }
    
    return isBefore(startA, startB) ? -1 : isAfter(startA, startB) ? 1 : 0;
  },
  
  // Date comparison
  isSameDate: (dateA: Date, dateB: Date) => {
    return isSameDay(dateA, dateB);
  },
  
  // Check if dates are date-only (no time component)
  startAndEndAreDateOnly: (start: Date, end: Date) => {
    return start.getHours() === 0 && start.getMinutes() === 0 && start.getSeconds() === 0 &&
           end.getHours() === 0 && end.getMinutes() === 0 && end.getSeconds() === 0;
  },
  
  // Time calculations
  getTotalMin: (dateA: Date, dateB: Date) => {
    return differenceInMinutes(dateA, dateB);
  },
  
  getMinutesFromMidnight: (date: Date) => {
    return getHours(date) * 60 + getMinutes(date);
  },
  
  getSlotDate: (date: Date, minutesFromMidnight: number, offset: number) => {
    const slotDate = new Date(date);
    slotDate.setHours(0, minutesFromMidnight + offset, 0, 0);
    return slotDate;
  },
  
  getTimezoneOffset: (date: Date) => {
    return date.getTimezoneOffset();
  },
  
  getDstOffset: (dateA: Date, dateB: Date) => {
    return dateA.getTimezoneOffset() - dateB.getTimezoneOffset();
  },
  
  // Segment offset for rendering
  segmentOffset: 0,
  
  // Prop type for validation
  propType: null,
};
