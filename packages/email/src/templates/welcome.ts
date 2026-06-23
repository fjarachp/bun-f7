import type { I18nInstance } from "@repo/i18n";
import { Button, Heading, Hr, Section, Text } from "react-email";
import { createElement, type CSSProperties } from "react";
import { EmailLayout } from "../components/layout";
import { defaultLocale, type Locale } from "../locale";

type MessageDescriptor = {
  id: string;
  message?: string;
  values?: Record<string, unknown>;
};

type TranslateFn = (descriptor: MessageDescriptor) => string;

export type WelcomeEmailProps = {
  appUrl: string;
  i18n?: I18nInstance;
  locale?: Locale;
  name: string;
};

const formatFallbackMessage = (descriptor: MessageDescriptor) => {
  let value = descriptor.message ?? descriptor.id;
  for (const [name, replacement] of Object.entries(descriptor.values ?? {})) {
    value = value.replaceAll(`{${name}}`, String(replacement));
  }
  return value;
};

const createTranslate = (i18n?: I18nInstance): TranslateFn =>
  i18n ? (descriptor) => i18n._(descriptor) : formatFallbackMessage;

const welcomeSubjectMessage = /*i18n*/ {
  id: "Welcome to PGI Photos",
  message: "Welcome to PGI Photos",
};

const welcomeHeadingMessage = (name: string) => /*i18n*/ ({
  id: "Welcome, {name}",
  message: "Welcome, {name}",
  values: { name },
});

const accountReadyMessage = /*i18n*/ {
  id: "Your PGI Photos account is ready.",
  message: "Your PGI Photos account is ready.",
};

const continueMessage = /*i18n*/ {
  id: "You can now sign in to organize your photos and continue from any device.",
  message: "You can now sign in to organize your photos and continue from any device.",
};

const ctaMessage = /*i18n*/ {
  id: "Open PGI Photos",
  message: "Open PGI Photos",
};

const ignoreMessage = /*i18n*/ {
  id: "If you did not create this account, you can ignore this email.",
  message: "If you did not create this account, you can ignore this email.",
};

const cardStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "32px",
};

const headingStyle: CSSProperties = {
  color: "#111827",
  fontSize: "28px",
  fontWeight: 700,
  lineHeight: "36px",
  margin: "0 0 20px",
};

const textStyle: CSSProperties = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const buttonStyle: CSSProperties = {
  backgroundColor: "#111827",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: 700,
  lineHeight: "20px",
  margin: "8px 0 24px",
  padding: "12px 18px",
  textDecoration: "none",
};

const footerStyle: CSSProperties = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "18px 0 0",
};

export const getWelcomeEmailSubject = (i18n?: I18nInstance) => {
  const _ = createTranslate(i18n);
  return _(welcomeSubjectMessage);
};

export function WelcomeEmail({ appUrl, i18n, locale = defaultLocale, name }: WelcomeEmailProps) {
  const _ = createTranslate(i18n);
  const preview = getWelcomeEmailSubject(i18n);

  const children = createElement(
    Section,
    { style: cardStyle },
    createElement(Heading, { style: headingStyle }, _(welcomeHeadingMessage(name))),
    createElement(Text, { style: textStyle }, _(accountReadyMessage)),
    createElement(Text, { style: textStyle }, _(continueMessage)),
    createElement(Button, { href: appUrl, style: buttonStyle }, _(ctaMessage)),
    createElement(Hr, { style: { borderColor: "#e5e7eb", margin: "8px 0 18px" } }),
    createElement(Text, { style: footerStyle }, _(ignoreMessage)),
  );

  return createElement(EmailLayout, { locale, preview }, children);
}

export default WelcomeEmail;
