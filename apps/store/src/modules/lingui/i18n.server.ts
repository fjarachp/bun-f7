import {
  buildLocaleCookie,
  getLocaleFromCookie,
  LOCALE_COOKIE_NAME,
} from "@apps/store/i18n/locale";
import type { I18nInstance } from "@repo/i18n";
import { getLocaleFromHeaders } from "@repo/i18n/server";
import {
  getCookies,
  getRequest,
  getRequestHeaders,
  setResponseHeader,
} from "@tanstack/react-start/server";
import { defaultLocale, dynamicActivate, isLocaleValid } from "./i18n";

const getLocaleFromRequest = () => {
  const request = getRequest();
  const headers = getRequestHeaders();
  const cookies = getCookies();
  const url = new URL(request.url);
  const queryLocale = url.searchParams.get("locale") ?? "";

  if (isLocaleValid(queryLocale)) {
    setResponseHeader("Set-Cookie", buildLocaleCookie(queryLocale));
    return queryLocale;
  }

  const cookieLocale = getLocaleFromCookie(headers.get("cookie"));
  if (cookieLocale) {
    return cookieLocale;
  }

  const storedCookieLocale = cookies[LOCALE_COOKIE_NAME];
  if (storedCookieLocale && isLocaleValid(storedCookieLocale)) {
    return storedCookieLocale;
  }

  const headerLocale = getLocaleFromHeaders(headers);
  if (headerLocale !== defaultLocale) {
    return headerLocale;
  }

  setResponseHeader("Set-Cookie", buildLocaleCookie(defaultLocale));
  return defaultLocale;
};

export async function setupLocaleFromRequest(i18n: I18nInstance) {
  await dynamicActivate(i18n, getLocaleFromRequest());
}
