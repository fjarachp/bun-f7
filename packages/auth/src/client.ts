import { createAuthClient as createBetterAuthClient } from "better-auth/react";

export type AuthClientOptions = {
  apiBaseUrl: string;
};

export type AuthClient = ReturnType<typeof createBetterAuthClient>;

export function createAuthClient(options: AuthClientOptions): AuthClient {
  return createBetterAuthClient({
    baseURL: options.apiBaseUrl,
    fetchOptions: {
      // Send the session cookie on cross-origin requests so the admin subdomain
      // can use the cookie issued by the auth server. Required for the
      // AUTH_COOKIE_DOMAIN cross-subdomain flow (see packages/auth/README.md).
      credentials: "include",
    },
    plugins: [],
  });
}
