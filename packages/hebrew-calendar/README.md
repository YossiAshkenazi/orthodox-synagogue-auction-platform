# Hebrew Calendar Service

> Comprehensive Hebrew calendar service with date conversion, holiday detection, and zmanim calculations for Orthodox synagogue applications

## Overview

This package provides a complete Hebrew calendar implementation specifically designed for Orthodox synagogue auction platforms. It handles all aspects of the Hebrew calendar including date conversions, religious time calculations (zmanim), holiday detection, and Hebrew numerology (gematria) for auction multipliers.

## Features

### 🗓️ Date Conversion
- **Bidirectional conversion** between Gregorian and Hebrew dates
- **Hebrew date formatting** with proper geresh marks (e.g., "כ״ח אלול תשפ״ה")
- **Enhanced date information** including Shabbat, Yom Tov, and Rosh Chodesh detection
- **Hebrew day and month names** with full nikud support

### ⏰ Zmanim (Religious Times)
- **Complete zmanim calculations** for any location worldwide
- **Halachic times** including:
  - Alot HaShachar (dawn)
  - Sunrise and sunset
  - Latest Shema and prayer times
  - Mincha times (Gedola and Ketana)
  - Nightfall (tzait)
- **Location-based calculations** with timezone support

### 🎯 Auction Compliance
- **Automatic auction restrictions** for Shabbat and holidays
- **Time-based restrictions** for religious observances
- **Override capabilities** for emergency synagogue needs
- **Bilingual restriction messages** (Hebrew/English)

### 🔢 Gematria (Hebrew Numerology)
- **Multiple calculation methods**: Standard, Large, Small, Ordinal, and Reduced
- **Common auction multipliers**: Chai (18), Double Chai (36), etc.
- **Significance explanations** for meaningful numbers
- **Bidding suggestions** based on gematria values

## Installation

```bash
# From the root of the monorepo
pnpm add @synagogue-auction/hebrew-calendar

# Or install dependencies for development
cd packages/hebrew-calendar
pnpm install
```

## Quick Start

```typescript
import { 
  HebrewCalendarService, 
  createHebrewCalendarService,
  COMMON_LOCATIONS 
} from '@synagogue-auction/hebrew-calendar';

// Quick setup with predefined location
const calendar = createHebrewCalendarService('NEW_YORK');

// Get current Hebrew date
const today = calendar.getCurrentHebrewDate();
console.log(today.hebrewDateString); // "כ״ח אלול תשפ״ה"

// Check auction restrictions
const restrictions = calendar.getAuctionRestrictions(new Date());
if (restrictions.noAuctions) {
  console.log(restrictions.specialConsiderationsHebrew);
}

// Get gematria suggestions for auction
const suggestions = calendar.getGematriaSuggestions(100);
// Returns multipliers like 1800 (100 × 18 for Chai)
```

## API Reference

### HebrewCalendarService

#### Constructor
```typescript
new HebrewCalendarService(config: HebrewCalendarConfig)
```

#### Core Methods

##### Date Conversion
```typescript
// Convert Gregorian to Hebrew
gregorianToHebrew(date: Date): HebrewDate

// Convert Hebrew to Gregorian
hebrewToGregorian(day: number, month: number, year: number): Date

// Get enhanced Hebrew date with full calendar info
getEnhancedDate(date: Date): EnhancedHebrewDate

// Get current Hebrew date
getCurrentHebrewDate(): EnhancedHebrewDate
```

##### Zmanim Calculations
```typescript
// Calculate religious times for a date and location
getZmanim(date: Date, location?: Location): Zmanim
```

##### Auction Restrictions
```typescript
// Get auction restrictions for a specific date
getAuctionRestrictions(date: Date, location?: Location): AuctionRestrictions

// Check if auctions are permitted at a specific time
isAuctionPermitted(dateTime: Date, location?: Location): {
  permitted: boolean;
  reason: string;
  reasonHebrew: string;
}
```

##### Gematria Functions
```typescript
// Get suggested multipliers for auction amounts
getGematriaSuggestions(baseAmount: number): GematriaMultiplier[]

// Calculate gematria value of Hebrew text
calculateGematria(hebrewText: string): GematriaCalculation

// Get common multipliers for auctions
getCommonMultipliers(): GematriaMultiplier[]
```

### Utility Functions

#### Date Utilities
```typescript
// Check if Hebrew year is a leap year
isHebrewLeapYear(hebrewYear: number): boolean

// Get days in Hebrew month
getDaysInHebrewMonth(hebrewMonth: number, hebrewYear: number): number

// Validate Hebrew date
isValidHebrewDate(day: number, month: number, year: number): boolean

// Convert number to Hebrew numeral
toHebrewNumeral(num: number): string // 18 → "י״ח"

// Format Hebrew year
formatHebrewYear(year: number): string // 5784 → "תשפ״ד"
```

#### Gematria Utilities
```typescript
// Calculate gematria with different methods
calculateGematria(text: string, method?: GematriaMethod): GematriaCalculation

// Find Hebrew words by gematria value
findWordsByValue(targetValue: number): GematriaMultiplier[]

// Calculate all gematria methods for a word
calculateAllMethods(text: string): Record<GematriaMethod, number>

// Validate Hebrew text
isValidHebrewText(text: string): boolean
```

## Configuration

### HebrewCalendarConfig
```typescript
interface HebrewCalendarConfig {
  defaultLocation: Location;
  hebcalApiKey?: string;
  cacheEnabled: boolean;
  cacheTTL: number;
  includeModernHolidays: boolean;
  includeFastDays: boolean;
  includeRoshChodesh: boolean;
  strictHalachicTimes: boolean;
  customHolidays: HebrewHoliday[];
}
```

### Predefined Locations
```typescript
COMMON_LOCATIONS.JERUSALEM   // Jerusalem, Israel
COMMON_LOCATIONS.TEL_AVIV    // Tel Aviv, Israel
COMMON_LOCATIONS.NEW_YORK    // New York, USA
COMMON_LOCATIONS.LONDON      // London, UK
COMMON_LOCATIONS.MONTREAL    // Montreal, Canada
COMMON_LOCATIONS.LOS_ANGELES // Los Angeles, USA
```

## Examples

### Complete Auction Date Validation
```typescript
const calendar = createHebrewCalendarService('NEW_YORK');

async function validateAuctionDate(proposedDate: Date) {
  // Get Hebrew date info
  const hebrewDate = calendar.getEnhancedDate(proposedDate);
  
  // Check restrictions
  const restrictions = calendar.getAuctionRestrictions(proposedDate);
  
  if (restrictions.noAuctions) {
    return {
      allowed: false,
      reason: restrictions.specialConsiderations,
      hebrewReason: restrictions.specialConsiderationsHebrew,
      hebrewDate: hebrewDate.hebrewDateString
    };
  }
  
  // Get zmanim for time-based restrictions
  const zmanim = calendar.getZmanim(proposedDate);
  
  return {
    allowed: true,
    hebrewDate: hebrewDate.hebrewDateString,
    restrictions: restrictions.restrictedHours,
    zmanim: {
      earliest: zmanim.alotHaShachar,
      latest: zmanim.tzait
    }
  };
}
```

### Gematria-Based Bidding
```typescript
const calendar = createHebrewCalendarService();

function generateBiddingSuggestions(minimumBid: number) {
  const suggestions = calendar.getGematriaSuggestions(minimumBid);
  
  return suggestions.map(suggestion => ({
    amount: suggestion.value,
    name: suggestion.nameEnglish,
    hebrewName: suggestion.nameHebrew,
    significance: suggestion.significance,
    displayText: `${suggestion.nameHebrew} (${suggestion.nameEnglish}) - $${suggestion.value}`
  }));
}

// Example output:
// [
//   { amount: 1800, displayText: "חי (Chai) - $1800" },
//   { amount: 3600, displayText: "חי כפול (Double Chai) - $3600" },
//   { amount: 1300, displayText: "אהבה (Ahavah) - $1300" }
// ]
```

### Custom Holiday Configuration
```typescript
const config = createDefaultConfig(COMMON_LOCATIONS.JERUSALEM);

// Add synagogue-specific holidays
config.customHolidays = [
  {
    name: 'Synagogue Foundation Day',
    nameHebrew: 'יום הקמת בית הכנסת',
    startDate: hebrewToGregorian(15, 5, 5784), // 15 Shevat
    type: HolidayType.MODERN,
    observanceLevel: ObservanceLevel.MINOR,
    auctionRestrictions: {
      noAuctions: false,
      restrictedHours: [],
      specialConsiderations: 'Special auction day',
      specialConsiderationsHebrew: 'יום מכירה מיוחד',
      overrideAllowed: false,
      emergencyOnly: false
    }
  }
];

const calendar = new HebrewCalendarService(config);
```

## Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## Development

```bash
# Build the package
pnpm build

# Run in development mode
pnpm dev

# Lint code
pnpm lint

# Type checking
pnpm type-check
```

## Dependencies

- **@hebcal/core**: Core Hebrew calendar calculations
- **@hebcal/hdate**: Hebrew date conversions
- **@hebcal/zmanim**: Religious time calculations
- **date-fns**: Date manipulation utilities
- **date-fns-tz**: Timezone support

## License

This package is part of the Orthodox Synagogue Auction Platform and follows the same license.

## Contributing

Contributions must maintain respect for Orthodox Jewish customs and religious requirements. All date calculations must be halachically accurate.

## Support

For questions or issues related to Hebrew calendar calculations or religious compliance, please open an issue in the main repository.