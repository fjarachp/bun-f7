import { defaultLocale, type Locale, locales } from "@repo/i18n";
import { getLocaleFromHeaders } from "@repo/i18n/server";

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
export const LOCALE_COOKIE_NAME = "store-locale";

const normalizeLocaleValue = (value: string) => value.trim().toLowerCase().replaceAll("_", "-");

const matchSupportedLocale = (value: string): Locale | null => {
  if (!value) {
    return null;
  }

  const normalized = normalizeLocaleValue(value);
  if (!normalized) {
    return null;
  }

  const exactMatch = locales.find((locale) => locale.toLowerCase() === normalized);
  if (exactMatch) {
    return exactMatch;
  }

  const base = normalized.split("-")[0];
  return locales.find((locale) => locale.toLowerCase() === base) ?? null;
};

const safeDecodeURIComponent = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const parseCookies = (cookieHeader?: string | null): Record<string, string> => {
  if (!cookieHeader) {
    return {};
  }

  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const separatorIndex = cookie.indexOf("=");
        if (separatorIndex === -1) {
          return [cookie, ""];
        }

        const name = cookie.slice(0, separatorIndex).trim();
        const value = cookie.slice(separatorIndex + 1).trim();
        return [name, safeDecodeURIComponent(value)];
      }),
  );
};

export const getLocaleFromCookie = (cookieHeader?: string | null): Locale | null => {
  const cookies = parseCookies(cookieHeader);
  const cookieValue = cookies[LOCALE_COOKIE_NAME];
  if (!cookieValue) {
    return null;
  }

  return matchSupportedLocale(cookieValue);
};

export const resolveLocale = (headers?: Headers, cookieHeader?: string | null): Locale => {
  const cookieLocale = getLocaleFromCookie(cookieHeader);
  if (cookieLocale) {
    return cookieLocale;
  }

  return getLocaleFromHeaders(headers);
};

export const getClientLocale = (): Locale => {
  if (typeof document === "undefined") {
    return defaultLocale;
  }

  const cookieLocale = getLocaleFromCookie(document.cookie);
  if (cookieLocale) {
    return cookieLocale;
  }

  if (typeof navigator !== "undefined") {
    const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];

    for (const candidate of candidates) {
      const matched = matchSupportedLocale(candidate);
      if (matched) {
        return matched;
      }
    }
  }

  return defaultLocale;
};

export const buildLocaleCookie = (locale: Locale) => {
  const base = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(
    locale,
  )}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;

  if (process.env.NODE_ENV === "production") {
    return `${base}; Secure`;
  }

  return base;
};

export const persistLocale = (locale: Locale) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LOCALE_COOKIE_NAME, locale);
  }

  if (typeof document === "undefined") {
    return;
  }

  document.cookie = buildLocaleCookie(locale);
};
