import type { Locale, Messages } from "@repo/i18n";

type CatalogModule = {
  messages: Messages;
};

const apiCatalogLoaders: Record<Locale, () => Promise<CatalogModule>> = {
  en: () => import("@repo/i18n/locales/en/api/messages") as Promise<CatalogModule>,
  es: () => import("@repo/i18n/locales/es/api/messages") as Promise<CatalogModule>,
  fr: () => import("@repo/i18n/locales/fr/api/messages") as Promise<CatalogModule>,
};

export const loadApiCatalog = async (locale: Locale): Promise<Messages> => {
  const loadCatalog = apiCatalogLoaders[locale];
  const catalog = await loadCatalog();
  return catalog.messages ?? {};
};
