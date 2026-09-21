FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV HUSKY=0 NEXT_TELEMETRY_DISABLED=1 BUILD_STANDALONE=true
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @appi/frontend build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3001 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/apps/frontend/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=build --chown=node:node /app/apps/frontend/public ./apps/frontend/public
USER node
EXPOSE 3001
CMD ["node", "apps/frontend/server.js"]
