// src/server.ts
import { setupLocaleFromRequest } from "@apps/store/modules/lingui/i18n.server";
import type { I18nInstance } from "@repo/i18n";
import {
  createStartHandler,
  defaultStreamHandler,
  defineHandlerCallback,
} from "@tanstack/react-start/server";
import { createServerEntry } from "@tanstack/react-start/server-entry";

const customHandler = defineHandlerCallback(async (ctx) => {
  const { i18n } = ctx.router.options.context as { i18n: I18nInstance };
  await setupLocaleFromRequest(i18n);

  return defaultStreamHandler(ctx);
});

const fetch = createStartHandler(customHandler);

export default createServerEntry({
  fetch,
});
