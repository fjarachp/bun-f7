import { verifySendGridEventWebhookSignature } from "@repo/email";
import { Effect, Schema } from "effect";
import { HttpServerRequest, HttpServerResponse } from "effect/unstable/http";
import { env } from "../../env";

const json = (body: unknown, status: number) => HttpServerResponse.jsonUnsafe(body, { status });

export const SendGridWebhookSuccess = Schema.Struct({
  received: Schema.Literal(true),
});

const handleRawBody = (request: HttpServerRequest.HttpServerRequest, rawBody: string) =>
  Effect.gen(function*() {
    const signature = request.headers["x-twilio-email-event-webhook-signature"];
    const timestamp = request.headers["x-twilio-email-event-webhook-timestamp"];

    if (!(signature && timestamp)) {
      return json({ error: "Missing SendGrid signature headers" }, 400);
    }

    if (!env.SENDGRID_EVENT_WEBHOOK_SIGNING_KEY) {
      console.error("[SENDGRID WEBHOOK] Missing SENDGRID_EVENT_WEBHOOK_SIGNING_KEY");
      return json({ error: "Webhook not configured" }, 500);
    }

    const isValidSignature = verifySendGridEventWebhookSignature({
      payload: rawBody,
      publicKey: env.SENDGRID_EVENT_WEBHOOK_SIGNING_KEY,
      signature,
      timestamp,
    });

    if (!isValidSignature) {
      return json({ error: "Invalid signature" }, 401);
    }

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (error) {
      console.error("[SENDGRID WEBHOOK] Invalid JSON payload", error);
      return json({ error: "Invalid JSON payload" }, 400);
    }

    if (!Array.isArray(parsedBody)) {
      return json({ error: "Expected an array of events" }, 400);
    }

    yield* Effect.logInfo(`[SENDGRID WEBHOOK] Received ${parsedBody.length} event(s)`);

    return { received: true as const };
  });

export const handleSendGridWebhook = (request: HttpServerRequest.HttpServerRequest) =>
  request.text.pipe(
    Effect.matchEffect({
      onFailure: (error) =>
        Effect.sync(() => {
          console.error("[SENDGRID WEBHOOK] Failed to read request body", error);
          return json({ error: "Invalid request body" }, 400);
        }),
      onSuccess: (rawBody) => handleRawBody(request, rawBody),
    }),
  );
