import { Suspense } from "react";
import { GroupDetail } from "./GroupDetail";

export default function GroupDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Suspense fallback={<div>Loading group...</div>}>
        <GroupDetail id={params.id} />
      </Suspense>
    </div>
  );
}
