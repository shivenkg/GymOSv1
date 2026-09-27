# =====================================================================
# GymOS Multi-Stage Production Dockerfile
# =====================================================================

# Stage 1: Builder
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies first for optimal Docker layer caching
COPY package*.json ./
RUN npm ci

# Copy full application source
COPY . .

# Build Vite frontend and production server
RUN npm run build
RUN npm run build:server

# Prune devDependencies for production runtime
RUN npm prune --production

# =====================================================================
# Stage 2: Production Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create unprivileged application user
RUN addgroup -S gymos && adduser -S gymos -G gymos

# Copy node_modules and built artifacts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/server.ts ./server.ts

# Set non-root ownership
RUN chown -R gymos:gymos /app
USER gymos

EXPOSE 3000

# Health check verified against native Express /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["npm", "run", "start"]
