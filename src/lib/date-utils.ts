import { format as formatJalali } from 'date-fns-jalali';

import { logger } from '@/lib/logger';

// Persian month names
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
  'اسفند',
];

// Persian day names
export const persianDays = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
];

// Persian day names short
export const persianWeekdaysShort = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];

/**
 * Format date to Jalali format without extra "j" characters
 * @param date - Date to format
 * @param format - Format string (e.g., 'yyyy/MM/dd', 'MM/dd', 'yyyy')
 * @returns Formatted Jalali date string or '--' if invalid
 */
export function formatJalaliDate(
  date: Date | string | null | undefined,
  format: string = 'yyyy/MM/dd'
): string {
  try {
    // Handle null/undefined dates
    if (!date) {
      return '--';
    }

    // Convert string to Date if needed
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Validate the date
    if (isNaN(dateObj.getTime())) {
      logger.warn('Invalid date passed to formatJalaliDate:', { date });
      return '--';
    }

    // Format the valid date
    return formatJalali(dateObj, format);
  } catch (error) {
    logger.error('Error formatting Jalali date:', error as Error, { date });
    return '--';
  }
}

/**
 * Get Persian month name from date
 * @param date - Date to get month name for
 * @returns Persian month name or '--' if invalid
 */
export function getPersianMonthName(
  date: Date | string | null | undefined
): string {
  try {
    if (!date) return '--';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '--';

    const monthIndex = parseInt(formatJalali(dateObj, 'M')) - 1;
    return persianMonths[monthIndex] || '--';
  } catch (error) {
    logger.error('Error getting Persian month name:', error as Error, { date });
    return '--';
  }
}

/**
 * Get Persian day name from date
 * @param date - Date to get day name for
 * @returns Persian day name or '--' if invalid
 */
export function getPersianDayName(
  date: Date | string | null | undefined
): string {
  try {
    if (!date) return '--';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '--';

    // Get the day of week (0-6, where 0 is Sunday)
    const dayOfWeek = dateObj.getDay();

    // Map JavaScript day of week to Persian day names
    // JavaScript: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
    // Persian: 0=شنبه, 1=یکشنبه, 2=دوشنبه, 3=سه‌شنبه, 4=چهارشنبه, 5=پنج‌شنبه, 6=جمعه
    const persianDayIndex = (dayOfWeek + 1) % 7; // Adjust for Persian week starting on Saturday

    return persianDays[persianDayIndex] || '--';
  } catch (error) {
    logger.error('Error getting Persian day name:', error as Error, { date });
    return '--';
  }
}

/**
 * Format date to Jalali month and year (e.g., "مرداد ۱۴۰۴")
 * @param date - Date to format
 * @returns Formatted Jalali month and year or '--' if invalid
 */
export function formatJalaliMonthYear(
  date: Date | string | null | undefined
): string {
  try {
    if (!date) return '--';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '--';

    const monthName = getPersianMonthName(dateObj);
    const year = formatJalali(dateObj, 'yyyy');
    return monthName !== '--' ? `${monthName} ${year}` : '--';
  } catch (error) {
    logger.error('Error formatting Jalali month year:', error as Error, {
      date,
    });
    return '--';
  }
}

/**
 * Format date to Jalali day and month (e.g., "۱۵ مرداد")
 * @param date - Date to format
 * @returns Formatted Jalali day and month or '--' if invalid
 */
export function formatJalaliDayMonth(
  date: Date | string | null | undefined
): string {
  try {
    if (!date) return '--';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '--';

    const day = formatJalali(dateObj, 'd');
    const monthName = getPersianMonthName(dateObj);
    return monthName !== '--' ? `${day} ${monthName}` : '--';
  } catch (error) {
    logger.error('Error formatting Jalali day month:', error as Error, {
      date,
    });
    return '--';
  }
}

/**
 * Format date to Jalali short format (e.g., "۱۵/۶")
 * @param date - Date to format
 * @returns Formatted Jalali short date or '--' if invalid
 */
export function formatJalaliShort(
  date: Date | string | null | undefined
): string {
  try {
    if (!date) return '--';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '--';

    return formatJalali(dateObj, 'M/d');
  } catch (error) {
    logger.error('Error formatting Jalali short date:', error as Error, {
      date,
    });
    return '--';
  }
}

/**
 * Format date to Jalali full format (e.g., "۱۵/۶/۱۴۰۴")
 * @param date - Date to format
 * @returns Formatted Jalali full date or '--' if invalid
 */
export function formatJalaliFull(
  date: Date | string | null | undefined
): string {
  try {
    if (!date) return '--';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '--';

    return formatJalali(dateObj, 'yyyy/M/d');
  } catch (error) {
    logger.error('Error formatting Jalali full date:', error as Error, {
      date,
    });
    return '--';
  }
}
