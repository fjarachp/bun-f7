import { verifySendGridEventWebhookSignature } from "@repo/email";
import { Hono } from "hono";
import { env } from "../../env";

const app = new Hono();

app.post("/", async (c) => {
  const rawBody = await c.req.text();
  const signature = c.req.header("x-twilio-email-event-webhook-signature");
  const timestamp = c.req.header("x-twilio-email-event-webhook-timestamp");

  if (!(signature && timestamp)) {
    return c.json({ error: "Missing SendGrid signature headers" }, 400);
  }

  if (!env.SENDGRID_EVENT_WEBHOOK_SIGNING_KEY) {
    console.error("[SENDGRID WEBHOOK] Missing SENDGRID_EVENT_WEBHOOK_SIGNING_KEY");
    return c.json({ error: "Webhook not configured" }, 500);
  }

  const isValidSignature = verifySendGridEventWebhookSignature({
    payload: rawBody,
    publicKey: env.SENDGRID_EVENT_WEBHOOK_SIGNING_KEY,
    signature,
    timestamp,
  });

  if (!isValidSignature) {
    return c.json({ error: "Invalid signature" }, 401);
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch (error) {
    console.error("[SENDGRID WEBHOOK] Invalid JSON payload", error);
    return c.json({ error: "Invalid JSON payload" }, 400);
  }

  if (!Array.isArray(parsedBody)) {
    return c.json({ error: "Expected an array of events" }, 400);
  }

  console.log(`[SENDGRID WEBHOOK] Received ${parsedBody.length} event(s)`);

  return c.json({ received: true });
});

export { app as sendgridWebhookApp };
