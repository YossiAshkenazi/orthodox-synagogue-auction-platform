/**
 * Main Hebrew Calendar Service
 * Orchestrates all Hebrew calendar functionality for the auction platform
 */

import { HDate, HebrewCalendar, Location as HebcalLocation } from '@hebcal/core';
import { Zmanim as HebcalZmanim } from '@hebcal/zmanim';
import { 
  HebrewDate, 
  EnhancedHebrewDate, 
  HebrewCalendarConfig, 
  Location, 
  Zmanim,
  AuctionRestrictions,
  HebrewHoliday,
  HolidayType,
  ObservanceLevel,
  TimeRestriction,
  HebrewCalendarError,
  ErrorCode
} from '../types/index.js';
import { 
  gregorianToHebrew, 
  hebrewToGregorian, 
  getEnhancedHebrewDate,
  getCurrentHebrewDate,
  isHebrewLeapYear,
  getDaysInHebrewMonth
} from '../utils/date-conversion.js';
import { calculateGematria, getSuggestedMultipliers, COMMON_MULTIPLIERS } from '../utils/gematria.js';

/**
 * Main Hebrew Calendar Service Class
 */
export class HebrewCalendarService {
  private config: HebrewCalendarConfig;
  private cache: Map<string, any> = new Map();

  constructor(config: HebrewCalendarConfig) {
    this.config = config;
    this.validateConfig();
  }

  /**
   * Validate service configuration
   */
  private validateConfig(): void {
    if (!this.config.defaultLocation) {
      throw new HebrewCalendarError(
        'Default location is required',
        ErrorCode.CONFIGURATION_ERROR
      );
    }

    if (!this.config.defaultLocation.latitude || !this.config.defaultLocation.longitude) {
      throw new HebrewCalendarError(
        'Location must have valid latitude and longitude',
        ErrorCode.INVALID_LOCATION
      );
    }

    if (!this.config.defaultLocation.timezone) {
      throw new HebrewCalendarError(
        'Location must specify timezone',
        ErrorCode.INVALID_LOCATION
      );
    }
  }

  /**
   * Convert Gregorian date to Hebrew date
   */
  public gregorianToHebrew(date: Date): HebrewDate {
    const cacheKey = `greg_to_heb_${date.toISOString()}`;
    
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = gregorianToHebrew(date);
    if (!result.success || !result.hebrewDate) {
      throw new HebrewCalendarError(
        result.error || 'Failed to convert Gregorian date',
        ErrorCode.CALCULATION_ERROR
      );
    }

    if (this.config.cacheEnabled) {
      this.cache.set(cacheKey, result.hebrewDate);
      // Set cache expiration
      setTimeout(() => this.cache.delete(cacheKey), this.config.cacheTTL);
    }

    return result.hebrewDate;
  }

  /**
   * Convert Hebrew date to Gregorian date
   */
  public hebrewToGregorian(day: number, month: number, year: number): Date {
    const cacheKey = `heb_to_greg_${day}_${month}_${year}`;
    
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = hebrewToGregorian(day, month, year);
    if (!result.success || !result.gregorianDate) {
      throw new HebrewCalendarError(
        result.error || 'Failed to convert Hebrew date',
        ErrorCode.CALCULATION_ERROR
      );
    }

    if (this.config.cacheEnabled) {
      this.cache.set(cacheKey, result.gregorianDate);
      setTimeout(() => this.cache.delete(cacheKey), this.config.cacheTTL);
    }

    return result.gregorianDate;
  }

  /**
   * Get enhanced Hebrew date with full calendar information
   */
  public getEnhancedDate(date: Date): EnhancedHebrewDate {
    const cacheKey = `enhanced_${date.toISOString()}`;
    
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const enhanced = getEnhancedHebrewDate(date);
    
    // Add holiday and parsha information
    this.enrichWithHolidayInfo(enhanced, date);
    
    if (this.config.cacheEnabled) {
      this.cache.set(cacheKey, enhanced);
      setTimeout(() => this.cache.delete(cacheKey), this.config.cacheTTL);
    }

    return enhanced;
  }

  /**
   * Get current Hebrew date
   */
  public getCurrentHebrewDate(): EnhancedHebrewDate {
    return this.getEnhancedDate(new Date());
  }

  /**
   * Calculate Zmanim (religious times) for a specific date and location
   */
  public getZmanim(date: Date, location?: Location): Zmanim {
    const loc = location || this.config.defaultLocation;
    const cacheKey = `zmanim_${date.toDateString()}_${loc.latitude}_${loc.longitude}`;
    
    if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Create Hebcal location object
      const hebcalLocation = new HebcalLocation(
        loc.latitude,
        loc.longitude,
        loc.timezone,
        loc.name,
        loc.country,
        loc.elevation
      );

      const zmanim = new HebcalZmanim(date, hebcalLocation);

      const result: Zmanim = {
        location: loc.name,
        timezone: loc.timezone,
        date,
        alotHaShachar: zmanim.alot(),
        misheyakir: zmanim.misheyakir(),
        sunrise: zmanim.sunrise(),
        sofZmanShma: zmanim.sofZmanShma(),
        sofZmanTfilla: zmanim.sofZmanTfilla(),
        chatzot: zmanim.chatzot(),
        minchaGedola: zmanim.minchaGedola(),
        minchaKetana: zmanim.minchaKetana(),
        plagHaMincha: zmanim.plagHaMincha(),
        sunset: zmanim.sunset(),
        tzait: zmanim.tzait(),
        tzait72: zmanim.tzait72(),
        chatzotLayla: zmanim.chatzotLayla()
      };

      if (this.config.cacheEnabled) {
        this.cache.set(cacheKey, result);
        setTimeout(() => this.cache.delete(cacheKey), this.config.cacheTTL);
      }

      return result;
    } catch (error) {
      throw new HebrewCalendarError(
        `Failed to calculate zmanim: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ErrorCode.CALCULATION_ERROR,
        { date, location: loc }
      );
    }
  }

  /**
   * Get auction restrictions for a specific date
   */
  public getAuctionRestrictions(date: Date, location?: Location): AuctionRestrictions {
    const enhanced = this.getEnhancedDate(date);
    const zmanim = this.getZmanim(date, location);

    // Default restrictions for regular days
    let restrictions: AuctionRestrictions = {
      noAuctions: false,
      restrictedHours: [],
      specialConsiderations: 'Regular day - no restrictions',
      specialConsiderationsHebrew: 'יום רגיל - אין הגבלות',
      overrideAllowed: true,
      emergencyOnly: false
    };

    // Shabbat restrictions
    if (enhanced.isShabbat) {
      restrictions = {
        noAuctions: true,
        restrictedHours: [],
        specialConsiderations: 'No auctions permitted on Shabbat',
        specialConsiderationsHebrew: 'אסור לערוך מכירות פומביות בשבת',
        overrideAllowed: false,
        emergencyOnly: false
      };
    }

    // Yom Tov restrictions
    if (enhanced.isYomTov) {
      restrictions = {
        noAuctions: true,
        restrictedHours: [],
        specialConsiderations: 'No auctions permitted on Yom Tov',
        specialConsiderationsHebrew: 'אסור לערוך מכירות פומביות ביום טוב',
        overrideAllowed: false,
        emergencyOnly: false
      };
    }

    // Rosh Chodesh - partial restrictions
    if (enhanced.isRoshChodesh && !enhanced.isShabbat && !enhanced.isYomTov) {
      restrictions = {
        noAuctions: false,
        restrictedHours: [
          {
            startTime: 'shacharit',
            endTime: 'after_hallel',
            description: 'Limited during morning prayers with Hallel',
            descriptionHebrew: 'הגבלה בזמן תפילת שחרית עם הלל'
          }
        ],
        specialConsiderations: 'Rosh Chodesh - avoid during special prayers',
        specialConsiderationsHebrew: 'ראש חודש - להימנע בזמן תפילות מיוחדות',
        overrideAllowed: true,
        emergencyOnly: false
      };
    }

    // Fast days - partial restrictions
    if (enhanced.isFastDay) {
      restrictions = {
        noAuctions: false,
        restrictedHours: [
          {
            startTime: zmanim.alotHaShachar.toTimeString().slice(0, 5),
            endTime: zmanim.tzait.toTimeString().slice(0, 5),
            description: 'Sensitive timing during fast day',
            descriptionHebrew: 'עיתוי רגיש ביום צום'
          }
        ],
        specialConsiderations: 'Fast day - proceed with sensitivity',
        specialConsiderationsHebrew: 'יום צום - להמשיך ברגישות',
        overrideAllowed: true,
        emergencyOnly: false
      };
    }

    return restrictions;
  }

  /**
   * Get holidays for a date range
   */
  public getHolidays(startDate: Date, endDate: Date): HebrewHoliday[] {
    // This would integrate with @hebcal/core to get holiday information
    // For now, return empty array - full implementation would query Hebcal
    return [];
  }

  /**
   * Check if auctions are permitted at a specific time
   */
  public isAuctionPermitted(dateTime: Date, location?: Location): {
    permitted: boolean;
    reason: string;
    reasonHebrew: string;
  } {
    const restrictions = this.getAuctionRestrictions(dateTime, location);
    
    if (restrictions.noAuctions) {
      return {
        permitted: false,
        reason: restrictions.specialConsiderations,
        reasonHebrew: restrictions.specialConsiderationsHebrew
      };
    }

    // Check time restrictions
    const currentTime = dateTime.toTimeString().slice(0, 5);
    for (const restriction of restrictions.restrictedHours) {
      // Simplified time checking - full implementation would handle zmanim properly
      if (this.isTimeBetween(currentTime, restriction.startTime, restriction.endTime)) {
        return {
          permitted: false,
          reason: restriction.description,
          reasonHebrew: restriction.descriptionHebrew
        };
      }
    }

    return {
      permitted: true,
      reason: 'Auctions permitted',
      reasonHebrew: 'מכירות פומביות מותרות'
    };
  }

  /**
   * Get gematria suggestions for auction amounts
   */
  public getGematriaSuggestions(baseAmount: number) {
    return getSuggestedMultipliers(baseAmount);
  }

  /**
   * Calculate gematria for Hebrew text
   */
  public calculateGematria(hebrewText: string) {
    return calculateGematria(hebrewText);
  }

  /**
   * Get common Hebrew multipliers for auctions
   */
  public getCommonMultipliers() {
    return COMMON_MULTIPLIERS.filter(m => m.commonUse);
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<HebrewCalendarConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.validateConfig();
    if (newConfig.cacheEnabled === false) {
      this.clearCache();
    }
  }

  // Private helper methods

  private enrichWithHolidayInfo(enhanced: EnhancedHebrewDate, date: Date): void {
    // This would integrate with @hebcal/core for full holiday detection
    // For now, we'll set basic flags based on what we can determine
    
    // This is where we'd check against Hebcal events for the date
    // and populate isYomTov, isFastDay, isCholedMoed, parsha, etc.
  }

  private isTimeBetween(current: string, start: string, end: string): boolean {
    // Simplified time comparison - full implementation would handle zmanim names
    if (start.includes(':') && end.includes(':')) {
      return current >= start && current <= end;
    }
    // For zmanim names, we'd need to resolve them to actual times
    return false;
  }
}