import { createAuthClient as createBetterAuthClient } from "better-auth/react";

export type AuthClientOptions = {
  apiBaseUrl: string;
};

export type AuthClient = ReturnType<typeof createBetterAuthClient>;

export function createAuthClient(options: AuthClientOptions): AuthClient {
  return createBetterAuthClient({
    baseURL: options.apiBaseUrl,
    // fetchOptions: {
    //   credentials: "include",
    // },
    plugins: [],
  });
}
