# APPI VPN - Release Notes

## v1.0.0 (2026-07-12)

### Initial Production Release

#### Features

**Authentication System**
- User registration with email verification
- Login with JWT access/refresh tokens
- OAuth: Google and GitHub
- Password reset flow
- Brute force protection
- Role-based access control (RBAC)

**User Platform**
- Subscription management (create, cancel, change plan)
- Device management (list, remove)
- Traffic monitoring (current, history, statistics)
- Notifications (list, read, delete)
- Invoice history
- Referral program
- Profile settings

**VPN Core**
- Multi-protocol support (WireGuard, OpenVPN, Xray Reality, VLESS)
- Server selection with health stats
- Config generation and QR codes
- Connection tracking
- Traffic accounting

**Payments**
- Stripe integration (checkout, webhooks, refunds)
- Coupon system (percentage, fixed, free days)
- Referral commission tracking
- Invoice generation

**Telegram Bot**
- Subscription management via bot
- Quick connect to VPN servers
- Account status and traffic info
- Support ticket creation

**Admin Panel**
- Dashboard with platform stats
- User management (list, ban, suspend)
- Server management (health, enable/disable)
- Subscription management
- Payment management and refunds
- Coupon management
- Support ticket management
- System settings

**Infrastructure**
- Docker Compose production setup
- Prometheus monitoring with 9 alerting rules
- Grafana dashboards
- Loki log aggregation
- Alertmanager with Slack/PagerDuty
- Nginx HTTPS with rate limiting
- Automated backups

**Quality Assurance**
- Unit tests for all services
- E2E tests for API endpoints
- Load testing with Artillery
- Security audit checklist

### Tech Stack

- **Frontend:** Next.js 15, React 19, TailwindCSS
- **Backend:** NestJS, Prisma ORM
- **Database:** PostgreSQL 16, Redis 7
- **Infrastructure:** Docker, Nginx, Prometheus, Grafana
- **VPN:** WireGuard, OpenVPN, Xray Reality, VLESS

### Environment Requirements

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16
- Redis 7
- Domain with SSL certificates

### Deployment

1. Clone repository
2. Configure `.env.production`
3. Run `./scripts/deploy.sh`
4. Run `./scripts/migrate.sh`

### Links

- Frontend: https://appi-vpn.com
- Admin: https://admin.appi-vpn.com
- API: https://api.appi-vpn.com
- Monitoring: https://monitoring.appi-vpn.com
