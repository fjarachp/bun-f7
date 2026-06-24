import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createApi } from "@repo/api/server";
import { auth } from "@repo/auth/server";
import { Effect, Layer, Schema } from "effect";
import {
  HttpEffect,
  HttpMiddleware,
  HttpRouter,
  HttpServer,
  HttpServerResponse,
} from "effect/unstable/http";
import {
  HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSchema,
} from "effect/unstable/httpapi";
import { env } from "./env";
import { handleSendEmailRequest, SendEmailRequest, SendEmailSuccess } from "./routes/email";
import { handleSendGridWebhook, SendGridWebhookSuccess } from "./routes/webhooks";

const trustedOrigins = [new URL(env.PUBLIC_URL_STORE).origin, new URL(env.PUBLIC_URL_ADMIN).origin];

const wildcardPath = {
  BETTER_AUTH: "/api/auth/*",
  TRPC: "/api/trpc/*",
} as const;

const api = createApi();

const corsOptions = {
  origin: {
    allowedOrigins: trustedOrigins,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Accept-Language", "x-locale"],
  },
  auth: {
    allowedOrigins: trustedOrigins,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Accept-Language", "x-locale"],
    allowedMethods: ["POST", "GET", "OPTIONS"],
    exposedHeaders: ["Content-Length"],
    maxAge: 600,
  },
} as const;

const withCors = (options: Parameters<typeof HttpMiddleware.cors>[0]) =>
  HttpMiddleware.cors(options);

const trpcFetch = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: api.trpcRouter,
    createContext: ({ req }) => api.createTRPCContext({ headers: req.headers }),
    // Cap batched calls so a client can't force an oversized batch. Must match
    // (or exceed) the client's link config in packages/api/src/client.
    maxBatchSize: 10,
  });

const HealthGroup = HttpApiGroup.make("Health").add(
  HttpApiEndpoint.get("healthcheck", "/healthcheck", {
    success: Schema.String.pipe(HttpApiSchema.asText()),
  }),
);

const EmailGroup = HttpApiGroup.make("Email").add(
  HttpApiEndpoint.post("sendEmail", "/api/email/send", {
    payload: SendEmailRequest,
    success: SendEmailSuccess,
  }),
);

const WebhooksGroup = HttpApiGroup.make("Webhooks").add(
  HttpApiEndpoint.post("sendGridWebhook", "/api/webhooks/sendgrid", {
    success: SendGridWebhookSuccess,
  }),
);

const ServerApi = HttpApi.make("MonoServerApi").add(HealthGroup).add(EmailGroup).add(WebhooksGroup);

const HealthLive = HttpApiBuilder.group(ServerApi, "Health", (handlers) =>
  handlers.handle("healthcheck", () => Effect.succeed("OK")),
);

const EmailLive = HttpApiBuilder.group(ServerApi, "Email", (handlers) =>
  handlers.handleRaw("sendEmail", ({ request }) => handleSendEmailRequest(request)),
);

const WebhooksLive = HttpApiBuilder.group(ServerApi, "Webhooks", (handlers) =>
  handlers.handleRaw("sendGridWebhook", ({ request }) => handleSendGridWebhook(request)),
);

const ApiLive = HttpApiBuilder.layer(ServerApi).pipe(
  Layer.provide(Layer.mergeAll(HealthLive, EmailLive, WebhooksLive)),
  Layer.provide(HttpServer.layerServices),
);

const authHandler = HttpEffect.fromWebHandler((request: Request) => auth.handler(request));
const trpcHandler = HttpEffect.fromWebHandler(trpcFetch);

const AuthRoutes = HttpRouter.addAll([
  HttpRouter.route("GET", wildcardPath.BETTER_AUTH, withCors(corsOptions.auth)(authHandler)),
  HttpRouter.route("POST", wildcardPath.BETTER_AUTH, withCors(corsOptions.auth)(authHandler)),
  HttpRouter.route(
    "OPTIONS",
    wildcardPath.BETTER_AUTH,
    withCors(corsOptions.auth)(Effect.succeed(HttpServerResponse.empty())),
  ),
]);

const TrpcRoutes = HttpRouter.add(
  "*",
  wildcardPath.TRPC,
  withCors(corsOptions.origin)(trpcHandler),
);

const RootRoutes = HttpRouter.add("GET", "/", HttpServerResponse.text("Hello Effect!"));

const AppLive = Layer.mergeAll(ApiLive, AuthRoutes, TrpcRoutes, RootRoutes);

const { handler } = HttpRouter.toWebHandler(AppLive);

export default {
  port: env.SERVER_PORT,
  hostname: env.SERVER_HOST,
  fetch: handler,
};
