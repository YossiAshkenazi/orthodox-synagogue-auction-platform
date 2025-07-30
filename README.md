# Orthodox Synagogue Honor Auction Platform

> Modern web application for Orthodox synagogue honor auctions with comprehensive Hebrew/English bilingual support and Jewish calendar integration

## 🎯 Project Overview

This platform modernizes the traditional practice of selling synagogue honors (mitzva sales) during Jewish holidays while preserving religious authenticity through:

- **Complete Bilingual Functionality**: Every UI element available in Hebrew and English
- **Hebrew Calendar Integration**: Comprehensive Jewish calendar system with holiday awareness
- **Real-time Bidding**: Live auction system with Hebrew numerology support
- **Religious Compliance**: Sabbath/holiday restrictions and halakhic considerations

## 🏗️ Monorepo Structure

```
orthodox-synagogue-auction-platform/
├── apps/
│   ├── frontend/              # React app with bilingual UI
│   ├── backend/               # NestJS API server
│   └── admin/                 # Admin dashboard
├── packages/
│   ├── shared/                # Shared utilities and types
│   ├── hebrew-calendar/       # Hebrew calendar services
│   ├── ui-components/         # Bilingual UI component library
│   └── config/                # Shared configurations
├── convex/                    # Convex database schema and functions
├── docs/                      # Documentation
├── docker/                    # Docker configurations
└── tools/                     # Development tools and scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- pnpm (recommended package manager)

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/YossiAshkenazi/orthodox-synagogue-auction-platform.git
   cd orthodox-synagogue-auction-platform
   pnpm install
   ```

2. **Start development environment:**
   ```bash
   # Start all services with Docker
   docker-compose up -d
   
   # Or run individual services
   pnpm dev:frontend    # React app (port 3000)
   pnpm dev:backend     # NestJS API (port 3001)
   pnpm dev:convex      # Convex dev server
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

## 🌟 Core Features (PoC)

### ✅ Implemented
- [x] Bilingual UI foundation (Hebrew/English)
- [x] RTL support for Hebrew interface
- [x] Basic Hebrew calendar integration
- [x] User authentication with Google OAuth
- [x] Real-time auction bidding system
- [x] Hebrew numerology calculations
- [x] Convex database with bilingual schema

### 🚧 In Development
- [ ] Advanced Hebrew calendar features
- [ ] Auction management interface
- [ ] Mobile responsive design
- [ ] Payment processing integration
- [ ] Admin dashboard

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start all development servers
pnpm dev:frontend     # Frontend only
pnpm dev:backend      # Backend only
pnpm dev:convex       # Convex development

# Build
pnpm build            # Build all apps
pnpm build:frontend   # Build frontend only
pnpm build:backend    # Build backend only

# Testing
pnpm test             # Run all tests
pnpm test:frontend    # Frontend tests
pnpm test:backend     # Backend tests
pnpm test:e2e         # End-to-end tests

# Linting & Formatting
pnpm lint             # Lint all code
pnpm format           # Format all code
pnpm type-check       # TypeScript checking
```

### Docker Development

```bash
# Full development environment
docker-compose up -d

# Individual services
docker-compose up frontend backend convex

# Production build
docker-compose -f docker-compose.prod.yml up -d
```

## 📖 Documentation

- [📋 Project Overview](./docs/01-project-overview.md)
- [🏗️ Architecture Guide](./docs/02-architecture.md)
- [🌐 Bilingual Implementation](./docs/03-bilingual-features.md)
- [📅 Hebrew Calendar Integration](./docs/04-hebrew-calendar.md)
- [🔒 Security & Authentication](./docs/05-security.md)
- [🚀 Deployment Guide](./docs/06-deployment.md)
- [🧪 Testing Strategy](./docs/07-testing.md)
- [📊 API Documentation](./docs/08-api-reference.md)

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **TailwindCSS** with RTL support
- **i18next** for internationalization
- **Socket.io-client** for real-time updates

### Backend
- **NestJS** with TypeScript
- **Socket.io** for WebSocket communication
- **Passport** for authentication
- **Class-validator** for validation

### Database & Real-time
- **Convex** for reactive database
- **Real-time subscriptions** out of the box
- **Automatic schema migrations**

### Development Tools
- **Docker** for containerization
- **pnpm** for efficient package management
- **ESLint & Prettier** for code quality
- **Husky** for git hooks
- **Turborepo** for monorepo management

## 🌍 Hebrew & Internationalization

### Language Support
- **Hebrew (עברית)**: Right-to-left UI with proper text rendering
- **English**: Left-to-right interface
- **Instant switching**: Toggle between languages without reload

### Hebrew Calendar Features
- **Hebcal API integration** for accurate Hebrew dates
- **Holiday detection** with auction restrictions
- **Zmanim calculations** for religious compliance
- **Hebrew numerology** (Gematria) for bid suggestions

## 🔐 Security & Compliance

- **Google OAuth 2.0** authentication
- **Role-based access control** (Admin, Gabbai, Member)
- **Data encryption** at rest and in transit
- **GDPR compliance** for EU users
- **PCI DSS considerations** for payment processing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- All new features must support both Hebrew and English
- Follow the established bilingual component patterns
- Include RTL-aware styling for Hebrew interfaces
- Add appropriate TypeScript types
- Write tests for new functionality

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hebcal.com** for Hebrew calendar API
- **Orthodox Jewish communities** for requirements and feedback
- **Open source contributors** who make this project possible

## 📞 Support

For questions, issues, or feature requests:
- [Open an issue](https://github.com/YossiAshkenazi/orthodox-synagogue-auction-platform/issues)
- [Discussions](https://github.com/YossiAshkenazi/orthodox-synagogue-auction-platform/discussions)

---

**Built with ❤️ for the Orthodox Jewish community**
