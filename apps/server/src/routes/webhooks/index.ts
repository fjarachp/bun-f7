import { Hono } from "hono";
import { sendgridWebhookApp } from "./sendgrid";

const app = new Hono();

app.route("/sendgrid", sendgridWebhookApp);

export { app as webhooksApp };
