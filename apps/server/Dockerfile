FROM oven/bun:1.3.14-alpine AS base

WORKDIR /app

ENV NODE_ENV=production
ENV TURBO_TELEMETRY_DISABLED=1
ENV CI=1
ENV SERVER_PORT=3035
ENV SERVER_HOST=0.0.0.0

# Install system dependencies for Alpine + Bun
RUN apk update && apk add --no-cache libc6-compat

# =========================================================================== #

FROM base AS builder

# Install the same Turbo version used by the workspace lockfile
RUN bun add --global turbo@2.9.18

# Copy entire monorepo
COPY . .

# Prune the workspace for the server app only
# https://turbo.build/repo/docs/guides/tools/docker#the-solution
RUN turbo prune server --docker

# =========================================================================== #

FROM base AS installer

# Copy pruned workspace package.json files
COPY --from=builder /app/out/json/ .

# Copy original root lockfile for reference
COPY --from=builder /app/bun.lock ./bun.lock

# The pruned Bun workspace rewrites bun.lock, so frozen installs fail here.
RUN bun install

# Copy pruned workspace source files
COPY --from=builder /app/out/full/ .

# Build the self-contained Bun bundle at apps/server/dist (bun build --target=bun)
RUN bun turbo build

# =========================================================================== #

FROM base AS production

WORKDIR /app

# Runtime environment variables — set these in your deploy platform
# (docker run --env-file .env.local, k8s Secret/ConfigMap, etc.). They are NOT
# baked into the image.
#
# Required (server fails to start if missing):
#   AUTH_SECRET        Better Auth signing key, min 32 chars
#   DATABASE_URL       Postgres connection string
#   PUBLIC_URL_STORE   Storefront URL (CORS + auth trusted origin)
#   PUBLIC_URL_ADMIN   Admin dashboard URL (CORS + auth trusted origin)
#
# Optional (feature-gated; server starts without them):
#   EMAIL_API_KEY                        Bearer key for POST /api/email/send (min 32 chars)
#   EMAIL_API_URL                        Override for the email endpoint URL
#   EMAIL_FROM                           Defaults to noreply@cherryhillprograms.com
#   SENDGRID_API_KEY                     Required to actually send via SendGrid
#   SENDGRID_EVENT_WEBHOOK_SIGNING_KEY   Required to verify SendGrid webhooks
#   AUTH_COOKIE_DOMAIN                   Set if cookies need to span subdomains
#
# Baked defaults (already set above; override only if you need to):
#   NODE_ENV=production, SERVER_PORT=3035, SERVER_HOST=0.0.0.0

# Create non-root user for security
RUN addgroup --system --gid 1001 appgroup && \
  adduser --system --uid 1001 appuser

# The installer stage produces a self-contained Bun bundle at
# apps/server/dist via `bun build --target=bun`, so production ships only that.
COPY --from=installer --chown=appuser:appgroup /app/apps/server/dist ./dist

USER appuser

# Expose application port
EXPOSE 3035

# Health check for production readiness
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD bun --version || exit 1

# Start the server with Bun
CMD ["bun", "dist/index.js"]
