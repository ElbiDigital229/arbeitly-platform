# Stage 1: Install dependencies
FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Stage 2: Build
FROM oven/bun:1-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bunx prisma generate
RUN bun build ./src/server.ts --outdir ./dist --target bun

# Stage 3: Runner
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY package.json ./

EXPOSE 3000

CMD ["bun", "run", "src/server.ts"]
