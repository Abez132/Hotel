# ── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# ── Stage 2: builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate
RUN npm run build

# ── Stage 3: runner ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Next.js standalone output
COPY --from=builder /app/public            ./public
COPY --from=builder /app/.next/standalone  ./
COPY --from=builder /app/.next/static      ./.next/static

# Copy full node_modules so Prisma's wasm/binary files are all present
COPY --from=builder /app/node_modules      ./node_modules

# Prisma schema + migrations (needed by migrate deploy)
COPY --from=builder /app/prisma            ./prisma

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "until ./node_modules/.bin/prisma migrate deploy; do echo 'DB not ready, retrying in 3s...'; sleep 3; done && node server.js"]
