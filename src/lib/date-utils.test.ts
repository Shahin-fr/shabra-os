import { describe, it, expect } from 'vitest';

import {
  formatJalaliDate,
  getPersianMonthName,
  getPersianDayName,
  formatJalaliMonthYear,
  formatJalaliDayMonth,
  formatJalaliShort,
  formatJalaliFull,
} from './date-utils';

describe('Date Utils - Defensive Coding', () => {
  const validDate = new Date('2024-01-15T10:30:00Z');
  const validDateString = '2024-01-15T10:30:00Z';
  // Use a date that's known to work well with Jalali calendar
  const jalaliCompatibleDate = new Date('2024-06-15T10:30:00Z');

  describe('formatJalaliDate', () => {
    it('should format valid Date objects', () => {
      const result = formatJalaliDate(validDate);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).not.toBe('--');
    });

    it('should format valid date strings', () => {
      const result = formatJalaliDate(validDateString);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).not.toBe('--');
    });

    it('should handle null dates gracefully', () => {
      const result = formatJalaliDate(null);
      expect(result).toBe('--');
    });

    it('should handle undefined dates gracefully', () => {
      const result = formatJalaliDate(undefined);
      expect(result).toBe('--');
    });

    it('should handle invalid date strings gracefully', () => {
      const result = formatJalaliDate('invalid-date-string');
      expect(result).toBe('--');
    });

    it('should handle invalid Date objects gracefully', () => {
      const invalidDate = new Date('invalid');
      const result = formatJalaliDate(invalidDate);
      expect(result).toBe('--');
    });

    it('should use custom format when provided', () => {
      const result = formatJalaliDate(validDate, 'yyyy');
      expect(result).toBeTruthy();
      expect(result).not.toBe('--');
    });
  });

  describe('getPersianMonthName', () => {
    it('should return month name for valid dates', () => {
      const result = getPersianMonthName(validDate);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).not.toBe('--');
    });

    it('should handle null dates gracefully', () => {
      const result = getPersianMonthName(null);
      expect(result).toBe('--');
    });

    it('should handle undefined dates gracefully', () => {
      const result = getPersianMonthName(undefined);
      expect(result).toBe('--');
    });

    it('should handle invalid dates gracefully', () => {
      const result = getPersianMonthName('invalid-date');
      expect(result).toBe('--');
    });
  });

  describe('getPersianDayName', () => {
    it('should return day name for valid dates', () => {
      const result = getPersianDayName(jalaliCompatibleDate);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).not.toBe('--');
    });

    it('should handle null dates gracefully', () => {
      const result = getPersianDayName(null);
      expect(result).toBe('--');
    });

    it('should handle undefined dates gracefully', () => {
      const result = getPersianDayName(undefined);
      expect(result).toBe('--');
    });

    it('should handle invalid dates gracefully', () => {
      const result = getPersianDayName('invalid-date');
      expect(result).toBe('--');
    });
  });

  describe('formatJalaliMonthYear', () => {
    it('should format month and year for valid dates', () => {
      const result = formatJalaliMonthYear(validDate);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).not.toBe('--');
    });

    it('should handle null dates gracefully', () => {
      const result = formatJalaliMonthYear(null);
      expect(result).toBe('--');
    });

    it('should handle undefined dates gracefully', () => {
      const result = formatJalaliMonthYear(undefined);
      expect(result).toBe('--');
    });

    it('should handle invalid dates gracefully', () => {
      const result = formatJalaliMonthYear('invalid-date');
      expect(result).toBe('--');
    });
  });

  describe('formatJalaliDayMonth', () => {
    it('should format day and month for valid dates', () => {
      const result = formatJalaliDayMonth(validDate);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).not.toBe('--');
    });

    it('should handle null dates gracefully', () => {
      const result = formatJalaliDayMonth(null);
      expect(result).toBe('--');
    });

    it('should handle undefined dates gracefully', () => {
      const result = formatJalaliDayMonth(undefined);
      expect(result).toBe('--');
    });

    it('should handle invalid dates gracefully', () => {
      const result = formatJalaliDayMonth('invalid-date');
      expect(result).toBe('--');
    });
  });

  describe('formatJalaliShort', () => {
    it('should format short date for valid dates', () => {
      const result = formatJalaliShort(validDate);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).not.toBe('--');
    });

    it('should handle null dates gracefully', () => {
      const result = formatJalaliShort(null);
      expect(result).toBe('--');
    });

    it('should handle undefined dates gracefully', () => {
      const result = formatJalaliShort(undefined);
      expect(result).toBe('--');
    });

    it('should handle invalid dates gracefully', () => {
      const result = formatJalaliShort('invalid-date');
      expect(result).toBe('--');
    });
  });

  describe('formatJalaliFull', () => {
    it('should format full date for valid dates', () => {
      const result = formatJalaliFull(validDate);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).not.toBe('--');
    });

    it('should handle null dates gracefully', () => {
      const result = formatJalaliFull(null);
      expect(result).toBe('--');
    });

    it('should handle undefined dates gracefully', () => {
      const result = formatJalaliFull(undefined);
      expect(result).toBe('--');
    });

    it('should handle invalid dates gracefully', () => {
      const result = formatJalaliFull('invalid-date');
      expect(result).toBe('--');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string dates', () => {
      expect(formatJalaliDate('')).toBe('--');
      expect(getPersianMonthName('')).toBe('--');
      expect(getPersianDayName('')).toBe('--');
    });

    it('should handle whitespace-only string dates', () => {
      expect(formatJalaliDate('   ')).toBe('--');
      expect(getPersianMonthName('   ')).toBe('--');
      expect(getPersianDayName('   ')).toBe('--');
    });

    it('should handle very old dates', () => {
      const oldDate = new Date('1900-01-01');
      const result = formatJalaliDate(oldDate);
      expect(result).toBeTruthy();
      expect(result).not.toBe('--');
    });

    it('should handle future dates', () => {
      const futureDate = new Date('2030-12-31');
      const result = formatJalaliDate(futureDate);
      expect(result).toBeTruthy();
      expect(result).not.toBe('--');
    });
  });
});
