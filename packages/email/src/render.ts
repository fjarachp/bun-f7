import { type Messages } from "@lingui/core";
import { getI18n, loadCatalog, type I18nInstance } from "@repo/i18n";
import { cloneElement, createElement, type ReactElement } from "react";
import { render as reactEmailRender } from "react-email";
import { defaultLocale, type Locale } from "./locale";
import { WelcomeEmail } from "./templates/welcome";
import type { WelcomeEmailProps } from "./templates/welcome";

import { messages as enEmailMessages } from "@repo/i18n/locales/en/email/messages";
import { messages as esEmailMessages } from "@repo/i18n/locales/es/email/messages";
import { messages as frEmailMessages } from "@repo/i18n/locales/fr/email/messages";

export type EmailTemplateName = "welcome";

export type WelcomeEmailPayload = {
  props: Omit<WelcomeEmailProps, "i18n" | "locale">;
  template: "welcome";
};

export type EmailPayload = WelcomeEmailPayload;

export type RenderEmailOptions = {
  locale?: Locale;
};

export type RenderedEmail = {
  html: string;
  text: string;
};

type EmailI18nProps = {
  i18n?: I18nInstance;
  locale?: Locale;
};

const emailCatalogs: Record<Locale, Messages> = {
  en: enEmailMessages,
  es: esEmailMessages,
  fr: frEmailMessages,
};

export const getEmailI18n = (locale: Locale = defaultLocale) => {
  const i18n = getI18n();
  loadCatalog(i18n, locale, emailCatalogs[locale] ?? emailCatalogs[defaultLocale]);
  return i18n;
};

export const renderEmail = async (
  template: ReactElement<EmailI18nProps>,
  options: RenderEmailOptions = {},
): Promise<RenderedEmail> => {
  const locale = options.locale ?? defaultLocale;
  const i18n = getEmailI18n(locale);
  const templateWithI18n = cloneElement(template, { i18n, locale });

  const [html, text] = await Promise.all([
    reactEmailRender(templateWithI18n),
    reactEmailRender(templateWithI18n, { plainText: true }),
  ]);

  return { html, text };
};

export const createEmailElement = (payload: EmailPayload) => {
  return createElement(WelcomeEmail, payload.props);
};

export const renderEmailPayload = (payload: EmailPayload, options: RenderEmailOptions = {}) =>
  renderEmail(createEmailElement(payload), options);
