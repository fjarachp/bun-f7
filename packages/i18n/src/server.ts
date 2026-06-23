import type { Messages } from "@lingui/core";
import { defaultLocale, getI18n, type Locale, loadCatalog, locales } from "./index";

type HeadersInput = Headers | Record<string, string | undefined> | undefined;
type I18nInstance = ReturnType<typeof getI18n>;
type CatalogLoader = (locale: Locale) => Promise<Messages> | Messages;

type GetI18nForRequestOptions = {
  headers?: HeadersInput;
  locale?: Locale;
  loadCatalog?: CatalogLoader;
  messages?: Messages;
};

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

const parseLocaleHeader = (value?: string | null): Locale | null => {
  if (!value) {
    return null;
  }

  const candidates = value.split(",");
  for (const candidate of candidates) {
    const locale = candidate.split(";")[0]?.trim();
    if (!locale) {
      continue;
    }

    const matched = matchSupportedLocale(locale);
    if (matched) {
      return matched;
    }
  }

  return null;
};

const getHeaderValue = (headers: HeadersInput, name: string) => {
  if (!headers) {
    return null;
  }

  if (headers instanceof Headers) {
    return headers.get(name);
  }

  const lookup = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lookup) {
      return value ?? null;
    }
  }

  return null;
};

export const getLocaleFromHeaders = (headers?: HeadersInput): Locale => {
  const explicitLocale = parseLocaleHeader(getHeaderValue(headers, "x-locale"));
  if (explicitLocale) {
    return explicitLocale;
  }

  const acceptLanguage = parseLocaleHeader(getHeaderValue(headers, "accept-language"));

  return acceptLanguage ?? defaultLocale;
};

export const getI18nForRequest = async (
  options: GetI18nForRequestOptions = {},
): Promise<{ i18n: I18nInstance; locale: Locale }> => {
  const resolvedLocale = options.locale ?? getLocaleFromHeaders(options.headers);
  const i18n = getI18n();

  if (options.messages) {
    loadCatalog(i18n, resolvedLocale, options.messages);
  } else if (options.loadCatalog) {
    const messages = await options.loadCatalog(resolvedLocale);
    loadCatalog(i18n, resolvedLocale, messages);
  } else {
    i18n.activate(resolvedLocale);
  }

  return { i18n, locale: resolvedLocale };
};
