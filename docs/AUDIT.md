# Appi VPN: initial audit

Baseline: `7799d8159f86fb5fbc2d3fea02a81003df323c47` (main).

## Architecture before changes

- pnpm/Turbo monorepo. NestJS API :3000; Next.js site :3001; separate Next.js admin :3002; NestJS/Telegraf bot. Shared TypeScript packages and optional Cloudflare proxy.
- PostgreSQL/Prisma stores accounts, Argon2 passwords, JWT sessions, plans, subscriptions, payments, servers, user configurations, shared imported configurations, Telegram links and audit records.
- Browser Axios used a hardcoded external proxy. Public site only linked to a bot; registration, dashboard and checkout routes were absent. Admin pages contained mock arrays and an empty login handler.
- Email/password and optional OAuth issued JWTs. Registration created no session; JWT validation ignored session revocation; refresh selected any active session for a user.
- Checkout created a pending subscription. YooKassa/Cryptomus callbacks updated payment then subscription in separate operations. Renewal replaced the end date. Telegram wallet links had no verifiable confirmation. Stripe callbacks had no corresponding checkout flow.
- VPN was split between imported shared VLESS links and a generator for WireGuard/OpenVPN/Xray. The generator invented server parameters and never provisioned peers/users. Public config and Telegram endpoints bypassed subscription and expiration checks. Public growth endpoints could grant time and premium.
- Marzban/Xray was not previously integrated. Existing TCP/2ip probes were not proof of an authenticated VPN tunnel.
- No tracked Prisma migrations. Runtime DDL, custom PG array adapter, disabled TLS verification and suppressed DB startup failures. Base Compose referenced nonexistent app services; Docker build order and pnpm symlink copying were broken.
- Existing unit tests use mocks. Several E2E files have invalid imports/routes or assume preexisting remote data; they were not included by the normal Jest pattern.
- Optional integrations: Resend, Telegram, YooKassa, Cryptomus, Stripe fragments, remote GitHub config feeds, 2ip; Redis/MinIO/monitoring were declared but not needed by the core workflow.

## Critical findings and remediation direction

1. Replace unverifiable/fake payment paths with one supported provider. YooKassa fits the existing RUB plan catalogue; verify notifications by authenticated lookup (official API), compare immutable order fields, and commit billing atomically under a per-user DB lock.
2. Retain the existing stack/schema; add tracked baseline + incremental migrations, session binding, durable VPN desired state and a real management API integration.
3. Shared leaked credentials cannot enforce individual paid access. Disable old public distribution and rotate exposed credentials. Use Marzban-managed VLESS Reality accounts and remote expiration; persist encrypted config only after validated provider response.
4. Remove fake admin data and connect real guarded APIs; restore browser registration, login, checkout, account and payment history.
5. Replace startup workarounds and unsafe defaults, configure restrictive CORS/rate limiting, redact sensitive URLs, restore TLS validation, and test against an isolated real PostgreSQL database.

Final execution evidence, limitations and production checklist are in `VERIFICATION.md` and the README. No actual VPN tunnel or paid transaction can be certified from a mocked provider contract.
