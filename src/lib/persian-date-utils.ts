import moment from 'moment-jalaali';

/**
 * Convert Gregorian date to Persian (Jalali) date string
 * @param date - Gregorian date
 * @param format - Output format (default: 'jYYYY/jMM/jDD')
 * @returns Persian date string
 */
export function toPersianDate(date: Date | string, format: string = 'jYYYY/jMM/jDD'): string {
  try {
    if (!date) return '--';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '--';
    
    return moment(dateObj).format(format);
  } catch (error) {
    console.error('Error converting to Persian date:', error);
    return '--';
  }
}

/**
 * Get Persian month name
 * @param date - Gregorian date
 * @returns Persian month name
 */
export function getPersianMonthName(date: Date | string): string {
  try {
    if (!date) return '--';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '--';
    
    return moment(dateObj).format('jMMMM');
  } catch (error) {
    console.error('Error getting Persian month name:', error);
    return '--';
  }
}

/**
 * Get Persian day name
 * @param date - Gregorian date
 * @returns Persian day name
 */
export function getPersianDayName(date: Date | string): string {
  try {
    if (!date) return '--';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '--';
    
    return moment(dateObj).format('dddd');
  } catch (error) {
    console.error('Error getting Persian day name:', error);
    return '--';
  }
}

/**
 * Format Persian date for display
 * @param date - Gregorian date
 * @param format - Output format
 * @returns Formatted Persian date
 */
export function formatPersianDate(date: Date | string, format: string = 'jYYYY/jMM/jDD'): string {
  return toPersianDate(date, format);
}

/**
 * Format Persian date and time
 * @param date - Gregorian date
 * @returns Formatted Persian date and time
 */
export function formatPersianDateTime(date: Date | string): string {
  return toPersianDate(date, 'jYYYY/jMM/jDD HH:mm');
}

/**
 * Format Persian time only
 * @param date - Gregorian date
 * @returns Formatted Persian time
 */
export function formatPersianTime(date: Date | string): string {
  return toPersianDate(date, 'HH:mm');
}

/**
 * Get Persian month and year
 * @param date - Gregorian date
 * @returns Persian month and year
 */
export function getPersianMonthYear(date: Date | string): string {
  return toPersianDate(date, 'jMMMM jYYYY');
}

/**
 * Get Persian day and month
 * @param date - Gregorian date
 * @returns Persian day and month
 */
export function getPersianDayMonth(date: Date | string): string {
  return toPersianDate(date, 'jDD jMMMM');
}

/**
 * Convert Persian date string to Gregorian Date
 * @param persianDate - Persian date string (e.g., '1403/06/15')
 * @returns Gregorian Date object
 */
export function fromPersianDate(persianDate: string): Date {
  try {
    if (!persianDate) return new Date();
    
    return moment(persianDate, 'jYYYY/jMM/jDD').toDate();
  } catch (error) {
    console.error('Error converting from Persian date:', error);
    return new Date();
  }
}

/**
 * Get current Persian date
 * @returns Current Persian date string
 */
export function getCurrentPersianDate(): string {
  return toPersianDate(new Date());
}

/**
 * Get Persian date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Persian date range string
 */
export function getPersianDateRange(startDate: Date | string, endDate: Date | string): string {
  const start = toPersianDate(startDate, 'jDD jMMMM');
  const end = toPersianDate(endDate, 'jDD jMMMM');
  return `${start} - ${end}`;
}

/**
 * Check if date is today in Persian calendar
 * @param date - Date to check
 * @returns True if today
 */
export function isPersianToday(date: Date | string): boolean {
  try {
    if (!date) return false;
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return false;
    
    const today = moment();
    const checkDate = moment(dateObj);
    
    return today.format('jYYYY/jMM/jDD') === checkDate.format('jYYYY/jMM/jDD');
  } catch (error) {
    console.error('Error checking Persian today:', error);
    return false;
  }
}

/**
 * Get Persian week day names
 */
export const persianWeekDays = [
  'شنبه',
  'یکشنبه', 
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه'
];

/**
 * Get Persian month names
 */
export const persianMonths = [
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
  'اسفند'
];
