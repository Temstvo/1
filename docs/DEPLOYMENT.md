# Deployment Guide

## Prerequisites

- Docker 24+
- Docker Compose v2+
- Domain name with DNS configured
- SSL certificates (or Let's Encrypt)

## Production Deployment

### 1. Clone and Configure

```bash
git clone https://github.com/Temstvo/1
cd 1

# Configure environment
cp .env.example .env.production
# Edit .env.production with production values
```

### 2. SSL Certificates

Place your SSL certificates in `docker/nginx/ssl/`:

```
docker/nginx/ssl/
├── fullchain.pem
├── privkey.pem
└── dhparam.pem
```

For Let's Encrypt, use certbot:
```bash
certbot certonly --standalone -d api.appi-vpn.com -d appi-vpn.com -d admin.appi-vpn.com
```

### 3. Update Nginx for SSL

Edit `docker/nginx/nginx.conf` to enable HTTPS server blocks.

### 4. Start Services

```bash
# Production mode
docker compose -f docker-compose.yml up -d

# Or with monitoring
docker compose up -d
```

### 5. Database Migration

```bash
# Run Prisma migrations
docker compose exec backend npx prisma migrate deploy
```

### 6. Verify

```bash
# Check all services
docker compose ps

# Check logs
docker compose logs -f

# Health check
curl http://localhost/health
```

## Environment Variables

See `.env.example` for all required variables. Critical production variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | JWT signing secret (64+ chars) |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `STRIPE_SECRET_KEY` | Stripe API key |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token |
| `SENTRY_DSN` | Sentry error tracking |

## Backup Strategy

### Database

```bash
# Manual backup
docker compose exec postgres pg_dump -U postgres appi_vpn > backup.sql

# Restore
docker compose exec postgres psql -U postgres appi_vpn < backup.sql
```

### Automated Backups

Configure cron job or GitHub Actions backup workflow.

## Monitoring

Access monitoring dashboards:
- Grafana: http://localhost:3003
- Prometheus: http://localhost:9090

## Scaling

### Horizontal Scaling

```bash
# Scale backend instances
docker compose up -d --scale backend=3

# Scale frontend instances
docker compose up -d --scale frontend=3
```

### Database Scaling

Consider:
- PgBouncer for connection pooling
- Read replicas for read-heavy operations
- Connection pooling via Prisma

## Rollback

```bash
# Rollback to previous version
git checkout <previous-tag>
docker compose up -d --build
docker compose exec backend npx prisma migrate deploy
```

## Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
