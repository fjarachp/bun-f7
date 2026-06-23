import {
  registerStaleChunkReloadHandler,
  reloadForStaleChunkError,
} from "@repo/helpers/stale-chunk";
import { I18nProvider } from "@repo/i18n/react";
import { createRouter as createTanstackRouter, ErrorComponent } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import type * as React from "react";
import DefaultLoading from "./components/default-loading";
import NotFound from "./components/not-found";
import { getStoreI18n } from "./i18n";
import { routeTree } from "./routeTree.gen";
import * as TanstackQuery from "./trpc/root-provider";

const appName = "store";

registerStaleChunkReloadHandler({ appName });

export function getRouter() {
  const queryClient = TanstackQuery.createQueryClient();
  const i18n = getStoreI18n();
  const serverHelpers = TanstackQuery.createServerHelpers({
    queryClient,
  });

  const router = routerWithQueryClient(
    createTanstackRouter({
      routeTree,
      context: {
        i18n,
        queryClient,
        trpc: serverHelpers,
      },
      scrollRestoration: true,
      defaultPreloadStaleTime: 0,
      defaultStaleTime: 0,
      defaultPreload: "intent",
      defaultViewTransition: true,
      defaultPendingComponent: DefaultLoading,
      defaultNotFoundComponent: NotFound,
      defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
      defaultOnCatch: (error) => {
        reloadForStaleChunkError(error, { appName });
      },
      Wrap: (props: { children: React.ReactNode }) => (
        <I18nProvider i18n={i18n}>
          <TanstackQuery.Provider queryClient={queryClient}>
            {props.children}
          </TanstackQuery.Provider>
        </I18nProvider>
      ),
    }),
    queryClient,
  );

  return router;
}
