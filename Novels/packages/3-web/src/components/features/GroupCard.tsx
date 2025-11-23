"use client";

import { Group } from "7-shared/types";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Link
      href={`/groups/${group.id}`}
      className="block rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      aria-label={`View ${group.name} group details`}
    >
      <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {group.description}
      </p>
      <div
        className="flex items-center justify-between text-sm text-muted-foreground"
        aria-label={`${group.memberCount} members, created ${formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}`}
      >
        <span>{group.memberCount} members</span>
        <span>{formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}</span>
      </div>
    </Link>
  );
}

