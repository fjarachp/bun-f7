import { getEmailLocaleFromHeaders, sendWelcomeEmail } from "@repo/email";
import { env } from "./env";

type AuthUser = {
  email?: string | null;
  name?: string | null;
};

type AuthHookContext = {
  headers?: Headers;
  request?: {
    headers?: Headers;
  };
} | null;

const getDisplayName = (user: AuthUser) => {
  const name = user.name?.trim();
  if (name) {
    return name;
  }

  return user.email ?? "there";
};

const getHookHeaders = (context: AuthHookContext) => context?.headers ?? context?.request?.headers;

export const queueWelcomeEmailForNewUser = (user: AuthUser, context: AuthHookContext) => {
  if (!user.email) {
    return;
  }

  if (!env.SENDGRID_API_KEY || !env.EMAIL_FROM) {
    console.warn("Welcome email skipped: SENDGRID_API_KEY and EMAIL_FROM must be configured.");
    return;
  }

  const locale = getEmailLocaleFromHeaders(getHookHeaders(context));

  void sendWelcomeEmail({
    apiKey: env.SENDGRID_API_KEY,
    appUrl: env.PUBLIC_URL_STORE,
    from: env.EMAIL_FROM,
    locale,
    name: getDisplayName(user),
    replyTo: env.EMAIL_REPLY_TO,
    to: user.email,
  }).catch((error) => {
    console.error("Failed to send welcome email.", error);
  });
};
