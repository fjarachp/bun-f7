import { Trans } from "@lingui/react/macro";
import { Button } from "@repo/ui/components/button";
import { Link } from "@tanstack/react-router";

export default function NotFound() {
  return (
    <div className="flex size-full items-center justify-center p-2 text-2xl">
      <div className="flex flex-col items-center gap-4">
        <p className="font-bold text-4xl">
          404{" "}
          <Link className="hover:cursor-pointer hover:text-red-700" to="/">
            <span className="mr-2 gap-3 text-5xl">&#10683;</span>
          </Link>
        </p>
        <p className="text-lg">
          <Trans>Page not found</Trans>
        </p>
        <Button asChild>
          <Link to="/">
            <Trans>Return to home</Trans>
          </Link>
        </Button>
      </div>
    </div>
  );
}
