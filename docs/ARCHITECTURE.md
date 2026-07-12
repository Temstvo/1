# Architecture

## Overview

APPI VPN follows Clean Architecture and Domain-Driven Design principles.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Clients                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Web App │  │  Mobile  │  │ Telegram │             │
│  │ (Next.js)│  │  Clients │  │   Bot    │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
│       │              │              │                   │
└───────┼──────────────┼──────────────┼───────────────────┘
        │              │              │
        ▼              ▼              ▼
┌─────────────────────────────────────────────────────────┐
│                   Nginx Reverse Proxy                   │
│              (SSL, Rate Limiting, Caching)              │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────┐
│                   Application Layer                      │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │   Backend    │  │   Frontend   │                    │
│  │   (NestJS)   │  │   (Next.js)  │                    │
│  │              │  │              │                    │
│  │ ┌──────────┐ │  │ ┌──────────┐ │                    │
│  │ │  Auth    │ │  │ │ Dashboard│ │                    │
│  │ │  Module  │ │  │ │  Module  │ │                    │
│  │ ├──────────┤ │  │ ├──────────┤ │                    │
│  │ │  User    │ │  │ │  VPN     │ │                    │
│  │ │  Module  │ │  │ │  Module  │ │                    │
│  │ ├──────────┤ │  │ ├──────────┤ │                    │
│  │ │ Payment  │ │  │ │ Payments │ │                    │
│  │ │  Module  │ │  │ │  Module  │ │                    │
│  │ ├──────────┤ │  │ ├──────────┤ │                    │
│  │ │   VPN    │ │  │ │  Admin   │ │                    │
│  │ │  Module  │ │  │ │  Module  │ │                    │
│  │ ├──────────┤ │  │ └──────────┘ │                    │
│  │ │ Admin    │ │  └──────────────┘                    │
│  │ │  Module  │ │                                      │
│  │ ├──────────┤ │                                      │
│  │ │  ...     │ │                                      │
│  │ └──────────┘ │                                      │
│  └──────┬───────┘                                      │
└─────────┼───────────────────────────────────────────────┘
          │
┌─────────┼───────────────────────────────────────────────┐
│         ▼            Data Layer                         │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │  PostgreSQL   │  │    Redis     │                    │
│  │  (Primary DB) │  │  (Cache/Q)  │                    │
│  └──────────────┘  └──────────────┘                    │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │    MinIO      │  │  BullMQ     │                    │
│  │  (S3 Storage) │  │  (Queues)   │                    │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

## Backend Architecture (NestJS)

The backend follows modular architecture with Clean Architecture principles:

```
apps/backend/src/
├── modules/
│   ├── auth/                # Authentication & authorization
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/      # Passport strategies
│   │   ├── guards/          # Auth guards
│   │   ├── dto/             # Data transfer objects
│   │   └── __tests__/       # Tests
│   ├── users/               # User management
│   ├── profiles/            # User profiles
│   ├── sessions/            # Session management
│   ├── devices/             # Device tracking
│   ├── subscriptions/       # Subscription management
│   ├── plans/               # Pricing plans
│   ├── payments/            # Payment processing
│   ├── invoices/            # Invoice generation
│   ├── vpn/                 # VPN configuration
│   ├── servers/             # Server management
│   ├── traffic/             # Traffic accounting
│   ├── notifications/       # Notifications
│   ├── telegram/            # Telegram integration
│   ├── referrals/           # Referral system
│   ├── coupons/             # Promo codes
│   ├── analytics/           # Analytics & reports
│   ├── support/             # Support tickets
│   ├── admin/               # Admin operations
│   ├── security/            # Security events
│   └── audit/               # Audit logging
├── common/
│   ├── decorators/          # Custom decorators
│   ├── filters/             # Exception filters
│   ├── guards/              # Global guards
│   ├── interceptors/        # Request interceptors
│   ├── middleware/           # Middleware
│   └── pipes/               # Validation pipes
├── config/                  # Configuration
├── database/                # Prisma service & migrations
└── main.ts                  # Application entry
```

## Frontend Architecture (Next.js)

```
apps/frontend/src/
├── app/                     # App Router pages
│   ├── (auth)/              # Auth pages (login, register)
│   ├── (dashboard)/         # Dashboard pages
│   ├── (marketing)/         # Public pages (landing, pricing)
│   └── layout.tsx
├── components/
│   ├── ui/                  # Shadcn UI components
│   ├── shared/              # Shared components
│   ├── auth/                # Auth components
│   ├── dashboard/           # Dashboard components
│   └── vpn/                 # VPN-specific components
├── hooks/                   # Custom React hooks
├── lib/                     # Utilities
├── stores/                  # State management
├── types/                   # TypeScript types
└── styles/                  # Global styles
```

## Data Flow

1. **Client Request** → Nginx → Backend/Frontend
2. **Authentication** → JWT validation → Route guard
3. **Business Logic** → Service → Repository → Database
4. **Background Jobs** → BullMQ → Worker → Database
5. **Real-time Updates** → WebSocket → Event emitter
6. **External Integrations** → Payment providers / Telegram / Email

## Security Layers

1. **Network** - Nginx rate limiting, IP blocking
2. **Transport** - TLS/SSL encryption
3. **Application** - Helmet, CORS, CSRF protection
4. **Authentication** - JWT with refresh tokens, Argon2 passwords
5. **Authorization** - RBAC (User, Moderator, Support, Admin, SuperAdmin)
6. **Data** - Input validation, SQL injection protection
7. **Audit** - Complete audit logging

## Scalability Strategy

- Horizontal scaling via Docker containers
- Database connection pooling (PgBouncer)
- Redis caching layer
- CDN for static assets
- Load balancing across multiple instances
- Database read replicas (future)
- Microservice extraction (future)
