# Repository Guidelines

## Project Structure & Module Organization

Mono is a Turborepo monorepo. Applications live in `apps/`: `store` (TanStack Start frontend), `server` (Effect HTTP API on Bun), and `admin` (TanStack Start admin dashboard). Shared code sits in `packages/`—`ui` for components, `helpers` for cross-cutting utilities, `db` for Drizzle schema/migrations, and `typescript-config` for compiler baselines. Keep assets, env examples, and Dockerfiles colocated with the owning workspace.

## Build, Test, and Development Commands

- `bun run dev` — launch all workspace servers via Turbo with hot reload.
- `turbo dev --filter=<app>` — run a single app such as `store` or `server`.
- `bun run build` — execute the Turborepo build graph and type checks.
- `bun run lint` / `bun run format` — run Oxlint linting and Oxfmt formatting.
- `bun run typecheck` — TypeScript no-emit validation across packages.
- `bun run db:push` — apply Drizzle schema changes in `packages/db`. This is the **only** db command agents run. **Do NOT** run `bun run db:generate` or `bun run db:migrate` — the user handles migration generation and migrations.
- `bun run docker:build[:target]` — build multi-service images; see workspace Dockerfiles.

## Coding Style & Naming Conventions

TypeScript and modern React are the defaults. Oxlint and Oxfmt enforce double quotes, 2-space indentation, and import ordering—always format before pushing. Use `PascalCase` for components and hooks, `camelCase` for functions and variables, and `kebab-case` for folders. Co-locate feature files under `apps/*/src` and prefer small barrels over deep index chains.

## Testing Guidelines

Add unit and integration tests with Vitest; place `*.test.ts` files beside the code they cover and add a `vitest.config.ts` when a package gets its first test. For end-to-end flows, follow `playwright-integration.md` to scaffold `packages/e2e-*` workspaces and run `bun run playwright test`. Document skipped scenarios and include reproduction steps in PRs. Exercise new routes, procedures, and database operations before merge.

## Commit & Pull Request Guidelines

Recent history favors short, imperative commit messages (e.g., `update vite config for vercel`). Keep each commit focused and reference issue IDs when helpful. Pull requests should carry a concise summary, screenshots for UI updates, notes on schema or env changes, and a checklist of commands run (`bun run lint`, tests, migrations). Request review once CI passes and link relevant roadmap items from `TODO.md`.

## Environment & Configuration

All local env vars live in a single repo-root `.env.local` (gitignored); copy it from the root `.env.example`. Each app/package keeps a `.env.local` symlink to `../../.env.local` (`ln -sf ../../.env.local apps/<app>/.env.local`) so Vite, Bun, and drizzle-kit load the same values from any cwd—never add per-package `.env` files. Root scripts load it via `dotenv -e .env.local -- turbo run <task>`. When adding a variable, update root `.env.local`, `.env.example`, the matching Zod schema, and the relevant Turbo task `env` array in `turbo.json`.
