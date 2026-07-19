FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

# ============================================
# BUILD
# ============================================
FROM base AS builder
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/backend/prisma apps/backend/prisma/
COPY packages/shared/package.json packages/shared/

RUN pnpm install --frozen-lockfile

COPY apps/backend/ apps/backend/
COPY packages/shared/ packages/shared/
COPY turbo.json .

RUN pnpm --filter @appi/backend build
RUN pnpm --filter @appi/backend prisma generate

# ============================================
# PRODUCTION
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/backend/node_modules ./node_modules

USER nestjs

EXPOSE 3000

CMD ["sh", "-c", "timeout 30 npx prisma db push --skip-generate || echo 'Schema push skipped' && node dist/main.js"]
