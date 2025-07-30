import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * COMPREHENSIVE BILINGUAL SCHEMA for Orthodox Synagogue Honor Auction Platform
 * 
 * CRITICAL REQUIREMENTS:
 * 1. EVERY entity must support both Hebrew and English
 * 2. Hebrew calendar integration is MANDATORY for all date operations
 * 3. All user-facing content requires bilingual fields
 * 4. Hebrew names and descriptions are REQUIRED, not optional
 */

export default defineSchema({
  // ===== USER MANAGEMENT WITH MANDATORY BILINGUAL SUPPORT =====
  users: defineTable({
    // Basic user information
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(), // Google OAuth identifier
    
    // MANDATORY: Hebrew name for every user
    hebrewName: v.string(), // Required Hebrew name (e.g., "יוסף בן אברהם")
    
    // Role-based access control
    role: v.union(
      v.literal('gabbai'),    // Synagogue manager with full auction control
      v.literal('member'),    // Regular congregant who can bid
      v.literal('admin')      // System administrator
    ),
    
    // MANDATORY: Language preferences
    preferredLanguage: v.union(v.literal('en'), v.literal('he')),
    hebrewDatePreference: v.boolean(), // Primary display preference for dates
    
    // User settings
    timezone: v.string(),
    avatarUrl: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    
    // Synagogue affiliation
    synagogueId: v.optional(v.id('synagogues')),
    membershipNumber: v.optional(v.string()),
    
    // Account status
    isActive: v.boolean(),
    lastLogin: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_token', ['tokenIdentifier'])
    .index('by_email', ['email'])
    .index('by_language', ['preferredLanguage'])
    .index('by_synagogue', ['synagogueId'])
    .index('by_role', ['role']),

  // ===== SYNAGOGUE MANAGEMENT =====
  synagogues: defineTable({
    // MANDATORY: Bilingual synagogue information
    nameEnglish: v.string(),  // e.g., "Congregation Beth Shalom"
    nameHebrew: v.string(),   // e.g., "קהילת בית שלום"
    
    // Location and contact
    address: v.string(),
    city: v.string(),
    country: v.string(),
    timezone: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    website: v.optional(v.string()),
    
    // Hebrew calendar settings
    defaultHebrewCalendarLocation: v.string(), // For zmanim calculations
    customHolidayRestrictions: v.optional(v.array(v.string())),
    
    // Auction settings
    defaultBidIncrement: v.number(),
    enableHebrewNumerology: v.boolean(),
    
    // Administrative
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_location', ['city', 'country'])
    .index('by_timezone', ['timezone']),

  // ===== HONOR/MITZVA DATABASE WITH MANDATORY BILINGUAL CONTENT =====
  honors: defineTable({
    // MANDATORY: Complete bilingual naming
    nameEnglish: v.string(),     // e.g., "Torah Reading - Maftir"
    nameHebrew: v.string(),      // e.g., "קריאת התורה - מפטיר"
    
    // MANDATORY: Complete bilingual descriptions
    descriptionEnglish: v.string(), // Full English explanation
    descriptionHebrew: v.string(),  // Full Hebrew explanation
    
    // MANDATORY: Bilingual categorization
    category: v.string(),           // English category
    categoryHebrew: v.string(),     // Hebrew category name
    
    // Honor details
    defaultPrice: v.number(),
    isCustom: v.boolean(),          // Custom honor created by gabbai
    sortOrder: v.number(),          // Display order in lists
    
    // Hebrew numerological significance
    gematriaValue: v.optional(v.number()),
    hebrewSignificance: v.optional(v.string()), // Hebrew explanation of significance
    
    // Holiday and timing associations
    holidaySpecific: v.optional(v.array(v.string())), // English holiday names
    hebrewHolidaysOnly: v.array(v.string()),          // Hebrew calendar holidays
    
    // Auction restrictions
    minimumBid: v.optional(v.number()),
    maximumBid: v.optional(v.number()),
    allowMultipliers: v.boolean(),
    
    // Administrative
    synagogueId: v.optional(v.id('synagogues')),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_category', ['category'])
    .index('by_hebrew_category', ['categoryHebrew'])
    .index('by_holiday', ['holidaySpecific'])
    .index('by_hebrew_holiday', ['hebrewHolidaysOnly'])
    .index('by_synagogue', ['synagogueId'])
    .index('by_sort_order', ['sortOrder']),

  // ===== ACTIVE AUCTIONS WITH COMPLETE HEBREW CALENDAR INTEGRATION =====
  auctions: defineTable({
    // Basic auction information
    honorId: v.id('honors'),
    synagogueId: v.id('synagogues'),
    gabbaiId: v.id('users'),
    
    // MANDATORY: Bilingual auction titles
    titleEnglish: v.string(),    // e.g., "Rosh Hashana Torah Reading"
    titleHebrew: v.string(),     // e.g., "קריאת התורה לראש השנה"
    
    // Bidding configuration
    startingPrice: v.number(),
    currentBid: v.optional(v.number()),
    bidIncrement: v.number(),
    minimumBid: v.optional(v.number()),
    
    // Hebrew numerology multipliers
    customMultipliers: v.array(v.object({
      nameEnglish: v.string(),        // e.g., "Double Chai"
      nameHebrew: v.string(),         // e.g., "חי כפול"
      value: v.number(),              // Multiplier value
      hebrewNumerology: v.optional(v.string()), // Gematria significance
      significance: v.optional(v.string()),     // Explanation
    })),
    
    // MANDATORY: Hebrew calendar date tracking
    hebrewStartDate: v.string(),    // Format: "כ״ח אלול תשפ״ה"
    hebrewEndDate: v.string(),      // Format: "כ״ט אלול תשפ״ה"
    gregorianStartTime: v.number(), // Unix timestamp for system processing
    gregorianEndTime: v.number(),   // Unix timestamp for system processing
    
    // Jewish calendar compliance
    associatedHoliday: v.optional(v.string()),     // Hebrew holiday name
    zmanimRestrictions: v.optional(v.object({
      noAuctionBefore: v.string(),  // e.g., "שקיעה" (sunset)
      noAuctionAfter: v.string(),   // e.g., "צאת הכוכבים" (nightfall)
      location: v.string(),         // For zmanim calculations
    })),
    
    // Auction state and settings
    status: v.union(
      v.literal('pending'),   // Scheduled but not started
      v.literal('active'),    // Currently accepting bids
      v.literal('ending'),    // In final countdown
      v.literal('ended'),     // Completed
      v.literal('cancelled')  // Cancelled by gabbai
    ),
    
    // Winner information
    winnerId: v.optional(v.id('users')),
    winningBid: v.optional(v.number()),
    
    // Soft close configuration (extends auction if bids come in near end)
    softCloseEnabled: v.boolean(),
    extensionMinutes: v.number(),
    extensionsRemaining: v.number(),
    
    // Participation tracking
    participantCount: v.number(),
    totalBids: v.number(),
    
    // Administrative
    notes: v.optional(v.string()),
    notesHebrew: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_status', ['status'])
    .index('by_hebrew_date', ['hebrewStartDate'])
    .index('by_holiday', ['associatedHoliday'])
    .index('by_end_time', ['gregorianEndTime'])
    .index('by_synagogue', ['synagogueId'])
    .index('by_gabbai', ['gabbaiId'])
    .index('by_honor', ['honorId']),

  // ===== BIDDING RECORDS WITH BILINGUAL TRACKING =====
  bids: defineTable({
    // Bid identification
    auctionId: v.id('auctions'),
    bidderId: v.id('users'),
    
    // Bid details
    amount: v.number(),
    timestamp: v.number(),
    hebrewTimestamp: v.string(),  // Hebrew date/time for religious record keeping
    
    // Bid status
    isWinning: v.boolean(),
    isActive: v.boolean(),        // False if bid was outbid
    
    // Hebrew numerology information
    multiplierUsed: v.optional(v.string()),        // English multiplier name
    multiplierHebrewName: v.optional(v.string()),  // Hebrew multiplier name
    gematriaValue: v.optional(v.number()),         // Calculated gematria value
    hebrewSignificance: v.optional(v.string()),    // Hebrew explanation
    
    // Conflict resolution (for simultaneous bids)
    parentBidId: v.optional(v.id('bids')),
    conflictResolved: v.boolean(),
    resolutionMethod: v.optional(v.string()),
    
    // Bidder information (cached for performance)
    bidderName: v.string(),
    bidderHebrewName: v.string(),
    
    // Administrative
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_auction', ['auctionId'])
    .index('by_bidder', ['bidderId'])
    .index('by_timestamp', ['timestamp'])
    .index('by_hebrew_date', ['hebrewTimestamp'])
    .index('by_parent', ['parentBidId', 'auctionId'])
    .index('by_amount', ['amount'])
    .index('by_winning', ['isWinning', 'auctionId']),

  // ===== COMMITMENT AND PAYMENT TRACKING WITH BILINGUAL RECEIPTS =====
  commitments: defineTable({
    // Commitment identification
    auctionId: v.id('auctions'),
    memberId: v.id('users'),
    
    // Payment amounts
    symbolicAmount: v.number(),    // Small Stripe charge ($3-6)
    commitmentAmount: v.number(),  // Full pledge amount
    totalPaid: v.number(),         // Running total of payments
    
    // MANDATORY: Bilingual symbolic item description
    symbolicItemEnglish: v.string(), // e.g., "Torah Reading Pointer"
    symbolicItemHebrew: v.string(),  // e.g., "יד לקריאת התורה"
    
    // Payment processing
    stripePaymentIntentId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    
    // Payment schedule with Hebrew calendar integration
    paymentSchedule: v.array(v.object({
      dueDate: v.number(),              // Gregorian due date
      hebrewDueDate: v.string(),        // Hebrew calendar due date
      amount: v.number(),               // Payment amount
      status: v.string(),               // English status
      statusHebrew: v.string(),         // Hebrew status description
      paidDate: v.optional(v.number()),
      hebrewPaidDate: v.optional(v.string()),
      paymentId: v.optional(v.id('payments')),
    })),
    
    // Commitment status
    status: v.union(
      v.literal('pending'),     // Awaiting symbolic payment
      v.literal('confirmed'),   // Symbolic payment received
      v.literal('partial'),     // Some payments made
      v.literal('fulfilled'),   // Fully paid
      v.literal('overdue'),     // Payment overdue
      v.literal('cancelled')    // Commitment cancelled
    ),
    
    // Hebrew calendar tracking
    hebrewCommitmentDate: v.string(), // Hebrew date of commitment
    
    // Administrative
    notes: v.optional(v.string()),
    notesHebrew: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_member', ['memberId'])
    .index('by_auction', ['auctionId'])
    .index('by_status', ['status'])
    .index('by_hebrew_date', ['hebrewCommitmentDate'])
    .index('by_stripe_intent', ['stripePaymentIntentId']),

  // ===== PAYMENT RECORDS WITH BILINGUAL DOCUMENTATION =====
  payments: defineTable({
    // Payment identification
    commitmentId: v.id('commitments'),
    
    // Payment details
    amount: v.number(),
    method: v.union(
      v.literal('stripe'),    // Credit card via Stripe
      v.literal('check'),     // Physical check
      v.literal('cash'),      // Cash payment
      v.literal('transfer'),  // Bank transfer
      v.literal('other')      // Other method
    ),
    methodHebrew: v.string(), // Hebrew description of payment method
    
    // Processing information
    stripeChargeId: v.optional(v.string()),
    checkNumber: v.optional(v.string()),
    referenceNumber: v.optional(v.string()),
    
    // Dates with Hebrew calendar tracking
    paymentDate: v.number(),
    hebrewPaymentDate: v.string(),        // Hebrew date for religious records
    reconciledDate: v.optional(v.number()),
    hebrewReconciledDate: v.optional(v.string()),
    
    // Status tracking
    status: v.union(
      v.literal('pending'),
      v.literal('completed'),
      v.literal('failed'),
      v.literal('refunded'),
      v.literal('disputed')
    ),
    
    // Notes and documentation
    notes: v.optional(v.string()),
    notesHebrew: v.optional(v.string()),
    
    // Administrative
    processedBy: v.optional(v.id('users')),
    receiptSent: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_commitment', ['commitmentId'])
    .index('by_payment_date', ['paymentDate'])
    .index('by_hebrew_date', ['hebrewPaymentDate'])
    .index('by_method', ['method'])
    .index('by_status', ['status'])
    .index('by_stripe_charge', ['stripeChargeId']),

  // ===== MANDATORY: HEBREW CALENDAR AND HOLIDAY DATA =====
  hebrewCalendar: defineTable({
    // Date correlation
    gregorianDate: v.string(),    // YYYY-MM-DD format
    hebrewDate: v.string(),       // Hebrew date with geresh marks
    hebrewYear: v.number(),       // Hebrew year number
    hebrewMonth: v.string(),      // Hebrew month name
    hebrewDay: v.number(),        // Hebrew day number
    
    // Day classification
    isShabbat: v.boolean(),
    isYomTov: v.boolean(),        // Major holiday
    isCholedMoed: v.boolean(),    // Intermediate days
    isRoshChodesh: v.boolean(),   // New month
    isFastDay: v.boolean(),
    
    // Holiday information
    holidayName: v.optional(v.string()),        // Hebrew holiday name
    holidayNameEnglish: v.optional(v.string()), // English holiday name
    holidayType: v.optional(v.string()),        // Type classification
    
    // Zmanim (religious times) for auction compliance
    zmanim: v.optional(v.object({
      alotHaShachar: v.string(),    // Dawn
      misheyakir: v.string(),       // Earliest prayer time
      sunrise: v.string(),
      sofZmanShma: v.string(),      // Latest Shema
      sofZmanTfilla: v.string(),    // Latest prayer
      chatzot: v.string(),          // Midday
      minchaGedola: v.string(),     // Earliest afternoon prayer
      minchaKetana: v.string(),     // Preferred afternoon prayer
      plagHaMincha: v.string(),     // Late afternoon
      sunset: v.string(),
      tzait: v.string(),            // Nightfall
      tzait72: v.string(),          // 72-minute nightfall
    })),
    
    // Auction restrictions based on Jewish law
    auctionRestrictions: v.optional(v.object({
      noAuctions: v.boolean(),              // Completely prohibited
      restrictedHours: v.array(v.string()), // Time restrictions
      specialConsiderations: v.string(),    // Additional notes
      specialConsiderationsHebrew: v.string(), // Hebrew notes
    })),
    
    // Location for zmanim calculations
    location: v.string(),
    timezone: v.string(),
    
    // Administrative
    lastUpdated: v.number(),
    source: v.string(), // e.g., "hebcal-api"
  })
    .index('by_gregorian', ['gregorianDate'])
    .index('by_hebrew', ['hebrewDate'])
    .index('by_hebrew_year', ['hebrewYear'])
    .index('by_holiday', ['holidayName'])
    .index('by_location', ['location'])
    .index('by_restrictions', ['auctionRestrictions.noAuctions']),

  // ===== SYSTEM CONFIGURATION FOR BILINGUAL AND CALENDAR SETTINGS =====
  systemConfig: defineTable({
    // Configuration key
    key: v.string(),
    
    // Bilingual values
    valueEnglish: v.union(v.string(), v.number(), v.boolean()),
    valueHebrew: v.optional(v.string()),  // Hebrew equivalent if applicable
    
    // Configuration metadata
    category: v.string(),
    description: v.string(),
    descriptionHebrew: v.string(),
    
    // Value constraints
    dataType: v.union(
      v.literal('string'),
      v.literal('number'),
      v.literal('boolean'),
      v.literal('json')
    ),
    validationRules: v.optional(v.string()),
    
    // Administrative
    isEditable: v.boolean(),
    lastUpdated: v.number(),
    hebrewLastUpdated: v.string(),
    updatedBy: v.optional(v.id('users')),
  })
    .index('by_key', ['key'])
    .index('by_category', ['category'])
    .index('by_editable', ['isEditable']),

  // ===== AUDIT LOG FOR COMPLIANCE AND DEBUGGING =====
  auditLog: defineTable({
    // Event identification
    entityType: v.string(),         // Table/entity name
    entityId: v.string(),           // Record ID
    action: v.string(),             // CREATE, UPDATE, DELETE
    
    // User and session information
    userId: v.optional(v.id('users')),
    userRole: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    
    // Change details
    changes: v.optional(v.string()), // JSON string of changes
    oldValues: v.optional(v.string()),
    newValues: v.optional(v.string()),
    
    // Hebrew calendar tracking
    hebrewDate: v.string(),
    
    // Event context
    reason: v.optional(v.string()),
    reasonHebrew: v.optional(v.string()),
    
    // Administrative
    timestamp: v.number(),
    severity: v.union(
      v.literal('info'),
      v.literal('warning'),
      v.literal('error'),
      v.literal('critical')
    ),
  })
    .index('by_entity', ['entityType', 'entityId'])
    .index('by_user', ['userId'])
    .index('by_timestamp', ['timestamp'])
    .index('by_hebrew_date', ['hebrewDate'])
    .index('by_action', ['action'])
    .index('by_severity', ['severity']),

  // ===== NOTIFICATION SYSTEM WITH BILINGUAL SUPPORT =====
  notifications: defineTable({
    // Notification identification
    userId: v.id('users'),
    type: v.string(),               // AUCTION_STARTED, BID_OUTBID, etc.
    
    // Bilingual content
    titleEnglish: v.string(),
    titleHebrew: v.string(),
    messageEnglish: v.string(),
    messageHebrew: v.string(),
    
    // Related entities
    auctionId: v.optional(v.id('auctions')),
    commitmentId: v.optional(v.id('commitments')),
    
    // Delivery channels
    channels: v.array(v.union(
      v.literal('in_app'),
      v.literal('email'),
      v.literal('sms'),
      v.literal('push')
    )),
    
    // Status tracking
    isRead: v.boolean(),
    isDelivered: v.boolean(),
    deliveredAt: v.optional(v.number()),
    readAt: v.optional(v.number()),
    
    // Hebrew calendar
    hebrewDate: v.string(),
    
    // Priority and expiration
    priority: v.union(
      v.literal('low'),
      v.literal('normal'),
      v.literal('high'),
      v.literal('urgent')
    ),
    expiresAt: v.optional(v.number()),
    
    // Administrative
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_type', ['type'])
    .index('by_unread', ['userId', 'isRead'])
    .index('by_auction', ['auctionId'])
    .index('by_priority', ['priority'])
    .index('by_hebrew_date', ['hebrewDate']),
});
