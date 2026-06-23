import { getWelcomeEmailSubject } from "./templates/welcome";
import { createEmailElement, getEmailI18n, renderEmail, type RenderedEmail } from "./render";
import { sendEmail, type SendEmailResult } from "./sendgrid";
import { defaultLocale, type Locale } from "./locale";

export type RenderWelcomeEmailOptions = {
  appUrl: string;
  locale?: Locale;
  name: string;
};

export type SendWelcomeEmailOptions = RenderWelcomeEmailOptions & {
  apiKey: string;
  from: string;
  replyTo?: string;
  to: string | string[];
};

export type RenderedWelcomeEmail = RenderedEmail & {
  subject: string;
};

export const renderWelcomeEmail = async (
  options: RenderWelcomeEmailOptions,
): Promise<RenderedWelcomeEmail> => {
  const locale = options.locale ?? defaultLocale;
  const i18n = getEmailI18n(locale);
  const subject = getWelcomeEmailSubject(i18n);
  const rendered = await renderEmail(
    createEmailElement({
      props: {
        appUrl: options.appUrl,
        name: options.name,
      },
      template: "welcome",
    }),
    { locale },
  );

  return { ...rendered, subject };
};

export const sendWelcomeEmail = async (
  options: SendWelcomeEmailOptions,
): Promise<SendEmailResult> => {
  const rendered = await renderWelcomeEmail(options);

  return sendEmail({
    apiKey: options.apiKey,
    from: options.from,
    html: rendered.html,
    replyTo: options.replyTo,
    subject: rendered.subject,
    text: rendered.text,
    to: options.to,
  });
};
