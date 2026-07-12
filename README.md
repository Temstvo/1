# APPI VPN

**Private Internet. Without Limits.**

A production-ready SaaS VPN platform with subscriptions, payments, Telegram bot, admin panel, and multi-protocol VPN infrastructure.

## Features

- Multi-protocol VPN support (WireGuard, OpenVPN, Xray Reality, VLESS)
- Subscription management with multiple payment providers
- Telegram bot integration
- Admin dashboard with analytics
- Server health monitoring and load balancing
- Referral and affiliate system
- Multi-language support (EN, RU, DE, FR, ES)
- Dark/Light theme
- PWA support
- Responsive design
- Comprehensive security (OWASP Top 10)

## Tech Stack

### Frontend

- Next.js 15
- React 19
- TypeScript
- TailwindCSS
- Shadcn UI
- Framer Motion
- TanStack Query
- React Hook Form + Zod

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL 16
- Redis 7
- BullMQ
- Passport + JWT

### Infrastructure

- Docker + Docker Compose
- Turborepo (monorepo)
- pnpm workspaces
- Nginx reverse proxy
- Prometheus + Grafana + Loki
- GitHub Actions CI/CD

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker + Docker Compose

### Installation

```bash
# Clone repository
git clone https://github.com/Temstvo/1
cd 1

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.development

# Start Docker services
docker compose up -d

# Start development servers
pnpm dev
```

### Environment Setup

1. Copy `.env.example` to `.env.development`
2. Fill in required environment variables
3. At minimum, set:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`

## Project Structure

```
appi-vpn/
├── apps/
│   ├── frontend/          # Next.js user application
│   ├── backend/           # NestJS API server
│   ├── admin/             # Next.js admin panel
│   ├── landing/           # Next.js landing page
│   └── telegram-bot/      # Telegram bot service
├── packages/
│   ├── ui/                # Shared UI components
│   ├── shared/            # Shared utilities and types
│   ├── sdk/               # API client SDK
│   └── configs/           # Shared configurations
├── docker/
│   ├── nginx/             # Nginx configuration
│   ├── postgres/          # PostgreSQL init scripts
│   ├── redis/             # Redis configuration
│   └── monitoring/        # Prometheus, Grafana configs
├── scripts/               # Build and deployment scripts
├── docs/                  # Documentation
├── monitoring/            # Monitoring configurations
└── .github/               # GitHub Actions, templates
```

## Development

```bash
# Start all services
pnpm dev

# Run specific app
pnpm --filter frontend dev
pnpm --filter backend dev
pnpm --filter admin dev

# Lint
pnpm lint

# Type check
pnpm typecheck

# Test
pnpm test

# Build
pnpm build

# Clean
pnpm clean
```

## Docker

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Rebuild
docker compose up -d --build
```

Services:
- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- Admin: http://localhost:3002
- Nginx: http://localhost:80
- Grafana: http://localhost:3003
- Prometheus: http://localhost:9090
- MinIO: http://localhost:9001

## API Documentation

Once the backend is running, access Swagger documentation at:

```
http://localhost:3000/api/docs
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

Proprietary. All rights reserved.
