import { I18nProvider as LinguiI18nProvider } from "@lingui/react";
import type { PropsWithChildren } from "react";
import type { I18nInstance } from "./index";

type I18nProviderProps = PropsWithChildren<{ i18n: I18nInstance }>;

export const I18nProvider = ({ i18n, children }: I18nProviderProps) => (
  <LinguiI18nProvider i18n={i18n}>{children}</LinguiI18nProvider>
);

export { Trans, useLingui } from "@lingui/react";
