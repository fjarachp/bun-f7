# TODO

## 🚀 Priority 1 - Core Infrastructure

### Full-Stack Framework

- [x] **Add TanStack Start** ✅ _COMPLETED_
  - [x] Install TanStack Start dependencies
  - [x] Configure TanStack Router for file-based routing
  - [x] Setup SSR/SSG configuration
  - [x] Create initial routes and components
  - [x] Configure shared layouts and error boundaries
  - [x] Setup formatter/linter config to ignore auto-generated files
  - _Complexity: High_
  - _Reference: <https://tanstack.com/start/latest>_
  - _Status: Store app created with TanStack Start_

### API Layer

- [ ] **Setup API Package with tRPC**
  - [ ] Create new `packages/api` workspace
  - [ ] Install and configure tRPC server
  - [ ] Setup tRPC client for web and docs apps
  - [ ] Define initial API routers and procedures
  - [ ] Configure type-safe API calls between apps
  - [ ] Add API validation with Zod (already in catalog)
  - _Complexity: Medium_
  - _Reference: <https://trpc.io/>_

### Database Layer

- [x] **Create DB Package with Drizzle** ✅ _COMPLETED_
  - [x] Create new `packages/db` workspace
  - [x] Install Drizzle ORM and Drizzle Kit
  - [x] Setup PostgreSQL connection config
  - [x] Define initial schema models (auth and todos)
  - [x] Configure migrations system
  - [x] Add Docker Compose for local PostgreSQL
  - [x] Setup Drizzle Studio for DB management
  - _Complexity: Medium_
  - _Reference: <https://orm.drizzle.team/>_
  - _Status: Complete with auth and todo schemas, migrations, and Docker setup_

### Authentication Layer

- [x] **Create Auth Package with Better Auth** ✅ _COMPLETED_
  - [x] Create new `packages/auth` workspace
  - [x] Install Better Auth dependencies
  - [x] Configure Better Auth server
  - [x] Setup Drizzle adapter for Better Auth
  - [x] Define auth schema and user models
  - [x] Configure session management
  - [x] Setup email/password authentication
  - [ ] Add OAuth providers (Google, GitHub, etc.)
  - [ ] Implement auth middleware for tRPC
  - [ ] Create auth hooks for React apps
  - [ ] Setup email verification flow
  - [ ] Add password reset functionality
  - [ ] Configure two-factor authentication (optional)
  - _Complexity: Medium-High_
  - _Reference: <https://www.better-auth.com/>_
  - _Status: Core auth package created with Better Auth, Drizzle adapter, and consistent TypeScript configuration_

### Containerization

- [x] **Docker Setup with Bun** 🚧 _IN PROGRESS_
  - [x] Create Dockerfile for store app (Bun-optimized)
  - [x] Setup multi-stage builds for production
  - [x] Configure Docker commands in package.json and turbo.json
  - [ ] Create Dockerfile for server app
  - [x] Setup compose.yaml for local development
  - [ ] Add .dockerignore files
  - [ ] Setup Docker health checks
  - _Complexity: Medium_
  - _Status: Store app Dockerfile completed with Bun optimization_

## 📦 Priority 2 - Development Experience

### Environment Configuration

- [x] **Environment Variables Management** ✅ _COMPLETED_
  - [x] Setup package-specific `.env` files following Turborepo best practices
  - [x] Configure environment validation with Zod in each package
  - [x] Remove root-level `.env` file to prevent variable leakage
  - [x] Update `turbo.json` with environment variable configuration per task
  - [x] Document all required environment variables with `.env.example` files
  - [x] Update `.gitignore` to properly ignore package-specific `.env` files
  - _Complexity: Low_
  - _Status: Complete implementation following Turborepo best practices with Zod validation_

### Testing Infrastructure

- [ ] **Setup Testing Framework**
  - [ ] Configure Vitest for unit testing
  - [ ] Setup Playwright for E2E testing
  - [ ] Add React Testing Library for component tests
  - [ ] Configure test coverage reporting
  - [ ] Add pre-commit test hooks
  - _Complexity: Medium_

### CI/CD Pipeline

- [ ] **GitHub Actions Setup**
  - [ ] Create workflow for PR checks (lint, type-check, test)
  - [ ] Setup build and deploy workflow
  - [ ] Configure caching for Bun and Turbo
  - [ ] Add security scanning (dependencies, secrets)
  - [ ] Setup automatic dependency updates
  - _Complexity: Medium_

## 🔧 Priority 3 - Production Ready

### Authentication & Authorization

- [ ] **Auth System Implementation** (Using Better Auth Package)
  - [ ] Integrate `packages/auth` with web and docs apps
  - [ ] Setup protected routes and middleware
  - [ ] Implement role-based access control (RBAC)
  - [ ] Configure rate limiting for auth endpoints
  - [ ] Setup auth analytics and monitoring
  - [ ] Add social login UI components
  - [ ] Implement remember me functionality
  - [ ] Configure JWT token refresh strategy
  - _Complexity: Medium_ (leveraging auth package)

### Monitoring & Observability

- [ ] **Setup Monitoring**
  - [ ] Configure error tracking (Sentry/Rollbar)
  - [ ] Setup performance monitoring
  - [ ] Add structured logging with Pino
  - [ ] Configure OpenTelemetry for tracing
  - [ ] Setup uptime monitoring
  - _Complexity: Medium_

### Deployment Configuration

- [ ] **Production Deployment**
  - [ ] Configure Vercel deployment for web/docs
  - [ ] Setup server deployment (Railway/Fly.io/Docker)
  - [ ] Configure CDN for static assets
  - [ ] Setup domain and SSL certificates
  - [ ] Configure production environment variables
  - [ ] Setup database hosting and backups
  - _Complexity: High_

## 🎨 Priority 4 - Enhancements

### UI/UX Improvements

- [ ] **Enhance UI Components**
  - [ ] Expand shadcn/ui component library
  - [ ] Add Framer Motion animations
  - [ ] Implement dark/light theme toggle
  - [ ] Add loading states and skeletons
  - [ ] Create design system documentation
  - _Complexity: Medium_

### Performance Optimization

- [ ] **Optimize Performance**
  - [ ] Implement code splitting strategies
  - [ ] Setup image optimization pipeline
  - [ ] Configure Turbopack optimizations
  - [ ] Add bundle size monitoring
  - [ ] Implement caching strategies
  - _Complexity: Medium_

### Developer Tools

- [ ] **Additional Tooling**
  - [ ] Setup Storybook for component development
  - [ ] Add GraphQL Code Generator (if using GraphQL)
  - [ ] Configure API documentation generation
  - [ ] Setup database GUI tools
  - [ ] Add performance profiling tools
  - _Complexity: Low_

## 📝 Notes

### Current Stack

- **Runtime**: Bun (server), Node.js (TanStack Start)
- **Framework**: TanStack Start (store), Hono (server)
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Package Manager**: Bun workspaces
- **Build Tool**: Turborepo
- **Code Quality**: Oxlint and Oxfmt

### Repository Structure

```
mono/
├── apps/
│   ├── server/    # API server (Bun + Hono)
│   └── store/     # TanStack Start app ✅ (+ Dockerfile 🐳)
├── packages/
│   ├── ui/        # Shared components
│   ├── typescript-config/
│   ├── api/       # [TO CREATE] tRPC API
│   ├── auth/      # ✅ Better Auth with Drizzle adapter
│   └── db/        # ✅ Drizzle ORM with PostgreSQL
└── compose.yaml # ✅ PostgreSQL and Redis development setup
```

### Resources

- [Turborepo Docs](https://turbo.build/repo/docs)
- [Bun Documentation](https://bun.sh/docs)
- [TanStack Start](https://tanstack.com/start/latest)
- [tRPC Documentation](https://trpc.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Better Auth](https://www.better-auth.com/)
- [Docker + Bun Guide](https://bun.sh/guides/ecosystem/docker)

### Docker Commands

```bash
# Build all Docker images
bun run docker:build

# Build individual images
bun run docker:build:server  # [when Dockerfile created]
bun run docker:build:store

# Run containers
bun run docker:run:server    # [when Dockerfile created]
bun run docker:run:store     # http://localhost:3000
```

### Getting Started

1. Review and prioritize tasks based on project needs
2. Update task status as work progresses
3. Add new tasks as requirements emerge
4. Use checkboxes to track completion

---

_Last Updated: 2025-08-10_
_Database package completed - PostgreSQL + Drizzle ORM with auth/todo schemas_
_Auth package completed - Better Auth with Drizzle adapter and consistent TypeScript config_
_Docker Compose setup for local PostgreSQL development_
_Environment variables completed - Package-specific .env files with Turborepo best practices and Zod validation_
