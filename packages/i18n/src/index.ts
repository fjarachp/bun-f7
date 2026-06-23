import { type Messages, setupI18n } from "@lingui/core";

export const locales = ["en", "es", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = locales[0];

export type I18nInstance = ReturnType<typeof setupI18n>;
export type { Messages };

export const isLocale = (locale: string): locale is Locale => locales.includes(locale as Locale);

export const getI18n = () =>
  setupI18n({
    messages: {},
  });

export const loadCatalog = (i18n: I18nInstance, locale: Locale, messages: Messages) => {
  i18n.load(locale, messages);
  i18n.activate(locale);
  return i18n;
};
