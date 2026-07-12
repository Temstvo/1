FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

# ============================================
# BUILD
# ============================================
FROM base AS builder
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/landing/package.json apps/landing/
COPY packages/ui/package.json packages/ui/
COPY packages/shared/package.json packages/shared/

RUN pnpm install --frozen-lockfile

COPY apps/landing/ apps/landing/
COPY packages/ui/ packages/ui/
COPY packages/shared/ packages/shared/
COPY turbo.json .

RUN pnpm --filter @appi/landing build

# ============================================
# PRODUCTION
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/landing/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/landing/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/landing/.next/static ./.next/static

USER nextjs

EXPOSE 3003

ENV PORT=3003
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
