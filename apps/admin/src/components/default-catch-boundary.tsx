import { isStaleChunkError } from "@repo/helpers/stale-chunk";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { ErrorComponent, Link, rootRouteId, useMatch, useRouter } from "@tanstack/react-router";

const actionClassName =
  "rounded bg-gray-600 px-2 py-1 font-extrabold text-white uppercase dark:bg-gray-700";

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  });
  const isStaleChunk = isStaleChunkError(error);

  if (isStaleChunk) {
    return (
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4 text-center">
        <div className="max-w-md space-y-2">
          <h1 className="text-xl font-semibold">New version available</h1>
          <p className="text-muted-foreground">Reload this page to fetch the latest app files.</p>
        </div>
        <button
          className={actionClassName}
          onClick={() => {
            window.location.reload();
          }}
        >
          Reload
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4">
      <ErrorComponent error={error} />
      <div className="flex flex-wrap items-center gap-2">
        <button
          className={actionClassName}
          onClick={() => {
            router.invalidate();
          }}
        >
          Try Again
        </button>
        {isRoot ? (
          <Link className={actionClassName} to="/">
            Home
          </Link>
        ) : (
          <Link
            className={actionClassName}
            onClick={(e) => {
              e.preventDefault();
              window.history.back();
            }}
            to="/"
          >
            Go Back
          </Link>
        )}
      </div>
    </div>
  );
}
