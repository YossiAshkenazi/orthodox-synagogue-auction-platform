/**
 * Hebrew Calendar Date Conversion Utilities
 * Handles conversion between Gregorian and Hebrew calendar dates
 */

import { HDate, HebrewCalendar, months } from '@hebcal/hdate';
import { format, parseISO } from 'date-fns';
import { HebrewDate, EnhancedHebrewDate, ConversionResult, HebrewCalendarError, ErrorCode } from '../types/index.js';

/**
 * Hebrew month names with proper nikud
 */
export const HEBREW_MONTHS: Record<number, { name: string; nameEnglish: string }> = {
  1: { name: 'תִּשְׁרֵי', nameEnglish: 'Tishrei' },
  2: { name: 'מַרְחֶשְׁוָן', nameEnglish: 'Marcheshvan' },
  3: { name: 'כִּסְלֵו', nameEnglish: 'Kislev' },
  4: { name: 'טֵבֵת', nameEnglish: 'Tevet' },
  5: { name: 'שְׁבָט', nameEnglish: 'Shevat' },
  6: { name: 'אֲדָר', nameEnglish: 'Adar' },
  7: { name: 'נִיסָן', nameEnglish: 'Nissan' },
  8: { name: 'אִיָּר', nameEnglish: 'Iyar' },
  9: { name: 'סִיוָן', nameEnglish: 'Sivan' },
  10: { name: 'תַּמּוּז', nameEnglish: 'Tammuz' },
  11: { name: 'אָב', nameEnglish: 'Av' },
  12: { name: 'אֱלוּל', nameEnglish: 'Elul' },
  13: { name: 'אֲדָר ב׳', nameEnglish: 'Adar II' }
};

/**
 * Hebrew day names
 */
export const HEBREW_DAYS: Record<number, string> = {
  0: 'רִאשׁוֹן',    // Sunday
  1: 'שֵׁנִי',      // Monday  
  2: 'שְׁלִישִׁי',   // Tuesday
  3: 'רְבִיעִי',    // Wednesday
  4: 'חֲמִישִׁי',    // Thursday
  5: 'שִׁשִּׁי',     // Friday
  6: 'שַׁבָּת'       // Saturday
};

/**
 * Hebrew numerals with geresh marks for dates
 */
export function toHebrewNumeral(num: number): string {
  const ones = ['', 'א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ז׳', 'ח׳', 'ט׳'];
  const teens = ['י׳', 'י״א', 'י״ב', 'י״ג', 'י״ד', 'ט״ו', 'ט״ז', 'י״ז', 'י״ח', 'י״ט'];
  const tens = ['', '', 'כ׳', 'ל׳', 'מ׳', 'נ׳', 'ס׳', 'ע׳', 'פ׳', 'צ׳'];
  const hundreds = ['', 'ק׳', 'ר׳', 'ש׳', 'ת׳', 'תק׳', 'תר׳', 'תש׳', 'תת׳', 'תתק׳'];

  if (num === 15) return 'ט״ו';  // Special case to avoid yud-heh (God's name)
  if (num === 16) return 'ט״ז';  // Special case to avoid yud-vav (God's name)
  
  if (num < 1 || num > 999) {
    throw new HebrewCalendarError(
      `Number ${num} is out of range for Hebrew numeral conversion`,
      ErrorCode.CALCULATION_ERROR
    );
  }

  let result = '';
  
  if (num >= 100) {
    result += hundreds[Math.floor(num / 100)];
    num %= 100;
  }
  
  if (num >= 20) {
    result += tens[Math.floor(num / 10)];
    num %= 10;
    if (num > 0) {
      result = result.slice(0, -1) + '״' + ones[num];
    }
  } else if (num >= 10) {
    result += teens[num - 10];
  } else if (num > 0) {
    result += ones[num];
  }
  
  return result;
}

/**
 * Format Hebrew year with proper geresh marks
 */
export function formatHebrewYear(year: number): string {
  // Hebrew years are typically displayed with thousands omitted
  // e.g., 5784 becomes תשפ״ד
  const displayYear = year % 1000;
  return toHebrewNumeral(displayYear);
}

/**
 * Convert Gregorian date to Hebrew date
 */
export function gregorianToHebrew(date: Date): ConversionResult {
  try {
    const hDate = new HDate(date);
    
    const hebrewYear = hDate.getFullYear();
    const hebrewMonth = hDate.getMonth();
    const hebrewDay = hDate.getDate();
    
    const monthInfo = HEBREW_MONTHS[hebrewMonth];
    if (!monthInfo) {
      throw new HebrewCalendarError(
        `Invalid Hebrew month: ${hebrewMonth}`,
        ErrorCode.CALCULATION_ERROR
      );
    }

    // Format Hebrew date string (e.g., "כ״ח אלול תשפ״ה")
    const dayStr = toHebrewNumeral(hebrewDay);
    const yearStr = formatHebrewYear(hebrewYear);
    const hebrewDateString = `${dayStr} ${monthInfo.name} ${yearStr}`;

    const hebrewDate: HebrewDate = {
      hebrewDateString,
      hebrewYear,
      hebrewMonth: monthInfo.name,
      hebrewMonthName: monthInfo.name,
      hebrewDay,
      gregorianDate: date
    };

    return {
      success: true,
      hebrewDate
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error converting date',
      warnings: []
    };
  }
}

/**
 * Convert Hebrew date to Gregorian date
 */
export function hebrewToGregorian(
  hebrewDay: number, 
  hebrewMonth: number, 
  hebrewYear: number
): ConversionResult {
  try {
    const hDate = new HDate(hebrewDay, hebrewMonth, hebrewYear);
    const gregorianDate = hDate.greg();
    
    const monthInfo = HEBREW_MONTHS[hebrewMonth];
    if (!monthInfo) {
      throw new HebrewCalendarError(
        `Invalid Hebrew month: ${hebrewMonth}`,
        ErrorCode.CALCULATION_ERROR
      );
    }

    const dayStr = toHebrewNumeral(hebrewDay);
    const yearStr = formatHebrewYear(hebrewYear);
    const hebrewDateString = `${dayStr} ${monthInfo.name} ${yearStr}`;

    const hebrewDate: HebrewDate = {
      hebrewDateString,
      hebrewYear,
      hebrewMonth: monthInfo.name,
      hebrewMonthName: monthInfo.name,
      hebrewDay,
      gregorianDate
    };

    return {
      success: true,
      hebrewDate,
      gregorianDate
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error converting Hebrew date',
      warnings: []
    };
  }
}

/**
 * Get enhanced Hebrew date with additional calendar information
 */
export function getEnhancedHebrewDate(date: Date): EnhancedHebrewDate {
  const conversionResult = gregorianToHebrew(date);
  
  if (!conversionResult.success || !conversionResult.hebrewDate) {
    throw new HebrewCalendarError(
      `Failed to convert date: ${conversionResult.error}`,
      ErrorCode.CONVERSION_ERROR
    );
  }

  const hDate = new HDate(date);
  const baseHebrewDate = conversionResult.hebrewDate;
  
  // Get day of week information
  const dayOfWeek = date.getDay();
  const dayOfWeekHebrew = HEBREW_DAYS[dayOfWeek];

  // Check for special days
  const isShabbat = dayOfWeek === 6;
  const isRoshChodesh = hDate.getDate() === 1 || hDate.getDate() === 30;
  
  // TODO: Implement holiday detection, parsha detection, etc.
  // This would require integration with @hebcal/core for full functionality
  
  const enhanced: EnhancedHebrewDate = {
    ...baseHebrewDate,
    isShabbat,
    isYomTov: false,        // Will be populated by holiday service
    isRoshChodesh,
    isCholedMoed: false,    // Will be populated by holiday service
    isFastDay: false,       // Will be populated by holiday service
    dayOfWeek,
    dayOfWeekHebrew,
    parsha: null,           // Will be populated by parsha service
    parshaHebrew: null      // Will be populated by parsha service
  };

  return enhanced;
}

/**
 * Check if a given year is a Hebrew leap year
 */
export function isHebrewLeapYear(hebrewYear: number): boolean {
  return HebrewCalendar.isLeapYear(hebrewYear);
}

/**
 * Get number of days in a Hebrew month
 */
export function getDaysInHebrewMonth(hebrewMonth: number, hebrewYear: number): number {
  return HebrewCalendar.daysInMonth(hebrewMonth, hebrewYear);
}

/**
 * Validate Hebrew date
 */
export function isValidHebrewDate(day: number, month: number, year: number): boolean {
  try {
    if (day < 1 || month < 1 || month > 13 || year < 1) {
      return false;
    }
    
    // Check if month exists in this year (Adar II only in leap years)
    if (month === 13 && !isHebrewLeapYear(year)) {
      return false;
    }
    
    const daysInMonth = getDaysInHebrewMonth(month, year);
    return day <= daysInMonth;
  } catch {
    return false;
  }
}

/**
 * Get current Hebrew date
 */
export function getCurrentHebrewDate(): EnhancedHebrewDate {
  return getEnhancedHebrewDate(new Date());
}

/**
 * Parse Hebrew date string and convert to Date object
 * Expects format like "כ״ח אלול תשפ״ה"
 */
export function parseHebrewDateString(hebrewDateString: string): ConversionResult {
  try {
    // This is a simplified parser - a full implementation would need
    // comprehensive Hebrew text parsing
    // For now, we'll implement basic parsing logic
    
    const parts = hebrewDateString.trim().split(' ');
    if (parts.length !== 3) {
      throw new HebrewCalendarError(
        'Invalid Hebrew date format. Expected format: "day month year"',
        ErrorCode.INVALID_DATE
      );
    }
    
    // TODO: Implement full Hebrew numeral parsing
    // For now, return an error indicating this needs implementation
    return {
      success: false,
      error: 'Hebrew date string parsing not yet implemented',
      warnings: ['Use numeric Hebrew date conversion methods instead']
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error'
    };
  }
}