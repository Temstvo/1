# APPI VPN

Production-ready SaaS VPN platform with subscriptions, payments, Telegram bot, admin panel, and multi-protocol VPN infrastructure.

## Features

- **Multi-protocol VPN**: WireGuard, OpenVPN, Xray Reality, VLESS
- **Subscription plans**: Free trial, Basic, Pro, Premium
- **Payment processing**: Stripe, Cryptocurrency, Telegram
- **Telegram bot**: Manage subscriptions, quick connect
- **Admin panel**: Full dashboard with user/server/payment management
- **Monitoring**: Prometheus, Grafana, Loki, Alertmanager

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, TailwindCSS |
| Backend | NestJS, TypeScript, Prisma ORM |
| Database | PostgreSQL 16, Redis 7 |
| VPN | WireGuard, OpenVPN, Xray Reality, VLESS |
| Bot | Telegraf (Telegram) |
| Infrastructure | Docker, Nginx, Prometheus, Grafana |

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm
- Docker & Docker Compose

### Development

```bash
# Install dependencies
pnpm install

# Start infrastructure
docker-compose up -d

# Run migrations
pnpm --filter @appi/backend exec prisma migrate dev

# Start development servers
pnpm run dev
```

### Production

```bash
# Configure environment
cp .env.production .env
# Edit .env with your settings

# Deploy
./scripts/deploy.sh

# Run migrations
./scripts/migrate.sh
```

## Project Structure

```
appi-vpn/
├── apps/
│   ├── frontend/          # User app (port 3001)
│   ├── backend/           # API server (port 3000)
│   ├── admin/             # Admin panel (port 3002)
│   ├── landing/           # Landing page (port 3003)
│   └── telegram-bot/      # Telegram bot
├── packages/
│   ├── ui/                # Shared UI components
│   ├── shared/            # Shared utilities
│   ├── sdk/               # API client SDK
│   └── configs/           # Shared configs
├── docker/                # Docker configurations
├── scripts/               # Deployment scripts
└── docs/                  # Documentation
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Testing](docs/TESTING.md)
- [Security](docs/SECURITY_AUDIT.md)
- [Launch Checklist](docs/LAUNCH_CHECKLIST.md)
- [Release Notes](docs/RELEASE_NOTES.md)

## License

Private - All rights reserved.
