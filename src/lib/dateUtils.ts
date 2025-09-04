import { format } from 'date-fns-jalali';
import { faIR } from 'date-fns-jalali/locale';

/**
 * Formats a date to Jalali (Shamsi) format
 * @param date - The date to format
 * @returns Formatted Jalali date string (e.g., '۲۷ شهریور ۱۴۰۴')
 */
export function formatJalaliDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  try {
    return format(dateObj, 'd MMMM yyyy', { locale: faIR });
  } catch (error) {
    console.error('Error formatting Jalali date:', error);
    return 'تاریخ نامعتبر';
  }
}

/**
 * Formats a date to Jalali short format
 * @param date - The date to format
 * @returns Formatted Jalali date string (e.g., '۲۷/۰۶/۱۴۰۴')
 */
export function formatJalaliDateShort(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  try {
    return format(dateObj, 'yyyy/MM/dd', { locale: faIR });
  } catch (error) {
    console.error('Error formatting Jalali date short:', error);
    return 'تاریخ نامعتبر';
  }
}

/**
 * Gets relative time in Persian
 * @param date - The date to compare
 * @returns Relative time string in Persian
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'امروز';
  } else if (diffInDays === 1) {
    return 'دیروز';
  } else if (diffInDays < 7) {
    return `${diffInDays} روز پیش`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} هفته پیش`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} ماه پیش`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} سال پیش`;
  }
}
