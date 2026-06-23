import { z } from "zod";

const DEFAULT_SERVER_PORT = 3035;
const DEFAULT_SERVER_HOST = "localhost";

const optionalEnvString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const optionalEnvUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.url().optional(),
);

const createPortSchema = ({ defaultPort }: { defaultPort: number }) =>
  z
    .string()
    .default(`${defaultPort}`)
    .transform((s) => Number.parseInt(s, 10))
    .refine((n) => Number.isInteger(n), { message: "Must be an integer" })
    .refine((n) => n >= 0 && n <= 65_535, {
      message: "Port must be between 0 and 65535",
    });

export const envSchema = z.object({
  SERVER_PORT: createPortSchema({ defaultPort: DEFAULT_SERVER_PORT }),
  SERVER_HOST: z.string().min(1).default(DEFAULT_SERVER_HOST),

  // Frontend URLs for CORS configuration
  PUBLIC_URL_STORE: z.url(),
  PUBLIC_URL_ADMIN: z.url(),

  SENDGRID_API_KEY: optionalEnvString,
  SENDGRID_EVENT_WEBHOOK_SIGNING_KEY: optionalEnvString,
  EMAIL_FROM: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.email().default("noreply@pixiepostgreetings.com"),
  ),
  EMAIL_API_KEY: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(32).optional(),
  ),
  EMAIL_API_URL: optionalEnvUrl,
});

export const env = envSchema.parse(process.env);
