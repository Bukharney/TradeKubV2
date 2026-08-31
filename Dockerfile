# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Accept the API URL as a build-time argument so the React app can be
# configured at image build time (REACT_APP_* vars are baked in at build).
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8 --activate

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

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
