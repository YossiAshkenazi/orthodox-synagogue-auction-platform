/**
 * Hebrew Calendar Service - Main Export
 * Orthodox Synagogue Auction Platform
 */

// Main service class
export { HebrewCalendarService } from './services/HebrewCalendarService.js';

// Type definitions
export type {
  HebrewDate,
  EnhancedHebrewDate,
  HebrewHoliday,
  Zmanim,
  AuctionRestrictions,
  TimeRestriction,
  GematriaCalculation,
  GematriaMultiplier,
  Location,
  HebrewCalendarConfig,
  ConversionResult,
  HebrewMonth
} from './types/index.js';

// Enums
export {
  HolidayType,
  ObservanceLevel,
  GematriaMethod,
  Season,
  ErrorCode
} from './types/index.js';

// Utility functions
export {
  gregorianToHebrew,
  hebrewToGregorian,
  getEnhancedHebrewDate,
  getCurrentHebrewDate,
  isHebrewLeapYear,
  getDaysInHebrewMonth,
  isValidHebrewDate,
  parseHebrewDateString,
  toHebrewNumeral,
  formatHebrewYear,
  HEBREW_MONTHS,
  HEBREW_DAYS
} from './utils/date-conversion.js';

export {
  calculateGematria,
  getSuggestedMultipliers,
  findWordsByValue,
  calculateAllMethods,
  isValidHebrewText,
  COMMON_MULTIPLIERS
} from './utils/gematria.js';

// Error class
export { HebrewCalendarError } from './types/index.js';

// Default configuration factory
export function createDefaultConfig(location: Location): HebrewCalendarConfig {
  return {
    defaultLocation: location,
    cacheEnabled: true,
    cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
    includeModernHolidays: true,
    includeFastDays: true,
    includeRoshChodesh: true,
    strictHalachicTimes: true,
    customHolidays: []
  };
}

// Common locations for Orthodox communities
export const COMMON_LOCATIONS: Record<string, Location> = {
  JERUSALEM: {
    name: 'Jerusalem',
    nameHebrew: 'ירושלים',
    latitude: 31.7683,
    longitude: 35.2137,
    timezone: 'Asia/Jerusalem',
    elevation: 754,
    country: 'Israel',
    region: 'Jerusalem District'
  },
  TEL_AVIV: {
    name: 'Tel Aviv',
    nameHebrew: 'תל אביב',
    latitude: 32.0853,
    longitude: 34.7818,
    timezone: 'Asia/Jerusalem',
    elevation: 37,
    country: 'Israel',
    region: 'Tel Aviv District'
  },
  NEW_YORK: {
    name: 'New York',
    nameHebrew: 'ניו יורק',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York',
    elevation: 57,
    country: 'United States',
    region: 'New York'
  },
  LONDON: {
    name: 'London',
    nameHebrew: 'לונדון',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
    elevation: 35,
    country: 'United Kingdom',
    region: 'England'
  },
  MONTREAL: {
    name: 'Montreal',
    nameHebrew: 'מונטריאול',
    latitude: 45.5017,
    longitude: -73.5673,
    timezone: 'America/Montreal',
    elevation: 233,
    country: 'Canada',
    region: 'Quebec'
  },
  LOS_ANGELES: {
    name: 'Los Angeles',
    nameHebrew: 'לוס אנג׳לס',
    latitude: 34.0522,
    longitude: -118.2437,
    timezone: 'America/Los_Angeles',
    elevation: 71,
    country: 'United States',
    region: 'California'
  }
};

// Quick service factory for common use cases
export function createHebrewCalendarService(
  locationKey: keyof typeof COMMON_LOCATIONS = 'NEW_YORK'
): HebrewCalendarService {
  const location = COMMON_LOCATIONS[locationKey];
  const config = createDefaultConfig(location);
  return new HebrewCalendarService(config);
}

// Version information
export const VERSION = '0.1.0';