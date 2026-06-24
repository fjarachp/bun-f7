import { db } from "@repo/db/client";
import * as schema from "@repo/db/schema";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "./env";
import { queueWelcomeEmailForNewUser } from "./welcome-email";

// Base options for CLI compatibility
export const baseOptions = {
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
} satisfies BetterAuthOptions;

// Build trusted origins from environment
const trustedOrigins = [new URL(env.PUBLIC_URL_STORE).origin, new URL(env.PUBLIC_URL_ADMIN).origin];

// In production the store, admin, and server run on SEPARATE subdomains, while
// the session cookie is set by the server (sign-in / sign-up). Without a shared
// parent `Domain`, that cookie is host-only to the server's subdomain, so the
// admin/store origins never receive it and `getSession` always comes back empty
// (sign-in appears to "fail"). Setting AUTH_COOKIE_DOMAIN to the shared parent
// (e.g. ".example.com") makes the browser store the cookie for every subdomain.
// Locally everything is on `localhost`, so this stays unset and cookies remain
// host-only — no behavior change for local dev. See packages/auth/README.md.
const crossSubDomainCookies = env.AUTH_COOKIE_DOMAIN
  ? { enabled: true as const, domain: env.AUTH_COOKIE_DOMAIN }
  : undefined;

// Singleton auth instance - initialized at module load
export const auth = betterAuth({
  ...baseOptions,
  secret: env.AUTH_SECRET,
  trustedOrigins,
  ...(crossSubDomainCookies ? { advanced: { crossSubDomainCookies } } : {}),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user, context) => {
          queueWelcomeEmailForNewUser(user, context);
        },
      },
    },
  },
});

// Export type for consumers
export type AuthInstance = typeof auth;
