/**
 * Convex functions for Hebrew Calendar integration
 * Provides server-side Hebrew calendar operations for the auction platform
 */

import { query, mutation, action } from './_generated/server';
import { v } from 'convex/values';

/**
 * Hebrew calendar entry interface matching our schema
 */
interface HebrewCalendarEntry {
  gregorianDate: string;    // YYYY-MM-DD format
  hebrewDate: string;       // Hebrew date with geresh marks
  hebrewYear: number;       // Hebrew year number
  hebrewMonth: string;      // Hebrew month name
  hebrewDay: number;        // Hebrew day number
  isShabbat: boolean;
  isYomTov: boolean;        // Major holiday
  isCholedMoed: boolean;    // Intermediate days
  isRoshChodesh: boolean;   // New month
  isFastDay: boolean;
  holidayName?: string;        // Hebrew holiday name
  holidayNameEnglish?: string; // English holiday name
  holidayType?: string;        // Type classification
  zmanim?: {
    alotHaShachar: string;    // Dawn
    misheyakir: string;       // Earliest prayer time
    sunrise: string;
    sofZmanShma: string;      // Latest Shema
    sofZmanTfilla: string;    // Latest prayer
    chatzot: string;          // Midday
    minchaGedola: string;     // Earliest afternoon prayer
    minchaKetana: string;     // Preferred afternoon prayer
    plagHaMincha: string;     // Late afternoon
    sunset: string;
    tzait: string;            // Nightfall
    tzait72: string;          // 72-minute nightfall
  };
  auctionRestrictions?: {
    noAuctions: boolean;              // Completely prohibited
    restrictedHours: string[];        // Time restrictions
    specialConsiderations: string;    // Additional notes
    specialConsiderationsHebrew: string; // Hebrew notes
  };
  location: string;
  timezone: string;
  lastUpdated: number;
  source: string; // e.g., "hebcal-api"
}

/**
 * Get Hebrew calendar data for a specific date
 */
export const getHebrewCalendarData = query({
  args: { 
    gregorianDate: v.string(), // YYYY-MM-DD format
    location: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { gregorianDate, location = "New York" } = args;
    
    // Query existing data from database
    const existing = await ctx.db
      .query('hebrewCalendar')
      .withIndex('by_gregorian', (q) => q.eq('gregorianDate', gregorianDate))
      .filter((q) => q.eq(q.field('location'), location))
      .first();

    if (existing) {
      return existing;
    }

    // If not found, we'll need to calculate it
    // In a real implementation, this would trigger an action to populate the data
    return null;
  }
});

/**
 * Get Hebrew calendar data for a date range
 */
export const getHebrewCalendarRange = query({
  args: {
    startDate: v.string(), // YYYY-MM-DD
    endDate: v.string(),   // YYYY-MM-DD
    location: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { startDate, endDate, location = "New York" } = args;
    
    const results = await ctx.db
      .query('hebrewCalendar')
      .withIndex('by_gregorian')
      .filter((q) => 
        q.and(
          q.gte(q.field('gregorianDate'), startDate),
          q.lte(q.field('gregorianDate'), endDate),
          q.eq(q.field('location'), location)
        )
      )
      .collect();

    return results;
  }
});

/**
 * Get holidays for a Hebrew year
 */
export const getHolidaysByHebrewYear = query({
  args: {
    hebrewYear: v.number(),
    location: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { hebrewYear, location = "New York" } = args;
    
    const holidays = await ctx.db
      .query('hebrewCalendar')
      .withIndex('by_hebrew_year', (q) => q.eq('hebrewYear', hebrewYear))
      .filter((q) => 
        q.and(
          q.neq(q.field('holidayName'), undefined),
          q.eq(q.field('location'), location)
        )
      )
      .collect();

    return holidays;
  }
});

/**
 * Check auction restrictions for a specific date and time
 */
export const checkAuctionRestrictions = query({
  args: {
    gregorianDate: v.string(), // YYYY-MM-DD
    time: v.optional(v.string()), // HH:MM format
    location: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { gregorianDate, time, location = "New York" } = args;
    
    const calendarData = await ctx.db
      .query('hebrewCalendar')
      .withIndex('by_gregorian', (q) => q.eq('gregorianDate', gregorianDate))
      .filter((q) => q.eq(q.field('location'), location))
      .first();

    if (!calendarData) {
      return {
        permitted: false,
        reason: 'Hebrew calendar data not available for this date',
        reasonHebrew: 'נתוני לוח עברי אינם זמינים לתאריך זה'
      };
    }

    // Check for complete prohibition (Shabbat, Yom Tov)
    if (calendarData.auctionRestrictions?.noAuctions) {
      return {
        permitted: false,
        reason: calendarData.auctionRestrictions.specialConsiderations,
        reasonHebrew: calendarData.auctionRestrictions.specialConsiderationsHebrew
      };
    }

    // Check time-based restrictions
    if (time && calendarData.auctionRestrictions?.restrictedHours) {
      const isRestricted = calendarData.auctionRestrictions.restrictedHours.some(restriction => {
        // Simple time range check - in practice would need more sophisticated logic
        return restriction.includes(time);
      });

      if (isRestricted) {
        return {
          permitted: false,
          reason: 'Auction timing conflicts with religious observances',
          reasonHebrew: 'זמן המכירה מתנגש עם הקפדות דתיות'
        };
      }
    }

    return {
      permitted: true,
      reason: 'Auction permitted',
      reasonHebrew: 'מכירה פומבית מתוחה'
    };
  }
});

/**
 * Get current Hebrew date
 */
export const getCurrentHebrewDate = query({
  args: {
    location: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { location = "New York" } = args;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    return await ctx.db
      .query('hebrewCalendar')
      .withIndex('by_gregorian', (q) => q.eq('gregorianDate', today))
      .filter((q) => q.eq(q.field('location'), location))
      .first();
  }
});

/**
 * Add or update Hebrew calendar entry
 */
export const upsertHebrewCalendarEntry = mutation({
  args: {
    gregorianDate: v.string(),
    hebrewDate: v.string(),
    hebrewYear: v.number(),
    hebrewMonth: v.string(),
    hebrewDay: v.number(),
    isShabbat: v.boolean(),
    isYomTov: v.boolean(),
    isCholedMoed: v.boolean(),
    isRoshChodesh: v.boolean(),
    isFastDay: v.boolean(),
    holidayName: v.optional(v.string()),
    holidayNameEnglish: v.optional(v.string()),
    holidayType: v.optional(v.string()),
    zmanim: v.optional(v.object({
      alotHaShachar: v.string(),
      misheyakir: v.string(),
      sunrise: v.string(),
      sofZmanShma: v.string(),
      sofZmanTfilla: v.string(),
      chatzot: v.string(),
      minchaGedola: v.string(),
      minchaKetana: v.string(),
      plagHaMincha: v.string(),
      sunset: v.string(),
      tzait: v.string(),
      tzait72: v.string(),
    })),
    auctionRestrictions: v.optional(v.object({
      noAuctions: v.boolean(),
      restrictedHours: v.array(v.string()),
      specialConsiderations: v.string(),
      specialConsiderationsHebrew: v.string(),
    })),
    location: v.string(),
    timezone: v.string(),
    source: v.string()
  },
  handler: async (ctx, args) => {
    const { gregorianDate, location } = args;
    
    // Check if entry already exists
    const existing = await ctx.db
      .query('hebrewCalendar')
      .withIndex('by_gregorian', (q) => q.eq('gregorianDate', gregorianDate))
      .filter((q) => q.eq(q.field('location'), location))
      .first();

    const data = {
      ...args,
      lastUpdated: Date.now()
    };

    if (existing) {
      // Update existing entry
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      // Create new entry
      return await ctx.db.insert('hebrewCalendar', data);
    }
  }
});

/**
 * Batch insert Hebrew calendar data
 */
export const batchInsertHebrewCalendarData = mutation({
  args: {
    entries: v.array(v.object({
      gregorianDate: v.string(),
      hebrewDate: v.string(),
      hebrewYear: v.number(),
      hebrewMonth: v.string(),
      hebrewDay: v.number(),
      isShabbat: v.boolean(),
      isYomTov: v.boolean(),
      isCholedMoed: v.boolean(),
      isRoshChodesh: v.boolean(),
      isFastDay: v.boolean(),
      holidayName: v.optional(v.string()),
      holidayNameEnglish: v.optional(v.string()),
      holidayType: v.optional(v.string()),
      location: v.string(),
      timezone: v.string(),
      source: v.string()
    }))
  },
  handler: async (ctx, args) => {
    const { entries } = args;
    const results = [];
    
    for (const entry of entries) {
      const data = {
        ...entry,
        lastUpdated: Date.now()
      };
      
      const id = await ctx.db.insert('hebrewCalendar', data);
      results.push(id);
    }
    
    return results;
  }
});

/**
 * Action to populate Hebrew calendar data using external service
 * This would integrate with our Hebrew Calendar Service package
 */
export const populateHebrewCalendarData = action({
  args: {
    startDate: v.string(), // YYYY-MM-DD
    endDate: v.string(),   // YYYY-MM-DD
    location: v.optional(v.string()),
    forceRefresh: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const { startDate, endDate, location = "New York", forceRefresh = false } = args;
    
    // TODO: This would use our Hebrew Calendar Service to generate the data
    // For now, we return a placeholder response
    
    return {
      success: false,
      message: 'Hebrew calendar service integration pending',
      entriesProcessed: 0,
      dateRange: { startDate, endDate },
      location
    };
  }
});

/**
 * Get gematria suggestions for auction amounts
 */
export const getGematriaSuggestions = query({
  args: {
    baseAmount: v.number()
  },
  handler: async (ctx, args) => {
    const { baseAmount } = args;
    
    // Common Hebrew multipliers for auctions
    const multipliers = [
      { nameEnglish: 'Chai', nameHebrew: 'חי', value: 18, significance: 'Life' },
      { nameEnglish: 'Double Chai', nameHebrew: 'חי כפול', value: 36, significance: 'Double life' },
      { nameEnglish: 'Ahavah', nameHebrew: 'אהבה', value: 13, significance: 'Love' },
      { nameEnglish: 'Tzedakah', nameHebrew: 'צדקה', value: 199, significance: 'Charity' },
      { nameEnglish: 'Mitzvah', nameHebrew: 'מצוה', value: 141, significance: 'Good deed' },
      { nameEnglish: 'Bracha', nameHebrew: 'ברכה', value: 227, significance: 'Blessing' }
    ];
    
    return multipliers.map(m => ({
      ...m,
      suggestedAmount: baseAmount * m.value
    })).sort((a, b) => a.suggestedAmount - b.suggestedAmount);
  }
});

/**
 * Clean up old Hebrew calendar entries
 */
export const cleanupOldHebrewCalendarData = mutation({
  args: {
    olderThanDays: v.number(),
    location: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { olderThanDays, location } = args;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    const cutoffString = cutoffDate.toISOString().split('T')[0];
    
    let query = ctx.db
      .query('hebrewCalendar')
      .withIndex('by_gregorian')
      .filter((q) => q.lt(q.field('gregorianDate'), cutoffString));
    
    if (location) {
      query = query.filter((q) => q.eq(q.field('location'), location));
    }
    
    const oldEntries = await query.collect();
    
    for (const entry of oldEntries) {
      await ctx.db.delete(entry._id);
    }
    
    return {
      deletedCount: oldEntries.length,
      cutoffDate: cutoffString
    };
  }
});