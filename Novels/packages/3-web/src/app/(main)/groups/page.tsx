import { Suspense } from "react";
import Link from "next/link";
import { GroupsList } from "./GroupsList";

export default function GroupsPage() {
  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Groups</h1>
          <p className="text-muted-foreground">
            Discover and join reading communities
          </p>
        </div>
        <Link
          href="/groups/create"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Create Group
        </Link>
      </header>

      <Suspense fallback={<div>Loading groups...</div>}>
        <GroupsList />
      </Suspense>
    </div>
  );
}
