import { renderWelcomeEmail, sendEmail as deliverEmail } from "@repo/email";
import { Effect, Schema } from "effect";
import { HttpServerRequest, HttpServerResponse } from "effect/unstable/http";
import { env } from "../env";

const json = (body: unknown, status: number) => HttpServerResponse.jsonUnsafe(body, { status });

const EmailAddress = Schema.String.check(Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));

export const SendEmailRequest = Schema.Struct({
  from: Schema.optional(EmailAddress),
  locale: Schema.optional(Schema.Literals(["en", "es", "fr"])),
  payload: Schema.Union([
    Schema.Struct({
      template: Schema.Literal("welcome"),
      props: Schema.Struct({
        appUrl: Schema.URLFromString,
        name: Schema.NonEmptyString,
      }),
    }),
  ]),
  replyTo: Schema.optional(EmailAddress),
  to: Schema.Union([EmailAddress, Schema.NonEmptyArray(EmailAddress)]),
});

export const SendEmailSuccess = Schema.Struct({
  messageId: Schema.optional(Schema.String),
  success: Schema.Literal(true),
});

export type SendEmailRequest = Schema.Schema.Type<typeof SendEmailRequest>;

const decodeSendEmailRequest = Schema.decodeUnknownEffect(SendEmailRequest);

const validationError = (error: unknown) =>
  json(
    {
      error: `Validation error: ${String(error)}`,
      success: false,
    },
    400,
  );

const handleSendEmail = (request: HttpServerRequest.HttpServerRequest, body: SendEmailRequest) =>
  Effect.gen(function* () {
    if (!env.EMAIL_API_KEY) {
      return json({ error: "Email API not configured", success: false }, 503);
    }

    const apiKey = request.headers["x-email-api-key"];
    if (apiKey !== env.EMAIL_API_KEY) {
      return json({ error: "Invalid API key", success: false }, 401);
    }

    if (!env.SENDGRID_API_KEY) {
      return json({ error: "SendGrid not configured", success: false }, 503);
    }
    const sendgridApiKey = env.SENDGRID_API_KEY;

    const { from, locale, payload, replyTo, to } = body;
    const recipients = typeof to === "string" ? to : [...to];

    return yield* Effect.tryPromise({
      try: async () => {
        const rendered = await renderWelcomeEmail({
          appUrl: payload.props.appUrl.toString(),
          locale,
          name: payload.props.name,
        });

        return deliverEmail({
          apiKey: sendgridApiKey,
          from: from ?? env.EMAIL_FROM,
          html: rendered.html,
          replyTo,
          subject: rendered.subject,
          text: rendered.text,
          to: recipients,
        });
      },
      catch: (error) => error,
    }).pipe(
      Effect.match({
        onFailure: (error) => {
          console.error("[EMAIL] Send failed:", error);
          return json(
            {
              error: error instanceof Error ? error.message : "Unknown error",
              success: false,
            },
            500,
          );
        },
        onSuccess: (result) => ({
          messageId: result.messageId,
          success: true as const,
        }),
      }),
    );
  });

export const handleSendEmailRequest = (request: HttpServerRequest.HttpServerRequest) =>
  request.json.pipe(
    Effect.matchEffect({
      onFailure: (error) => Effect.succeed(validationError(error)),
      onSuccess: (body) =>
        decodeSendEmailRequest(body).pipe(
          Effect.matchEffect({
            onFailure: (error) => Effect.succeed(validationError(error)),
            onSuccess: (payload) => handleSendEmail(request, payload),
          }),
        ),
    }),
  );
