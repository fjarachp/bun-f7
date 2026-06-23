import LoadingState from "@apps/store/components/common/loading-state";
import { APP_NAME } from "@apps/store/constants/app";
import { authMiddleware } from "@apps/store/middleware/auth";
import { Trans } from "@lingui/react/macro";
import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/todo/")({
  beforeLoad: ({ context }) => {
    // Handles client-side navigation (back button, link clicks)
    if (!context.auth?.user) {
      throw redirect({ to: "/" });
    }
  },
  server: {
    middleware: [authMiddleware],
  },
  loader: async ({ context }) => {
    const todos = await context.queryClient.ensureQueryData(context.trpc.todo.list.queryOptions());
    return { todos };
  },
  head: () => ({
    meta: [
      {
        title: `${APP_NAME} - My Todos`,
        description: "View and manage your todo list",
      },
    ],
  }),
  errorComponent: ({ error }) => (
    <div className="flex min-h-96 items-center justify-center">
      <div className="text-center">
        <h2 className="mb-2 font-semibold text-2xl">
          <Trans>Error Loading Todos</Trans>
        </h2>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex min-h-96 items-center justify-center">
      <div className="text-center">
        <h2 className="mb-2 font-semibold text-2xl">
          <Trans>Todos Not Found</Trans>
        </h2>
        <p className="text-muted-foreground">
          <Trans>The todos page could not be found.</Trans>
        </p>
      </div>
    </div>
  ),
  pendingComponent: () => <LoadingState text={<Trans>Loading todos...</Trans>} />,
  component: lazyRouteComponent(() => import("@apps/store/screens/todo")),
});
