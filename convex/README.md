# Convex Database Schema

## Overview

This directory contains the complete Convex database schema for the Orthodox Synagogue Honor Auction Platform. The schema is designed with **mandatory bilingual support** and **Hebrew calendar integration** as core architectural principles.

## Core Design Principles

### 1. Complete Bilingual Support
**Every user-facing entity MUST include both Hebrew and English fields:**
- `nameEnglish` and `nameHebrew` for all names
- `descriptionEnglish` and `descriptionHebrew` for descriptions
- `titleEnglish` and `titleHebrew` for titles
- Hebrew equivalents for status fields and categories

### 2. Hebrew Calendar Integration
**All date-related operations use Hebrew calendar as primary reference:**
- `hebrewDate` fields in standard Hebrew format (e.g., "כ״ח אלול תשפ״ה")
- Gregorian dates serve as secondary reference for system processing
- Complete zmanim (religious times) integration
- Holiday detection and auction restrictions

### 3. Religious Compliance
**Built-in support for Jewish law and customs:**
- Sabbath and holiday auction restrictions
- Hebrew numerology (gematria) calculations
- Zmanim-based timing restrictions
- Proper Hebrew name handling with nikud support

## Schema Structure

### Core Entities

#### `users`
- **Purpose**: User management with role-based access
- **Key Features**: 
  - Mandatory Hebrew names for all users
  - Language preference tracking (Hebrew/English)
  - Hebrew date preference settings
  - Role-based permissions (gabbai, member, admin)

#### `synagogues`
- **Purpose**: Multi-synagogue support
- **Key Features**:
  - Bilingual synagogue names and information
  - Hebrew calendar location settings for zmanim
  - Custom holiday restrictions per synagogue

#### `honors`
- **Purpose**: Database of auction items (mitzvot)
- **Key Features**:
  - Complete bilingual naming and descriptions
  - Hebrew category classification
  - Gematria value associations
  - Holiday-specific honors

#### `auctions`
- **Purpose**: Active auction management
- **Key Features**:
  - Bilingual auction titles and descriptions
  - Hebrew calendar scheduling with holiday awareness
  - Hebrew numerology multiplier support
  - Zmanim-based timing restrictions

#### `bids`
- **Purpose**: Real-time bidding records
- **Key Features**:
  - Hebrew timestamp tracking for religious records
  - Gematria value calculations
  - Conflict resolution for simultaneous bids
  - Bilingual bidder information caching

#### `commitments`
- **Purpose**: Payment commitment tracking
- **Key Features**:
  - Bilingual symbolic item descriptions
  - Hebrew calendar payment scheduling
  - Stripe integration for symbolic payments
  - Full pledge amount management

### Hebrew Calendar Support

#### `hebrewCalendar`
- **Purpose**: Complete Hebrew calendar database
- **Key Features**:
  - Gregorian to Hebrew date conversion
  - Holiday detection and classification
  - Zmanim calculations for religious compliance
  - Auction timing restrictions based on Jewish law

### System Infrastructure

#### `systemConfig`
- **Purpose**: Bilingual system configuration
- **Key Features**:
  - Hebrew/English configuration values
  - Calendar and language settings
  - Feature flags and system parameters

#### `auditLog`
- **Purpose**: Compliance and security tracking
- **Key Features**:
  - Hebrew calendar event tracking
  - Bilingual change descriptions
  - Complete user action logging

#### `notifications`
- **Purpose**: Multi-channel notification system
- **Key Features**:
  - Bilingual notification content
  - Hebrew calendar timestamp tracking
  - Multiple delivery channels (email, SMS, push)

## Indexing Strategy

### Performance Indexes
- **User lookups**: `by_token`, `by_email`, `by_language`
- **Auction queries**: `by_status`, `by_end_time`, `by_synagogue`
- **Hebrew calendar**: `by_gregorian`, `by_hebrew`, `by_holiday`
- **Bidding performance**: `by_auction`, `by_timestamp`, `by_winning`

### Bilingual Indexes
- **English searches**: Standard category and name indexes
- **Hebrew searches**: Dedicated Hebrew name and category indexes
- **Cross-language**: Combined indexes for efficient bilingual queries

## Data Types and Validation

### Hebrew Text Handling
- **Storage**: UTF-8 encoded strings with full nikud support
- **Validation**: Proper Hebrew character validation
- **Formatting**: Geresh and gershayim marks for Hebrew numerals

### Hebrew Calendar Dates
- **Format**: Standard Hebrew calendar notation (e.g., "ג׳ תשרי תשפ״ה")
- **Validation**: Proper Hebrew calendar date validation
- **Conversion**: Automatic Gregorian to Hebrew date correlation

### Monetary Values
- **Storage**: Decimal numbers (avoiding floating-point precision issues)
- **Currency**: USD cents for Stripe integration
- **Hebrew numerology**: Support for gematria-based calculations

## Security Considerations

### Access Control
- **Role-based permissions**: Gabbai, member, and admin roles
- **Row-level security**: Users can only access their own data
- **Audit logging**: Complete change tracking for compliance

### Data Privacy
- **Personal information**: Encrypted storage for sensitive data
- **Payment data**: PCI DSS compliant handling
- **Hebrew names**: Respectful handling of religious names

## Development Guidelines

### Adding New Entities
1. **Always include bilingual fields** for user-facing content
2. **Add Hebrew calendar tracking** for time-based entities
3. **Include proper indexes** for performance
4. **Add audit logging** for sensitive operations

### Querying Data
1. **Use language-appropriate indexes** for searches
2. **Include Hebrew calendar context** in date queries
3. **Respect user language preferences** in responses
4. **Cache frequently accessed bilingual content**

### Migration Strategy
1. **Backward compatibility**: Maintain existing API contracts
2. **Bilingual migration**: Gradually add Hebrew content
3. **Calendar integration**: Phase in Hebrew calendar features
4. **Performance monitoring**: Track query performance during migration

## Future Enhancements

### Planned Features
- **Multi-timezone support**: Advanced Hebrew calendar calculations
- **Custom Hebrew multipliers**: Gabbai-defined gematria values
- **Advanced reporting**: Hebrew calendar-based analytics
- **Integration APIs**: Synagogue management system connectors

### Scalability Considerations
- **Sharding strategy**: Geographic/synagogue-based partitioning
- **Caching layer**: Bilingual content caching
- **Real-time optimization**: WebSocket connection pooling
- **Search optimization**: Full-text search in Hebrew and English

---

**This schema represents the foundation for a truly bilingual, religiously compliant auction platform that serves the Orthodox Jewish community authentically while maintaining modern technical standards.**
