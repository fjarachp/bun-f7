export type { Locale } from "./locale";
export { defaultLocale, getEmailLocaleFromHeaders, isLocale, locales } from "./locale";
export {
  createEmailElement,
  getEmailI18n,
  renderEmail,
  renderEmailPayload,
  type EmailPayload,
  type EmailTemplateName,
  type RenderedEmail,
  type RenderEmailOptions,
  type WelcomeEmailPayload,
} from "./render";
export {
  sendEmail,
  type SendEmailOptions,
  type SendEmailResult,
  verifySendGridEventWebhookSignature,
} from "./sendgrid";
export {
  renderWelcomeEmail,
  sendWelcomeEmail,
  type RenderedWelcomeEmail,
  type RenderWelcomeEmailOptions,
  type SendWelcomeEmailOptions,
} from "./welcome";
export { getWelcomeEmailSubject, WelcomeEmail, type WelcomeEmailProps } from "./templates/welcome";
