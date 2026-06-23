import { buildLocaleCookie, persistLocale } from "@apps/store/i18n/locale";
import {
  defaultLocale,
  dynamicActivate,
  type Locale,
  locales,
} from "@apps/store/modules/lingui/i18n";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import * as React from "react";

const ensureLocale = (value: string): Locale => {
  if (locales.includes(value as Locale)) {
    return value as Locale;
  }

  throw new Error("Unsupported locale");
};

const updateLanguage = createServerFn({ method: "POST" })
  .inputValidator(ensureLocale)
  .handler(({ data }) => {
    setResponseHeader("Set-Cookie", buildLocaleCookie(data));
  });

const LanguageToggle = () => {
  const { i18n, t } = useLingui();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const currentLocale = locales.includes(i18n.locale as Locale)
    ? (i18n.locale as Locale)
    : defaultLocale;

  const localeNames: Record<Locale, string> = {
    en: t`English`,
    es: t`Español`,
    fr: t`Français`,
  };

  const handleLocaleChange = async (value: string) => {
    const nextLocale = ensureLocale(value);

    if (nextLocale === currentLocale) {
      return;
    }

    setIsUpdating(true);

    try {
      persistLocale(nextLocale);

      await Promise.all([updateLanguage({ data: nextLocale }), dynamicActivate(i18n, nextLocale)]);

      document.documentElement.lang = nextLocale;

      await Promise.all([queryClient.invalidateQueries(), router.invalidate()]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select disabled={isUpdating} onValueChange={handleLocaleChange} value={currentLocale}>
      <SelectTrigger aria-label={t`Language`} size="sm">
        <SelectValue>{currentLocale.toUpperCase()}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>
            <Trans>Language</Trans>
          </SelectLabel>
          {locales.map((locale) => (
            <SelectItem key={locale} value={locale}>
              {localeNames[locale]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default LanguageToggle;
