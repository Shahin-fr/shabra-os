import { format as formatJalali } from "date-fns-jalali";

// Persian month names
export const persianMonths = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
];

// Persian day names
export const persianDays = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];

// Persian day names short
export const persianWeekdaysShort = ["ی", "د", "س", "چ", "پ", "ج", "ش"];

/**
 * Format date to Jalali format without extra "j" characters
 * @param date - Date to format
 * @param format - Format string (e.g., 'yyyy/MM/dd', 'MM/dd', 'yyyy')
 * @returns Formatted Jalali date string
 */
export function formatJalaliDate(date: Date, format: string = 'yyyy/MM/dd'): string {
  return formatJalali(date, format);
}

/**
 * Get Persian month name from date
 * @param date - Date to get month name for
 * @returns Persian month name
 */
export function getPersianMonthName(date: Date): string {
  const monthIndex = formatJalali(date, 'M') - 1; // date-fns-jalali returns 1-based month
  return persianMonths[monthIndex];
}

/**
 * Get Persian day name from date
 * @param date - Date to get day name for
 * @returns Persian day name
 */
export function getPersianDayName(date: Date): string {
  const dayIndex = formatJalali(date, 'E') - 1; // date-fns-jalali returns 1-based day
  return persianDays[dayIndex];
}

/**
 * Format date to Jalali month and year (e.g., "مرداد ۱۴۰۴")
 * @param date - Date to format
 * @returns Formatted Jalali month and year
 */
export function formatJalaliMonthYear(date: Date): string {
  const monthName = getPersianMonthName(date);
  const year = formatJalali(date, 'yyyy');
  return `${monthName} ${year}`;
}

/**
 * Format date to Jalali day and month (e.g., "۱۵ مرداد")
 * @param date - Date to format
 * @returns Formatted Jalali day and month
 */
export function formatJalaliDayMonth(date: Date): string {
  const day = formatJalali(date, 'd');
  const monthName = getPersianMonthName(date);
  return `${day} ${monthName}`;
}

/**
 * Format date to Jalali short format (e.g., "۱۵/۶")
 * @param date - Date to format
 * @returns Formatted Jalali short date
 */
export function formatJalaliShort(date: Date): string {
  return formatJalali(date, 'M/d');
}

/**
 * Format date to Jalali full format (e.g., "۱۵/۶/۱۴۰۴")
 * @param date - Date to format
 * @returns Formatted Jalali full date
 */
export function formatJalaliFull(date: Date): string {
  return formatJalali(date, 'yyyy/M/d');
}
