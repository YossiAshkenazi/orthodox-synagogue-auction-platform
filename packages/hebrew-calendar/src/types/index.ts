/**
 * Type definitions for Hebrew Calendar Service
 * Supporting bilingual Orthodox synagogue auction platform
 */

// Base Hebrew date representation
export interface HebrewDate {
  hebrewDateString: string;  // e.g., "כ״ח אלול תשפ״ה"
  hebrewYear: number;        // Hebrew year (5784, 5785, etc.)
  hebrewMonth: string;       // Hebrew month name (תשרי, חשון, etc.)
  hebrewMonthName: string;   // Full month name with proper nikud
  hebrewDay: number;         // Hebrew day number (1-30)
  gregorianDate: Date;       // Corresponding Gregorian date
}

// Extended Hebrew date with calendar information
export interface EnhancedHebrewDate extends HebrewDate {
  isShabbat: boolean;
  isYomTov: boolean;        // Major holiday
  isRoshChodesh: boolean;   // New month
  isCholedMoed: boolean;    // Intermediate days of holidays
  isFastDay: boolean;
  dayOfWeek: number;        // 0 = Sunday, 6 = Saturday
  dayOfWeekHebrew: string;  // Hebrew day name
  parsha: string | null;    // Torah portion name
  parshaHebrew: string | null; // Hebrew Torah portion name
}

// Holiday information
export interface HebrewHoliday {
  name: string;             // English name
  nameHebrew: string;       // Hebrew name
  startDate: HebrewDate;
  endDate?: HebrewDate;     // For multi-day holidays
  type: HolidayType;
  observanceLevel: ObservanceLevel;
  description?: string;
  descriptionHebrew?: string;
  auctionRestrictions: AuctionRestrictions;
}

export enum HolidayType {
  BIBLICAL = 'biblical',
  RABBINIC = 'rabbinic',
  MODERN = 'modern',
  FAST_DAY = 'fast_day',
  ROSH_CHODESH = 'rosh_chodesh',
  SHABBAT = 'shabbat'
}

export enum ObservanceLevel {
  NONE = 'none',
  MINOR = 'minor',
  MAJOR = 'major',
  YOM_TOV = 'yom_tov',
  DEORAITA = 'deoraita'    // Biblical commandment
}

// Zmanim (religious times) for auction compliance
export interface Zmanim {
  location: string;
  timezone: string;
  date: Date;
  alotHaShachar: Date;      // Dawn
  misheyakir: Date;         // Earliest prayer time
  sunrise: Date;
  sofZmanShma: Date;        // Latest Shema
  sofZmanTfilla: Date;      // Latest morning prayer
  chatzot: Date;            // Midday
  minchaGedola: Date;       // Earliest afternoon prayer
  minchaKetana: Date;       // Preferred afternoon prayer
  plagHaMincha: Date;       // Late afternoon
  sunset: Date;
  tzait: Date;              // Nightfall (3 stars)
  tzait72: Date;            // 72-minute nightfall
  chatzotLayla: Date;       // Midnight
}

// Auction restrictions based on Jewish law
export interface AuctionRestrictions {
  noAuctions: boolean;                    // Completely prohibited
  restrictedHours: TimeRestriction[];     // Specific time restrictions
  specialConsiderations: string;          // Additional notes in English
  specialConsiderationsHebrew: string;    // Additional notes in Hebrew
  overrideAllowed: boolean;               // Can gabbai override?
  emergencyOnly: boolean;                 // Only for urgent synagogue needs
}

export interface TimeRestriction {
  startTime: string;        // Time in format "HH:MM" or zman name
  endTime: string;          // Time in format "HH:MM" or zman name
  description: string;      // English description
  descriptionHebrew: string; // Hebrew description
}

// Gematria (Hebrew numerology) support
export interface GematriaCalculation {
  originalText: string;     // Hebrew text
  value: number;           // Numerical value
  method: GematriaMethod;  // Calculation method
  significance?: string;    // Meaning/significance
  commonMultipliers: GematriaMultiplier[];
}

export enum GematriaMethod {
  STANDARD = 'standard',    // Standard gematria (א=1, ב=2, etc.)
  SMALL = 'small',         // Small gematria (reduce to single digits)
  LARGE = 'large',         // Large gematria (final letters get higher values)
  ORDINAL = 'ordinal',     // Ordinal values
  REDUCED = 'reduced'      // Sum digits until single digit
}

export interface GematriaMultiplier {
  nameEnglish: string;     // e.g., "Chai" (18)
  nameHebrew: string;      // e.g., "חי"
  value: number;           // Multiplier value
  significance: string;    // Why this multiplier is meaningful
  commonUse: boolean;      // Is this commonly used in auctions?
}

// Location data for zmanim calculations
export interface Location {
  name: string;
  nameHebrew: string;
  latitude: number;
  longitude: number;
  timezone: string;
  elevation?: number;      // In meters above sea level
  country: string;
  region?: string;
}

// Hebrew calendar conversion utilities
export interface ConversionResult {
  success: boolean;
  hebrewDate?: HebrewDate;
  gregorianDate?: Date;
  error?: string;
  warnings?: string[];
}

// Hebrew month information
export interface HebrewMonth {
  name: string;            // Hebrew name (תשרי, חשון, etc.)
  nameEnglish: string;     // English transliteration
  number: number;          // Month number (1-12/13)
  daysInMonth: number;     // 29 or 30 days
  isLeapMonth: boolean;    // For Adar II
  season: Season;
  holidays: string[];      // Major holidays in this month
}

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer', 
  FALL = 'fall',
  WINTER = 'winter'
}

// API response types for external Hebrew calendar services
export interface HebcalEvent {
  title: string;
  titleHebrew?: string;
  date: string;            // ISO date string
  category: string;
  subcat?: string;
  hebrew?: string;
  memo?: string;
  yomtov?: boolean;
  chag?: boolean;
}

// Configuration for Hebrew calendar service
export interface HebrewCalendarConfig {
  defaultLocation: Location;
  hebcalApiKey?: string;
  cacheEnabled: boolean;
  cacheTTL: number;        // Cache time-to-live in milliseconds
  includeModernHolidays: boolean;
  includeFastDays: boolean;
  includeRoshChodesh: boolean;
  strictHalachicTimes: boolean;   // Use strict halachic zmanim calculations
  customHolidays: HebrewHoliday[]; // Synagogue-specific holidays
}

// Error types
export class HebrewCalendarError extends Error {
  constructor(
    message: string, 
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'HebrewCalendarError';
  }
}

export enum ErrorCode {
  INVALID_DATE = 'INVALID_DATE',
  INVALID_LOCATION = 'INVALID_LOCATION', 
  API_ERROR = 'API_ERROR',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}