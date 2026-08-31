# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# Copy the rest of the source and build
COPY . .

# Disable the CRA ESLint plugin (jest/globals incompatibility with newer eslint-plugin-jest)
ENV DISABLE_ESLINT_PLUGIN=true

RUN pnpm build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:stable-alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built React app from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx config for SPA routing (handles client-side routes)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script that injects runtime env vars into env-config.js
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

# Use entrypoint to generate env-config.js from runtime env vars, then start nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
