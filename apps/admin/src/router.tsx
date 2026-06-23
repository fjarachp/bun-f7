import {
  registerStaleChunkReloadHandler,
  reloadForStaleChunkError,
} from "@repo/helpers/stale-chunk";
import { createRouter as createTanStackRouter, ErrorComponent } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { NotFound } from "./components/not-found";
import { routeTree } from "./routeTree.gen";
import * as TanstackQuery from "./trpc/root-provider";

const appName = "admin";

registerStaleChunkReloadHandler({ appName });

export function getRouter() {
  const queryClient = TanstackQuery.createQueryClient();
  const serverHelpers = TanstackQuery.createServerHelpers({
    queryClient,
  });

  const router = routerWithQueryClient(
    createTanStackRouter({
      routeTree,
      context: {
        queryClient,
        trpc: serverHelpers,
      },
      scrollRestoration: true,
      defaultPreloadStaleTime: 0,
      defaultStaleTime: 0,
      defaultPreload: "intent",
      defaultViewTransition: true,
      defaultNotFoundComponent: () => <NotFound />,
      defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
      defaultOnCatch: (error) => {
        reloadForStaleChunkError(error, { appName });
      },
      Wrap: (props: { children: React.ReactNode }) => (
        <TanstackQuery.Provider queryClient={queryClient}>{props.children}</TanstackQuery.Provider>
      ),
    }),
    queryClient,
  );

  return router;
}
