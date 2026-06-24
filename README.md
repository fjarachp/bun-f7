# chp

A full-stack TypeScript monorepo for Cherry Hill Programs, built on Bun and Turborepo. It pairs an
Effect-powered HTTP API with type-safe tRPC, Drizzle ORM, Better Auth, and two TanStack Start
frontends.

## 📦 What's Inside

### Applications

- **`server`** — Effect HTTP API on Bun (port **3035**). A single Bun web handler built from Effect v4's
  `HttpRouter`, hosting a typed `HttpApi` (health, email, webhooks), the tRPC router at `/api/trpc/*`,
  and Better Auth at `/api/auth/*`.
- **`store`** — TanStack Start storefront (port **3000**), SSR via Vite + Nitro.
- **`admin`** — TanStack Start admin dashboard (port **3001**), SSR via Vite + Nitro.

### Packages

- **`@repo/api`** — tRPC routers and procedures, run on an Effect `ManagedRuntime` of domain services.
- **`@repo/auth`** — Better Auth configuration with the Drizzle adapter (client + server helpers).
- **`@repo/db`** — Drizzle ORM schema, migrations, seeds, and database clients (incl. an Effect SQL layer).
- **`@repo/email`** — React Email templates and SendGrid helpers.
- **`@repo/helpers`** — Cross-cutting utilities (auth, dates, stale-chunk handling).
- **`@repo/i18n`** — Lingui catalogs and locale helpers (en/es/fr).
- **`@repo/ui`** — Shared React component library (shadcn/ui-style, Tailwind v4).
- **`@repo/typescript-config`** — Centralized TypeScript configurations.

## 🧰 Tech Stack

- **Runtime / package manager**: [Bun](https://bun.sh/) (v1.3.14+), Node.js >= 22
- **Monorepo**: [Turborepo](https://turbo.build/repo) with Bun workspaces + catalog
- **API transport**: [Effect](https://effect.website/) v4 HTTP API (`effect/unstable/httpapi`) + [tRPC](https://trpc.io/)
- **Frontend**: [TanStack Start](https://tanstack.com/start/latest) (Vite + Nitro)
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/) (+ `@effect/sql-pg`)
- **Auth**: [Better Auth](https://www.better-auth.com/)
- **UI**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **i18n**: [Lingui](https://lingui.dev/)
- **Email**: [React Email](https://react.email/) + SendGrid
- **Code quality**: [Oxlint](https://oxc.rs/docs/guide/usage/linter) + [Oxfmt](https://oxc.rs/docs/guide/usage/formatter)
- **Containers**: Docker with Bun-optimized multi-stage images

## 🚀 Getting Started

### Prerequisites

- **Bun** v1.3.14+
- **Node.js** v22+
- **Docker** (for local PostgreSQL via `bun run infra:up`)

### Installation

```bash
git clone <repository-url>
cd chp
bun install
```

### Environment Variables

All local environment variables live in a **single repo-root `.env.local`** (gitignored). Each app and
package keeps a `.env.local` symlink to `../../.env.local`, so Vite, Bun, and drizzle-kit resolve the
same values from any working directory. Do **not** create per-package `.env` files.

```bash
# 1. Create your local env from the template
cp .env.example .env.local

# 2. (If missing) recreate the per-workspace symlinks
ln -sf ../../.env.local apps/server/.env.local
ln -sf ../../.env.local apps/store/.env.local
ln -sf ../../.env.local apps/admin/.env.local
ln -sf ../../.env.local packages/db/.env.local
```

Each package validates its own slice of the environment with Zod (`@t3-oss/env-core` for the Vite
client envs). Root scripts load `.env.local` via `dotenv -e .env.local -- turbo run <task>`.

### Database

```bash
# Start / stop local PostgreSQL (compose.yaml)
bun run infra:up
bun run infra:down

# Apply schema changes (the only schema command used in day-to-day dev)
bun run db:push

# Inspect data
bun run db:studio
```

> **Migrations:** `bun run db:push` syncs the schema directly and is the default for local development.
> `bun run db:generate` and `bun run db:migrate` are run intentionally by a maintainer when managing
> versioned migrations.

Local connection string (matches `compose.yaml`):

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/chp
```

### Development

```bash
# Start every app with hot reload
bun run dev

# Or a single app
turbo dev --filter=server   # http://localhost:3035
turbo dev --filter=store    # http://localhost:3000
turbo dev --filter=admin    # http://localhost:3001
```

### Build, Lint, Typecheck

```bash
bun run build          # build all apps and packages
bun run lint           # Oxlint
bun run format         # Oxfmt (write)
bun run format:check   # Oxfmt (check only)
bun run typecheck      # tsgo --noEmit across packages
```

### Internationalization (Lingui)

```bash
bun run lingui:extract   # extract message catalogs from source
bun run lingui:compile   # compile catalogs for runtime
```

### Docker

```bash
# Build all images
bun run docker:build

# Build individual images
bun run docker:build:server
bun run docker:build:store
bun run docker:build:admin

# Run containers (runtime env via --env-file .env.local)
bun run docker:run:server   # http://localhost:3035
bun run docker:run:store    # http://localhost:3000
bun run docker:run:admin    # http://localhost:3001
```

## 🏗️ Project Structure

```text
chp/
├── apps/
│   ├── server/       # Effect HTTP API (Bun) — tRPC, auth, email, webhooks
│   ├── store/        # TanStack Start storefront
│   └── admin/        # TanStack Start admin dashboard
├── packages/
│   ├── api/          # tRPC routers + Effect domain services
│   ├── auth/         # Better Auth (Drizzle adapter)
│   ├── db/           # Drizzle ORM schema, clients, migrations
│   ├── email/        # React Email templates + SendGrid
│   ├── helpers/      # Cross-cutting utilities
│   ├── i18n/         # Lingui catalogs + locale helpers
│   ├── ui/           # Shared React component library
│   └── typescript-config/
├── compose.yaml      # Local PostgreSQL (+ Redis)
├── turbo.json        # Turborepo task graph
├── CLAUDE.md         # AI assistant / contributor guide
└── AGENTS.md         # Repository guidelines
```

## 🔌 Server API Surface

The `server` app exposes one Bun `fetch` handler composed from Effect's `HttpRouter`:

| Route                         | Purpose                                                   |
| ----------------------------- | --------------------------------------------------------- |
| `GET /healthcheck`            | Liveness probe (typed `HttpApi` endpoint)                 |
| `POST /api/email/send`        | Transactional email (gated by `X-Email-Api-Key`)          |
| `POST /api/webhooks/sendgrid` | SendGrid event webhook (raw-body signature verification)  |
| `ALL /api/trpc/*`             | tRPC router (SuperJSON), backed by Effect domain services |
| `ALL /api/auth/*`             | Better Auth handler                                       |

## 📚 Resources

- [Bun](https://bun.sh/docs) · [Turborepo](https://turbo.build/repo/docs) · [Effect](https://effect.website/)
- [TanStack Start](https://tanstack.com/start/latest) · [tRPC](https://trpc.io/) · [Drizzle ORM](https://orm.drizzle.team/)
- [Better Auth](https://www.better-auth.com/) · [Tailwind CSS](https://tailwindcss.com/) · [shadcn/ui](https://ui.shadcn.com/)

## 📄 License

Proprietary — © Cherry Hill Programs.
