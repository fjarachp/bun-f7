import { renderWelcomeEmail, sendEmail } from "@repo/email";
import { Hono } from "hono";
import { z } from "zod";
import { env } from "../env";

const LocaleSchema = z.enum(["en", "es", "fr"]);

const EmailPayloadSchema = z.discriminatedUnion("template", [
  z.object({
    template: z.literal("welcome"),
    props: z.object({
      appUrl: z.url(),
      name: z.string().min(1),
    }),
  }),
]);

const SendEmailRequestSchema = z.object({
  from: z.email().optional(),
  locale: LocaleSchema.optional(),
  payload: EmailPayloadSchema,
  replyTo: z.email().optional(),
  to: z.union([z.email(), z.array(z.email()).min(1)]),
});

type SendEmailResponse =
  | {
      messageId?: string;
      success: true;
    }
  | {
      error: string;
      success: false;
    };

export const emailApp = new Hono();

emailApp.use("/*", async (c, next) => {
  if (!env.EMAIL_API_KEY) {
    return c.json<SendEmailResponse>({ error: "Email API not configured", success: false }, 503);
  }

  const apiKey = c.req.header("X-Email-Api-Key");
  if (apiKey !== env.EMAIL_API_KEY) {
    return c.json<SendEmailResponse>({ error: "Invalid API key", success: false }, 401);
  }

  await next();
});

emailApp.post("/send", async (c) => {
  const parsed = SendEmailRequestSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json<SendEmailResponse>(
      {
        error: `Validation error: ${parsed.error.issues.map((issue) => issue.message).join(", ")}`,
        success: false,
      },
      400,
    );
  }

  if (!env.SENDGRID_API_KEY) {
    return c.json<SendEmailResponse>({ error: "SendGrid not configured", success: false }, 503);
  }

  const { from, locale, payload, replyTo, to } = parsed.data;

  try {
    const rendered = await renderWelcomeEmail({
      appUrl: payload.props.appUrl,
      locale,
      name: payload.props.name,
    });

    const result = await sendEmail({
      apiKey: env.SENDGRID_API_KEY,
      from: from ?? env.EMAIL_FROM,
      html: rendered.html,
      replyTo,
      subject: rendered.subject,
      text: rendered.text,
      to,
    });

    return c.json<SendEmailResponse>({
      messageId: result.messageId,
      success: true,
    });
  } catch (error) {
    console.error("[EMAIL] Send failed:", error);
    return c.json<SendEmailResponse>(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      },
      500,
    );
  }
});
