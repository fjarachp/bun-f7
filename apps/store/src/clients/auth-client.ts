import { clientEnv } from "@apps/store/env";
import { getClientLocale } from "@apps/store/i18n/locale";
import { createAuthClient } from "better-auth/react";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
  baseURL: clientEnv.VITE_API_URL,
  fetchOptions: {
    credentials: "include",
    headers: {
      get "Accept-Language"() {
        return getClientLocale();
      },
      get "x-locale"() {
        return getClientLocale();
      },
    },
  },
});

export type AuthUser = ReturnType<typeof createAuthClient>["$Infer"]["Session"]["user"];
export type AuthSession =
  | ReturnType<typeof createAuthClient>["$Infer"]["Session"]["session"]
  | null;

export type Auth = {
  user: AuthUser | null;
  session: AuthSession;
};
