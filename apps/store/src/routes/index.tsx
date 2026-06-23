import ContentLayout from "@apps/store/components/common/content-layout";
import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <ContentLayout>
      <div>
        <Trans>Welcome to the Store!</Trans>
      </div>
    </ContentLayout>
  );
}
