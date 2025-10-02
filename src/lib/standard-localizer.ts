import { format, parse, startOfWeek, endOfWeek, getDay, addDays, addWeeks, addMonths, addYears, subDays, subWeeks, subMonths, subYears, startOfMonth, endOfMonth, startOfYear, endOfYear, isSameDay, isSameMonth, isSameYear, isToday, isWeekend, getWeek, getMonth, getYear, getDate, getHours, getMinutes, getSeconds, setHours, setMinutes, setSeconds, setDate, setMonth, setYear, addHours, subHours, isEqual, isAfter, isBefore, addMinutes, subMinutes, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, differenceInWeeks, differenceInMonths, differenceInYears } from 'date-fns';
import { enUS } from 'date-fns/locale';

// Standard localizer for react-big-calendar using date-fns
export const standardLocalizer = {
  // Format functions
  format: (date: Date, formatStr: string) => {
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        console.warn('Invalid date passed to format function:', date);
        return 'Invalid Date';
      }
      
      if (!formatStr || typeof formatStr !== 'string') {
        console.warn('Invalid format string passed to format function:', formatStr);
        return date.toLocaleDateString('en-US');
      }
      
      return format(date, formatStr, { locale: enUS });
    } catch (error) {
      console.error('Error formatting date:', error, { date, formatStr });
      return date.toLocaleDateString('en-US');
    }
  },

  // Parse functions
  parse: (dateStr: string, formatStr: string) => {
    try {
      return parse(dateStr, formatStr, new Date(), { locale: enUS });
    } catch (error) {
      console.error('Error parsing date:', error);
      return new Date(dateStr);
    }
  },

  // Start of week (Sunday in standard calendar)
  startOfWeek: (date: Date) => {
    return startOfWeek(date, { weekStartsOn: 0 }); // 0 = Sunday
  },

  // End of week
  endOfWeek: (date: Date) => {
    return endOfWeek(date, { weekStartsOn: 0 });
  },

  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  getDay: (date: Date) => {
    return getDay(date);
  },

  // Locale data
  locales: {
    'en': {
      week: {
        dow: 0, // Sunday
        doy: 1, // First day of year
      },
      dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      formats: {
        dayFormat: 'EEEE',
        weekdayFormat: 'EEEE',
        monthFormat: 'MMMM',
        yearFormat: 'yyyy',
        dayHeaderFormat: 'EEEE, MMMM d',
        dayRangeFormat: 'MMM d - MMM d',
        monthHeaderFormat: 'MMMM yyyy',
        agendaDateFormat: 'EEEE, MMMM d',
        agendaTimeFormat: 'h:mm a',
        agendaTimeRangeFormat: 'h:mm a - h:mm a',
        timeGutterFormat: 'h:mm a',
        eventTimeRangeFormat: 'h:mm a - h:mm a',
        dateFormat: 'MM/dd/yyyy',
        dateTimeFormat: 'MM/dd/yyyy h:mm a',
        workWeekFormat: 'EEEE',
      },
      messages: {
        next: 'Next',
        previous: 'Previous',
        today: 'Today',
        month: 'Month',
        week: 'Week',
        day: 'Day',
        agenda: 'Agenda',
        date: 'Date',
        time: 'Time',
        event: 'Event',
        noEventsInRange: 'No events in this range',
        showMore: (total: number) => `+${total} more`,
        allDay: 'All Day',
        work_week: 'Work Week',
        yesterday: 'Yesterday',
        tomorrow: 'Tomorrow',
      }
    }
  },

  // Culture
  culture: 'en',

  // Week calculation
  week: (date: Date) => getWeek(date),
  
  // Date manipulation
  add: (date: Date, amount: number, unit: string) => {
    switch (unit) {
      case 'day':
        return addDays(date, amount);
      case 'week':
        return addWeeks(date, amount);
      case 'month':
        return addMonths(date, amount);
      case 'year':
        return addYears(date, amount);
      case 'hour':
        return addHours(date, amount);
      case 'minute':
        return addMinutes(date, amount);
      default:
        return date;
    }
  },

  subtract: (date: Date, amount: number, unit: string) => {
    switch (unit) {
      case 'day':
        return subDays(date, amount);
      case 'week':
        return subWeeks(date, amount);
      case 'month':
        return subMonths(date, amount);
      case 'year':
        return subYears(date, amount);
      case 'hour':
        return subHours(date, amount);
      case 'minute':
        return subMinutes(date, amount);
      default:
        return date;
    }
  },

  // Date comparisons
  isSameDay: (date1: Date, date2: Date) => isSameDay(date1, date2),
  isSameMonth: (date1: Date, date2: Date) => isSameMonth(date1, date2),
  isSameYear: (date1: Date, date2: Date) => isSameYear(date1, date2),
  isToday: (date: Date) => isToday(date),
  isWeekend: (date: Date) => isWeekend(date),
  isEqual: (date1: Date, date2: Date) => isEqual(date1, date2),
  isAfter: (date1: Date, date2: Date) => isAfter(date1, date2),
  isBefore: (date1: Date, date2: Date) => isBefore(date1, date2),
  neq: (date1: Date, date2: Date) => !isEqual(date1, date2),
  gte: (date1: Date, date2: Date) => isEqual(date1, date2) || isAfter(date1, date2),
  lte: (date1: Date, date2: Date) => isEqual(date1, date2) || isBefore(date1, date2),
  gt: (date1: Date, date2: Date) => isAfter(date1, date2),
  lt: (date1: Date, date2: Date) => isBefore(date1, date2),

  // Date parts
  getYear: (date: Date) => getYear(date),
  getMonth: (date: Date) => getMonth(date),
  getDate: (date: Date) => getDate(date),
  getHours: (date: Date) => getHours(date),
  getMinutes: (date: Date) => getMinutes(date),
  getSeconds: (date: Date) => getSeconds(date),

  // Date setters
  setYear: (date: Date, year: number) => setYear(date, year),
  setMonth: (date: Date, month: number) => setMonth(date, month),
  setDate: (date: Date, day: number) => setDate(date, day),
  setHours: (date: Date, hours: number) => setHours(date, hours),
  setMinutes: (date: Date, minutes: number) => setMinutes(date, minutes),
  setSeconds: (date: Date, seconds: number) => setSeconds(date, seconds),

  // Start/End of periods
  startOfDay: (date: Date) => startOfDay(date),
  endOfDay: (date: Date) => endOfDay(date),
  startOfMonth: (date: Date) => startOfMonth(date),
  endOfMonth: (date: Date) => endOfMonth(date),
  startOfYear: (date: Date) => startOfYear(date),
  endOfYear: (date: Date) => endOfYear(date),

  // Differences
  differenceInDays: (date1: Date, date2: Date) => differenceInDays(date1, date2),
  differenceInHours: (date1: Date, date2: Date) => differenceInHours(date1, date2),
  differenceInMinutes: (date1: Date, date2: Date) => differenceInMinutes(date1, date2),
  differenceInSeconds: (date1: Date, date2: Date) => differenceInSeconds(date1, date2),
  differenceInWeeks: (date1: Date, date2: Date) => differenceInWeeks(date1, date2),
  differenceInMonths: (date1: Date, date2: Date) => differenceInMonths(date1, date2),
  differenceInYears: (date1: Date, date2: Date) => differenceInYears(date1, date2),

  // Additional required methods for react-big-calendar
  merge: (date: Date, time: Date) => {
    const merged = new Date(date);
    merged.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
    return merged;
  },

  // Week calculation
  week: (date: Date) => getWeek(date, { weekStartsOn: 0 }),

  // Month calculation
  month: (date: Date) => getMonth(date),

  // Year calculation
  year: (date: Date) => getYear(date),

  // Day calculation
  day: (date: Date) => getDate(date),

  // Hour calculation
  hour: (date: Date) => getHours(date),

  // Minute calculation
  minute: (date: Date) => getMinutes(date),

  // Second calculation
  second: (date: Date) => getSeconds(date),

  // Required method for react-big-calendar
  visibleDays: (date: Date, view: string) => {
    const start = startOfWeek(date, { weekStartsOn: 0 });
    const end = endOfWeek(date, { weekStartsOn: 0 });
    
    const days = [];
    let current = start;
    
    while (current <= end) {
      days.push(new Date(current));
      current = addDays(current, 1);
    }
    
    return days;
  },

  // Additional required methods
  firstVisibleDay: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }),
  lastVisibleDay: (date: Date) => endOfWeek(date, { weekStartsOn: 0 }),

  // Week calculation methods
  weekdays: () => [0, 1, 2, 3, 4, 5, 6], // Sunday to Saturday
  weekdaysMin: () => ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  weekdaysShort: () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  weekdaysFull: () => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

  // Month calculation methods
  months: () => [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  monthsShort: () => [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ],

  // Date manipulation methods
  addDays: (date: Date, amount: number) => addDays(date, amount),
  addWeeks: (date: Date, amount: number) => addWeeks(date, amount),
  addMonths: (date: Date, amount: number) => addMonths(date, amount),
  addYears: (date: Date, amount: number) => addYears(date, amount),
  subDays: (date: Date, amount: number) => subDays(date, amount),
  subWeeks: (date: Date, amount: number) => subWeeks(date, amount),
  subMonths: (date: Date, amount: number) => subMonths(date, amount),
  subYears: (date: Date, amount: number) => subYears(date, amount),

  // Required method for react-big-calendar
  range: (start: Date, end: Date, step: number = 1) => {
    const dates = [];
    let current = new Date(start);
    
    while (current <= end) {
      dates.push(new Date(current));
      current = addDays(current, step);
    }
    
    return dates;
  },

  // Additional range methods
  rangeByUnit: (start: Date, end: Date, unit: string) => {
    const dates = [];
    let current = new Date(start);
    
    while (current <= end) {
      dates.push(new Date(current));
      
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
    }
    
    return dates;
  },

  // Date range utilities
  inRange: (date: Date, start: Date, end: Date) => {
    return date >= start && date <= end;
  },

  // Week range
  weekRange: (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 0 });
    const end = endOfWeek(date, { weekStartsOn: 0 });
    return { start, end };
  },

  // Month range
  monthRange: (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return { start, end };
  },

  // Year range
  yearRange: (date: Date) => {
    const start = startOfYear(date);
    const end = endOfYear(date);
    return { start, end };
  },

  // Additional required methods for react-big-calendar
  getDOW: (date: Date) => getDay(date), // Day of week (0 = Sunday)
  getDOY: (date: Date) => getDayOfYear(date), // Day of year
  getWeek: (date: Date) => getWeek(date), // Week number
  getISOWeek: (date: Date) => getISOWeek(date), // ISO week number
  
  // Date creation methods
  createDate: (year: number, month: number, day: number) => new Date(year, month - 1, day),
  createDateTime: (year: number, month: number, day: number, hour: number, minute: number) => 
    new Date(year, month - 1, day, hour, minute),
  
  // Date validation
  isValidDate: (date: Date) => !isNaN(date.getTime()),
  
  // Timezone methods
  getTimezoneOffset: (date: Date) => date.getTimezoneOffset(),
  
  // Locale methods
  getLocale: () => 'en',
  setLocale: (locale: string) => {}, // No-op for now
  
  // Format methods
  formatDate: (date: Date, format: string) => format(date, format),
  parseDate: (dateString: string, format: string) => parseISO(dateString),

  // Event range methods
  inEventRange: (event: any, date: Date) => {
    if (!event || !event.start || !event.end) return false;
    
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    
    return date >= eventStart && date <= eventEnd;
  },

  // Event overlap methods
  eventsOverlap: (event1: any, event2: any) => {
    if (!event1 || !event2 || !event1.start || !event1.end || !event2.start || !event2.end) {
      return false;
    }
    
    const start1 = new Date(event1.start);
    const end1 = new Date(event1.end);
    const start2 = new Date(event2.start);
    const end2 = new Date(event2.end);
    
    return start1 < end2 && start2 < end1;
  },

  // Event positioning methods
  getEventStyle: (event: any, start: Date, end: Date, isRtl: boolean) => {
    if (!event || !event.start || !event.end) return {};
    
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    
    const startTime = eventStart.getTime();
    const endTime = eventEnd.getTime();
    const dayStart = start.getTime();
    const dayEnd = end.getTime();
    
    const left = Math.max(0, (startTime - dayStart) / (dayEnd - dayStart)) * 100;
    const width = Math.min(100, (endTime - dayStart) / (dayEnd - dayStart)) * 100 - left;
    
    return {
      left: `${left}%`,
      width: `${width}%`,
      position: 'absolute',
      top: 0,
      height: '100%',
    };
  },

  // Event collision detection
  getCollisionGroups: (events: any[]) => {
    const groups: any[][] = [];
    const processed = new Set();
    
    events.forEach((event, index) => {
      if (processed.has(index)) return;
      
      const group = [event];
      processed.add(index);
      
      events.forEach((otherEvent, otherIndex) => {
        if (otherIndex === index || processed.has(otherIndex)) return;
        
        if (this.eventsOverlap(event, otherEvent)) {
          group.push(otherEvent);
          processed.add(otherIndex);
        }
      });
      
      groups.push(group);
    });
    
    return groups;
  },

  // Event positioning for overlapping events
  positionEvents: (events: any[]) => {
    const groups = this.getCollisionGroups(events);
    
    groups.forEach(group => {
      if (group.length === 1) {
        group[0].left = 0;
        group[0].width = 100;
      } else {
        group.forEach((event, index) => {
          event.left = (index / group.length) * 100;
          event.width = (1 / group.length) * 100;
        });
      }
    });
    
    return events;
  },

  // Additional required methods for react-big-calendar
  getEventEnd: (event: any) => {
    if (!event || !event.end) return null;
    return new Date(event.end);
  },

  getEventStart: (event: any) => {
    if (!event || !event.start) return null;
    return new Date(event.start);
  },

  // Event duration methods
  getEventDuration: (event: any) => {
    if (!event || !event.start || !event.end) return 0;
    const start = new Date(event.start);
    const end = new Date(event.end);
    return end.getTime() - start.getTime();
  },

  // Event comparison methods
  isEventAfter: (event1: any, event2: any) => {
    if (!event1 || !event2 || !event1.start || !event2.start) return false;
    return new Date(event1.start) > new Date(event2.start);
  },

  isEventBefore: (event1: any, event2: any) => {
    if (!event1 || !event2 || !event1.start || !event2.start) return false;
    return new Date(event1.start) < new Date(event2.start);
  },

  // Event sorting methods
  sortEvents: (events: any[]) => {
    return events.sort((a, b) => {
      if (!a || !b || !a.start || !b.start) return 0;
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
  },

  // Event filtering methods
  filterEventsByDate: (events: any[], date: Date) => {
    return events.filter(event => {
      if (!event || !event.start || !event.end) return false;
      return this.inEventRange(event, date);
    });
  },

  filterEventsByRange: (events: any[], start: Date, end: Date) => {
    return events.filter(event => {
      if (!event || !event.start || !event.end) return false;
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return eventStart < end && eventEnd > start;
    });
  },

  // Event grouping methods
  groupEventsByDate: (events: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    events.forEach(event => {
      if (!event || !event.start) return;
      const dateKey = format(new Date(event.start), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });
    
    return groups;
  },

  // Event conflict detection
  hasEventConflict: (events: any[], newEvent: any) => {
    if (!newEvent || !newEvent.start || !newEvent.end) return false;
    
    return events.some(event => {
      if (!event || !event.start || !event.end) return false;
      return this.eventsOverlap(event, newEvent);
    });
  },

  // Event validation
  isValidEvent: (event: any) => {
    if (!event) return false;
    if (!event.start || !event.end) return false;
    
    const start = new Date(event.start);
    const end = new Date(event.end);
    
    return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start < end;
  },
};
