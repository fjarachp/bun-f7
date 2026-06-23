import { z } from "zod";

const optionalEnvString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

export const envSchema = z.object({
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  PUBLIC_URL_STORE: z.string().url(),
  PUBLIC_URL_ADMIN: z.string().url(),
  AUTH_COOKIE_DOMAIN: z.string().optional().default(""),
  SENDGRID_API_KEY: optionalEnvString,
  EMAIL_FROM: optionalEnvString,
  EMAIL_REPLY_TO: optionalEnvString,
});

export const env = envSchema.parse(process.env);
