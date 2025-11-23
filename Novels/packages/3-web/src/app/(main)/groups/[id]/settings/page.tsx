import { Suspense } from "react";
import { GroupSettings } from "./GroupSettings";

export default function GroupSettingsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Suspense fallback={<div>Loading...</div>}>
        <GroupSettings id={params.id} />
      </Suspense>
    </div>
  );
}

