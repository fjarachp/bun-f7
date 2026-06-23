import { defineConfig } from "@lingui/cli";

export default defineConfig({
  locales: ["en", "es", "fr"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "packages/i18n/src/locales/{locale}/store/messages",
      include: ["apps/store/src"],
    },
    {
      path: "packages/i18n/src/locales/{locale}/server/messages",
      include: ["apps/server/src"],
    },
    {
      path: "packages/i18n/src/locales/{locale}/api/messages",
      include: ["packages/api/src"],
    },
    {
      path: "packages/i18n/src/locales/{locale}/auth/messages",
      include: ["packages/auth/src"],
    },
    {
      path: "packages/i18n/src/locales/{locale}/email/messages",
      include: ["packages/email/src"],
    },
    {
      path: "packages/i18n/src/locales/{locale}/ui/messages",
      include: ["packages/ui/src"],
    },
    {
      path: "packages/i18n/src/locales/{locale}/helpers/messages",
      include: ["packages/helpers/src"],
    },
  ],
  compileNamespace: "ts",
});
