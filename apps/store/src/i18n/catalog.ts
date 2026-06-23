import type { Locale, Messages } from "@repo/i18n";

type CatalogModule = {
  messages: Messages;
};

const storeCatalogLoaders: Record<Locale, () => Promise<CatalogModule>> = {
  en: () => import("@repo/i18n/locales/en/store/messages") as Promise<CatalogModule>,
  es: () => import("@repo/i18n/locales/es/store/messages") as Promise<CatalogModule>,
  fr: () => import("@repo/i18n/locales/fr/store/messages") as Promise<CatalogModule>,
};

export const loadStoreCatalog = async (locale: Locale): Promise<Messages> => {
  const loadCatalog = storeCatalogLoaders[locale];
  const catalog = await loadCatalog();
  return catalog.messages ?? {};
};
