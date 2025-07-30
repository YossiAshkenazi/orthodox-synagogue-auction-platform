# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Orthodox Synagogue Honor Auction Platform - a modern web application for conducting synagogue honor auctions with comprehensive Hebrew/English bilingual support and Jewish calendar integration. The platform is built as a monorepo using pnpm workspaces and Turborepo.

## Development Commands

### Core Development
```bash
# Install dependencies
pnpm install

# Start all development servers
pnpm dev

# Start individual services
pnpm dev:frontend     # React app (port 3000)
pnpm dev:backend      # NestJS API (port 3001)
pnpm dev:convex       # Convex dev server

# Docker development environment
docker-compose up -d  # All services
```

### Build and Testing
```bash
# Build all applications
pnpm build

# Run all tests
pnpm test

# Run specific tests
pnpm test:frontend
pnpm test:backend
pnpm test:e2e
```

### Code Quality
```bash
# Lint all code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Type checking
pnpm type-check
```

### Convex Database
```bash
# Start Convex development
pnpm convex:dev

# Deploy Convex functions
pnpm convex:deploy

# Open Convex dashboard
pnpm convex:dashboard
```

## Architecture Overview

### Monorepo Structure
The project is structured as a monorepo with the following planned layout:
- `apps/frontend/` - React application with bilingual UI
- `apps/backend/` - NestJS API server  
- `apps/admin/` - Admin dashboard
- `packages/shared/` - Shared utilities and types
- `packages/hebrew-calendar/` - Hebrew calendar services
- `packages/ui-components/` - Bilingual UI components
- `convex/` - Convex database schema and functions

**Note**: Currently only the convex/ directory exists with the database schema.

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS (with RTL support)
- **Backend**: NestJS + TypeScript + Socket.io
- **Database**: Convex (reactive database with real-time subscriptions)
- **Development**: Docker + pnpm + Turborepo + ESLint + Prettier
- **Authentication**: Google OAuth 2.0
- **Internationalization**: i18next for Hebrew/English support

### Core Architectural Principles

#### 1. Mandatory Bilingual Support
Every user-facing entity MUST include both Hebrew and English fields:
- Use `nameEnglish`/`nameHebrew` patterns
- Include `descriptionEnglish`/`descriptionHebrew` for descriptions
- Provide Hebrew equivalents for all status fields and categories
- All UI components must support RTL (right-to-left) for Hebrew

#### 2. Hebrew Calendar Integration
All date operations use Hebrew calendar as primary reference:
- Hebrew dates in standard format (e.g., "Ûô× ÐÜÕÜ êéäôÔ")
- Gregorian dates as secondary for system processing
- Zmanim (religious times) integration for auction compliance
- Holiday detection with automatic auction restrictions

#### 3. Religious Compliance
Built-in support for Jewish law and customs:
- Sabbath and holiday auction restrictions
- Hebrew numerology (gematria) calculations
- Proper Hebrew name handling with nikud support
- Zmanim-based timing restrictions

## Database Schema (Convex)

The Convex schema in `convex/schema.ts` defines comprehensive bilingual entities:

### Key Tables
- **users**: Role-based access with mandatory Hebrew names
- **synagogues**: Multi-synagogue support with Hebrew calendar settings
- **honors**: Auction items with complete bilingual descriptions
- **auctions**: Active auctions with Hebrew calendar scheduling
- **bids**: Real-time bidding with Hebrew timestamp tracking
- **commitments**: Payment tracking with Hebrew calendar integration
- **hebrewCalendar**: Complete Hebrew calendar with zmanim calculations

### Indexing Strategy
- Performance indexes for user lookups, auctions, and Hebrew calendar
- Dedicated Hebrew indexes for Hebrew text searches
- Cross-language indexes for efficient bilingual queries

## Development Guidelines

### Adding New Features
1. Always include bilingual fields for user-facing content
2. Add Hebrew calendar tracking for time-based entities
3. Include proper indexes for performance
4. Follow existing bilingual component patterns
5. Include RTL-aware styling for Hebrew interfaces

### Code Conventions
- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Use descriptive names that indicate language (e.g., `titleEnglish`, `titleHebrew`)
- Prefer composition over inheritance for bilingual components
- Cache frequently accessed bilingual content

### Testing Requirements
- Test both Hebrew and English language modes
- Test RTL layout rendering
- Test Hebrew calendar calculations
- Include edge cases for Hebrew date conversions

## Environment Setup

The project uses environment variables for configuration. Create `.env.local` based on `.env.example` with:
- Convex deployment URL
- Google OAuth credentials
- Hebrew calendar API keys
- JWT secrets

## Docker Configuration

Two Docker setups available:
- `docker-compose.yml` - Development environment
- `docker-compose.prod.yml` - Production build

Services include frontend, backend, admin, Redis, and optional Nginx.

## Important Notes

- Package manager: pnpm (required for workspace management)
- Node.js version: >= 18.0.0
- All monetary values stored in USD cents for Stripe integration
- Hebrew text stored with full UTF-8 nikud support
- Audit logging required for all sensitive operations
- Role-based access control (gabbai, member, admin)

## Religious and Cultural Considerations

This platform serves the Orthodox Jewish community and must:
- Respect religious customs and restrictions
- Handle Hebrew names and text with cultural sensitivity
- Implement proper Sabbath/holiday restrictions
- Support Hebrew numerology (gematria) for traditional practices
- Provide accurate Hebrew calendar calculations