# @repo/auth

[Better Auth](https://www.better-auth.com/) configuration for the monorepo, backed by the
Drizzle/PostgreSQL adapter from `@repo/db`. Exposes:

| Export | File | Used by |
| --- | --- | --- |
| `auth` (server instance) | `src/server.ts` | `apps/server` mounts `auth.handler` at `/api/auth/*` |
| `createAuthClient` (client wrapper) | `src/client.ts` | `apps/admin` |
| `env` (validated auth env) | `src/env.ts` | server instance |

`apps/store` talks to Better Auth directly via `better-auth/react` (`apps/store/src/clients/auth-client.ts`)
rather than through the `@repo/auth/client` wrapper.

---

## Subdomain cookie authentication

### The problem

In production the three apps run on **separate subdomains** of one parent domain:

```
store.example.com   (store, :3000 locally)
admin.example.com   (admin, :3001 locally)
api.example.com     (server, :3035 locally — issues the session cookie)
```

The session cookie is **set by the server** (on sign-in / sign-up) in its HTTP response. By
default a cookie with no `Domain` attribute is **host-only**: the browser will only send it back
to the exact host that set it (`api.example.com`). So when the user lands on `store.example.com`
or `admin.example.com`, the browser has no cookie to send to the API, `getSession()` returns
empty, and sign-in appears to "fail" or loop — even though login succeeded.

### The fix: a shared parent `Domain`

Setting the cookie's `Domain` to the **shared parent** (with a leading dot, e.g. `.example.com`)
tells the browser to store and send that cookie for **every** subdomain under it. Better Auth
exposes this through `advanced.crossSubDomainCookies`, which this repo gates on the
`AUTH_COOKIE_DOMAIN` env var.

`packages/auth/src/server.ts`:

```ts
const crossSubDomainCookies = env.AUTH_COOKIE_DOMAIN
  ? { enabled: true as const, domain: env.AUTH_COOKIE_DOMAIN }
  : undefined;

export const auth = betterAuth({
  ...baseOptions,
  secret: env.AUTH_SECRET,
  trustedOrigins,
  ...(crossSubDomainCookies ? { advanced: { crossSubDomainCookies } } : {}),
  // …
});
```

Because the whole thing is gated on `AUTH_COOKIE_DOMAIN`:

| Environment | `AUTH_COOKIE_DOMAIN` | Cookie `Domain` | Effect |
| --- | --- | --- | --- |
| Local dev | _empty_ (default) | _unset_ → host-only | Everything is on `localhost`; no cross-subdomain wiring, **no behavior change** |
| Production | `.example.com` | `.example.com` | One session cookie shared by `store.`, `admin.`, and `api.` |

### The three moving parts

A shared cookie `Domain` alone is not enough — all three must line up:

1. **Server sets the cookie on the parent domain** — `AUTH_COOKIE_DOMAIN` →
   `advanced.crossSubDomainCookies` (above).

2. **Clients send credentials cross-origin.** A subdomain request to the API is *cross-origin*,
   so the browser only attaches cookies when the fetch opts in with `credentials: "include"`.
   - Admin (via the wrapper) — `packages/auth/src/client.ts`:
     ```ts
     createBetterAuthClient({
       baseURL: options.apiBaseUrl,
       fetchOptions: { credentials: "include" },
       plugins: [],
     });
     ```
   - Store (direct) — `apps/store/src/clients/auth-client.ts` already sets
     `fetchOptions.credentials: "include"`.

3. **Server CORS allows credentialed cross-origin requests** from each subdomain origin —
   `apps/server/src/index.ts`:
   ```ts
   const trustedOrigins = [
     new URL(env.PUBLIC_URL_STORE).origin,
     new URL(env.PUBLIC_URL_ADMIN).origin,
   ];
   // corsOptions.auth / corsOptions.origin: { allowedOrigins: trustedOrigins, credentials: true, … }
   ```
   `trustedOrigins` is also passed to `betterAuth({ trustedOrigins })` so Better Auth accepts
   callbacks/redirects from those origins. With `credentials: true`, CORS echoes the specific
   request origin (it cannot use `*` when credentials are involved).

### End-to-end flow (production)

1. User signs in on `store.example.com`; the store client `POST`s to
   `https://api.example.com/api/auth/sign-in/email` with `credentials: "include"`.
2. The server validates, then issues `Set-Cookie: better-auth.session_token=…; Domain=.example.com; Path=/; HttpOnly; Secure; SameSite=Lax`.
3. The browser stores it for `*.example.com`.
4. User opens `admin.example.com`; the admin client calls the API with `credentials: "include"`,
   and the browser **automatically attaches** the cookie because its `Domain` matches.
5. The server reads the cookie and `getSession()` returns the live session — no second login.

> Sibling subdomains of one registrable domain are **same-site**, so `SameSite=Lax` is sufficient
> here (this is *not* a fully cross-site setup that would require `SameSite=None`). Cookies are
> `Secure`, so production must be served over **HTTPS** or the browser will drop them.

### Production checklist

- [ ] `AUTH_COOKIE_DOMAIN=.example.com` — leading dot, the **shared parent** of all three apps.
- [ ] `PUBLIC_URL_STORE` / `PUBLIC_URL_ADMIN` set to the real `https://…` subdomain origins
      (they feed both CORS `allowedOrigins` and Better Auth `trustedOrigins`).
- [ ] `VITE_API_URL` points at the API subdomain. ⚠️ It is **inlined into the client bundles at
      build time**, so it must be set when the store/admin Docker images are built, not just at runtime.
- [ ] All three apps served over **HTTPS** (cookies are `Secure`).
- [ ] `AUTH_SECRET` is a stable secret (≥ 32 chars) shared by every instance of the server.

### Gotchas

- **Leading dot matters.** Use `.example.com`, not `example.com`. The parent must be a
  registrable domain — you cannot set a cookie `Domain` on a public suffix (e.g. `.vercel.app`).
- **`localhost` has no usable parent.** Don't set `AUTH_COOKIE_DOMAIN` locally; leave it empty so
  cookies stay host-only and dev keeps working. To exercise the cross-subdomain path locally, use
  a tool like `*.lvh.me` / `*.localtest.me` (both resolve to `127.0.0.1`) and set
  `AUTH_COOKIE_DOMAIN=.lvh.me`.
- **CORS origins are exact.** Each subdomain must be present in `PUBLIC_URL_STORE` /
  `PUBLIC_URL_ADMIN`; a credentialed request from an origin not in `trustedOrigins` is rejected.
- **Client `credentials: "include"` is mandatory** on every app that calls the API from the
  browser — without it the browser silently omits the cookie on cross-origin requests.

> This mirrors the pattern in the `pgi-photos` repo
> (`packages/auth/src/server.ts` there), which is the reference implementation for CHP's
> subdomain-cookie auth.

---

## Environment variables

Validated in `src/env.ts`; declared in the repo-root `.env.example` and the `auth` task `env`
array in `turbo.json`.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `AUTH_SECRET` | ✅ | — | Better Auth signing secret (≥ 32 chars) |
| `PUBLIC_URL_STORE` | ✅ | — | Store origin → CORS + Better Auth trusted origin |
| `PUBLIC_URL_ADMIN` | ✅ | — | Admin origin → CORS + Better Auth trusted origin |
| `AUTH_COOKIE_DOMAIN` | — | `""` | Shared parent domain for cross-subdomain cookies; empty = host-only |
| `SENDGRID_API_KEY` | — | — | Welcome-email delivery (optional) |
| `EMAIL_FROM` | — | — | Welcome-email sender (optional) |
| `EMAIL_REPLY_TO` | — | — | Welcome-email reply-to (optional) |

`BETTER_AUTH_URL` (in `.env.example`) is read by Better Auth's tooling/runtime to know its own
base URL; it is not part of this package's Zod schema.
