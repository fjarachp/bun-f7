import { defaultLocale, dynamicActivate, getStoreI18n } from "@apps/store/i18n";
import { StartClient } from "@tanstack/react-start/client";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";

const i18n = getStoreI18n();
const currentLocale = document.documentElement.lang || defaultLocale;

await dynamicActivate(i18n, currentLocale);

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
  );
});
