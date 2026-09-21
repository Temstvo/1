FROM node:22-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV HUSKY=0
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @appi/backend exec prisma generate
RUN pnpm --filter @appi/backend build
RUN pnpm --filter @appi/backend deploy --prod /out
RUN cd /out && node node_modules/prisma/build/index.js generate

FROM node:22-bookworm-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=build --chown=node:node /out/node_modules ./node_modules
COPY --from=build --chown=node:node /out/dist ./dist
COPY --from=build --chown=node:node /out/prisma ./prisma
COPY --from=build --chown=node:node /out/scripts ./scripts
COPY --from=build --chown=node:node /out/package.json ./package.json
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
