# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Turborepo monorepo with three applications and shared packages:

### Applications

- **server** - Effect HTTP API server on Bun, port 3035 (hosts tRPC, Better Auth routes, and email/webhook endpoints)
- **store** - TanStack Start store on port 3000
- **admin** - TanStack Start admin dashboard on port 3001

### Packages

- **@repo/ui** - Shared React component library
- **@repo/typescript-config** - Shared TypeScript configurations
- **@repo/api** - tRPC API layer with type-safe procedures
- **@repo/auth** - Better Auth authentication system with Drizzle adapter (see `packages/auth/README.md` for subdomain cookie auth)
- **@repo/db** - Drizzle ORM database layer with PostgreSQL
- **@repo/helpers** - Cross-cutting utilities

## Package Manager & Runtime

- **Package Manager**: Bun (v1.3.4+)
- **Node Version**: >=22
- **Runtime**: Uses Bun for the server app and for both apps: admin and store

## Common Development Commands

### Root Level Commands (run from project root)

```bash
# Install dependencies
bun install

# Start all apps in development mode
bun run dev
# or
turbo dev

# Build all apps and packages
bun run build
# or
turbo build

# Lint all code using Oxlint
bun run lint
# or
turbo lint

# Format all code using Oxfmt
bun run format
# or
turbo format

# Type check all packages
bun run typecheck
# or
turbo typecheck

# Clean all build artifacts
bun run clean
# or
turbo clean

# Build all Docker images
bun run docker:build
# or
turbo run docker:build

# Build individual Docker images
bun run docker:build:server
bun run docker:build:store
bun run docker:build:admin

# Run Docker containers (pass runtime env via --env-file .env.local)
bun run docker:run:server    # http://localhost:3035
bun run docker:run:store     # http://localhost:3000
bun run docker:run:admin     # http://localhost:3001
```

### Database Commands

```bash
# Start/stop local PostgreSQL (compose.yaml)
bun run infra:up
bun run infra:down

# Apply schema changes to the database — the ONLY db command Claude runs
bun run db:push

# Open Drizzle Studio
bun run db:studio
```

**IMPORTANT:** `bun run db:push` is the only database schema command Claude should run. Do **NOT** run `bun run db:generate` or `bun run db:migrate` — the user handles migration generation and migrations.

### Single App Development

```bash
# Run specific app
turbo dev --filter=server
turbo dev --filter=store
turbo dev --filter=admin

# Build specific app
turbo build --filter=server
turbo build --filter=store
turbo build --filter=admin
```

### Component Generation

```bash
# Generate new React component in @repo/ui
cd packages/ui
turbo gen react-component
```

## Code Quality Tools

- **Linting/Formatting**: Oxlint for linting and Oxfmt for formatting
- **Pre-commit**: Uses lint-staged to lint and format staged files with Oxlint and Oxfmt
- **Git Hooks**: Lefthook configured but currently using example configuration only
- **Oxlint/Oxfmt Config**: Configured to ignore auto-generated files like `routeTree.gen.ts`

## Architecture Notes

### Dependencies Management

- Uses Bun workspaces catalog feature for centralized dependency versions
- React dependencies (react, react-dom, @types/react, @types/react-dom) are managed via the root catalog
- TypeScript version is centrally managed via catalog

### Build Configuration

- TanStack Start app uses Vite for development with Bun target
- Server app uses Bun's hot reload (`bun run --hot`)
- Turbo handles task orchestration and caching
- Docker builds use multi-stage builds for production optimization

### Shared Components

- UI components are in `packages/ui/src/` with direct exports via `./src/*.tsx`
- Components use 'use client' directive for TanStack Start compatibility

### Docker Configuration

- Store app has Bun-optimized Dockerfile with multi-stage build
- Uses `oven/bun:alpine` base image for minimal footprint
- Docker commands integrated with Turbo for orchestrated builds
- Production containers run with non-root user for security

### TypeScript Configuration

- Shared configs in `packages/typescript-config/`
- Base config uses strict mode with modern ES2022 target
- NodeNext module resolution for better ESM compatibility
- App-specific path mappings: `@apps/store/*` for store app, `@apps/admin/*` for admin app

### Import Path Conventions

- **@repo/\*** - Shared packages (ui, auth, db, api, etc.)
- **@apps/store/\*** - Store app internal imports (components, utils, etc.)
- **@apps/admin/\*** - Admin app internal imports (components, utils, etc.)
- Path resolution handled by Vite's native `resolve.tsconfigPaths`
- TypeScript path mappings configured in each app's tsconfig.json

### Environment Variables Configuration

- **Single root `.env.local`** — all local env vars live in the repo-root `.env.local` (gitignored). Copy `.env.example` to `.env.local` to get started.
- **Workspace symlinks** — each app/package that reads env keeps its own `.env.local` symlink to `../../.env.local`, so Vite, Bun, and drizzle-kit load the same values from any cwd. Do **not** add per-package `.env` files.
- **Loaded via dotenv-cli** — root scripts run `dotenv -e .env.local -- turbo run <task>`, so every workspace task sees the same environment.
- **Environment validation** — each package validates its own slice with Zod (`@t3-oss/env-core` for the Vite client envs).
- **Turborepo allow-lists** — `turbo.json` declares which vars each task may read (for cache correctness).

#### File Structure

```text
.env.local                       # single source of truth (gitignored)
.env.example                     # committed template

apps/server/.env.local           → ../../.env.local   (symlink)
apps/store/.env.local            → ../../.env.local   (symlink)
apps/admin/.env.local            → ../../.env.local   (symlink)
packages/db/.env.local           → ../../.env.local   (symlink)
```

Recreate a symlink locally with:

```bash
ln -sf ../../.env.local apps/<app>/.env.local
ln -sf ../../.env.local packages/db/.env.local
```

#### Env Validation Locations

- `apps/server/src/env.ts` — server runtime (Zod)
- `apps/store/src/env/{client,server}.ts` — store client/server env
- `apps/admin/src/env/{client,server}.ts` — admin client/server env
- `packages/auth/src/env.ts` — Better Auth (incl. `AUTH_COOKIE_DOMAIN` for cross-subdomain cookies — see `packages/auth/README.md`)
- `packages/db/src/env.ts` — Drizzle / `db:push`

When adding a variable, update root `.env.local`, `.env.example`, the matching Zod schema, and the relevant task `env` array in `turbo.json`.
