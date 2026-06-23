import crypto from "node:crypto";
import sendgrid from "@sendgrid/mail";

let initializedApiKey: string | null = null;

export type SendEmailOptions = {
  apiKey: string;
  from: string;
  html: string;
  replyTo?: string;
  subject: string;
  text?: string;
  to: string | string[];
};

export type SendEmailResult = {
  messageId?: string;
  statusCode: number;
  success: boolean;
};

const initSendGrid = (apiKey: string) => {
  if (initializedApiKey === apiKey) {
    return;
  }

  sendgrid.setApiKey(apiKey);
  initializedApiKey = apiKey;
};

export const sendEmail = async (options: SendEmailOptions): Promise<SendEmailResult> => {
  initSendGrid(options.apiKey);

  const message = {
    from: options.from,
    html: options.html,
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.text,
    to: options.to,
  };

  const [response] = await sendgrid.send(message);

  return {
    messageId: response.headers["x-message-id"] as string | undefined,
    statusCode: response.statusCode,
    success: true,
  };
};

const createSendGridPublicKey = (publicKey: string) => {
  if (publicKey.includes("BEGIN PUBLIC KEY")) {
    return crypto.createPublicKey(publicKey);
  }

  return crypto.createPublicKey({
    format: "der",
    key: Buffer.from(publicKey, "base64"),
    type: "spki",
  });
};

export const verifySendGridEventWebhookSignature = (params: {
  payload: string | Uint8Array;
  publicKey: string;
  signature: string;
  timestamp: string;
}): boolean => {
  const verifier = crypto.createVerify("sha256");
  verifier.update(Buffer.from(params.timestamp, "utf8"));
  verifier.update(
    typeof params.payload === "string"
      ? Buffer.from(params.payload, "utf8")
      : Buffer.from(params.payload),
  );
  verifier.end();

  return verifier.verify(
    createSendGridPublicKey(params.publicKey),
    Buffer.from(params.signature, "base64"),
  );
};
