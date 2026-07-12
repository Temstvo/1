FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

# ============================================
# BUILD
# ============================================
FROM base AS builder
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/telegram-bot/package.json apps/telegram-bot/
COPY packages/shared/package.json packages/shared/

RUN pnpm install --frozen-lockfile

COPY apps/telegram-bot/ apps/telegram-bot/
COPY packages/shared/ packages/shared/
COPY turbo.json .

RUN pnpm --filter @appi/telegram-bot build

# ============================================
# PRODUCTION
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/apps/telegram-bot/dist ./dist
COPY --from=builder /app/apps/telegram-bot/node_modules ./node_modules

USER nestjs

CMD ["node", "dist/main.js"]
