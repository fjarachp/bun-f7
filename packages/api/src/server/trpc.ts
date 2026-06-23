import { type AuthInstance, auth } from "@repo/auth/server";
import { type DatabaseInstance, db } from "@repo/db/client";
import type { I18nInstance, Locale } from "@repo/i18n";
import { getI18nForRequest } from "@repo/i18n/server";
import { initTRPC, TRPCError } from "@trpc/server";
import SuperJSON from "superjson";
import { z } from "zod";
import { createEffectProcedure } from "./effect-trpc";
import { loadApiCatalog } from "./i18n/catalog";
import { serverRuntime } from "./runtime";
import { translateApiMessage } from "./services/errors";

export const createTRPCContext = async ({
  headers,
}: {
  headers: Headers;
}): Promise<{
  db: DatabaseInstance;
  i18n: I18nInstance;
  locale: Locale;
  session: AuthInstance["$Infer"]["Session"] | null;
}> => {
  const [session, { i18n, locale }] = await Promise.all([
    auth.api.getSession({
      headers,
    }),
    getI18nForRequest({
      headers,
      loadCatalog: loadApiCatalog,
    }),
  ]);

  return {
    db,
    i18n,
    locale,
    session,
  };
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

export const t = initTRPC.context<TRPCContext>().create({
  transformer: SuperJSON,

  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof z.ZodError ? z.treeifyError(error.cause) : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: translateApiMessage(ctx.i18n, "api.error.forbidden"),
    });
  }
  return next({
    ctx: {
      session: { ...ctx.session },
    },
  });
});

export const effectPublicProcedure = createEffectProcedure(publicProcedure, serverRuntime);

export type ProtectedContext = TRPCContext & {
  session: AuthInstance["$Infer"]["Session"];
};

export const effectProtectedProcedure = createEffectProcedure(protectedProcedure, serverRuntime);
