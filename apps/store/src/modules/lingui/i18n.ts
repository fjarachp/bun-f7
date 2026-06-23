import { loadStoreCatalog } from "@apps/store/i18n/catalog";
import {
  defaultLocale,
  getI18n,
  type I18nInstance,
  isLocale,
  type Locale,
  loadCatalog,
  locales,
} from "@repo/i18n";

let clientI18n: I18nInstance | null = null;

const resolveLocaleValue = (value?: string | null): Locale => {
  if (value && isLocale(value)) {
    return value;
  }

  return defaultLocale;
};

export const isLocaleValid = (locale: string): locale is Locale => isLocale(locale);

export const getStoreI18n = () => {
  if (typeof window === "undefined") {
    return getI18n();
  }

  if (!clientI18n) {
    clientI18n = getI18n();
  }

  return clientI18n;
};

export const dynamicActivate = async (i18n: I18nInstance, locale: string): Promise<Locale> => {
  const resolvedLocale = resolveLocaleValue(locale);
  const messages = await loadStoreCatalog(resolvedLocale);
  loadCatalog(i18n, resolvedLocale, messages);
  return resolvedLocale;
};

export { defaultLocale, type I18nInstance, type Locale, locales };
