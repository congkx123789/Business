"use client";

import { useGroupMembers } from "@/lib/api/useGroups";
import { GroupMember } from "7-shared/types";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface GroupMembersProps {
  groupId: number;
}

interface MemberWithUser extends GroupMember {
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

export function GroupMembers({ groupId }: GroupMembersProps) {
  const { data: members, isLoading, error } = useGroupMembers(groupId);

  if (isLoading) {
    return (
      <section className="rounded-lg border bg-card p-6" aria-labelledby="members-heading-loading">
        <h2 id="members-heading-loading" className="text-xl font-semibold mb-4">Members</h2>
        <div className="space-y-3" role="status" aria-label="Loading members" aria-live="polite">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse" aria-hidden="true">
              <div className="h-10 w-10 bg-muted rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-lg border bg-card p-6" aria-labelledby="members-heading-error">
        <h2 id="members-heading-error" className="text-xl font-semibold mb-4">Members</h2>
        <div className="text-sm text-muted-foreground" role="alert" aria-live="assertive">
          <span className="sr-only">Error: </span>
          Unable to load members. Please try again later.
        </div>
      </section>
    );
  }

  if (!members || members.length === 0) {
    return (
      <section className="rounded-lg border bg-card p-6" aria-labelledby="members-heading-empty">
        <h2 id="members-heading-empty" className="text-xl font-semibold mb-4">Members</h2>
        <div className="text-sm text-muted-foreground" role="status" aria-live="polite">
          No members yet.
        </div>
      </section>
    );
  }

  // Sort members: owner first, then admins, then members
  const sortedMembers = [...members].sort((a: MemberWithUser, b: MemberWithUser) => {
    const roleOrder = { owner: 0, admin: 1, member: 2 };
    return roleOrder[a.role] - roleOrder[b.role];
  });

  return (
    <section className="rounded-lg border bg-card p-6" aria-labelledby="members-heading">
      <h2 id="members-heading" className="text-xl font-semibold mb-4">
        Members ({members.length})
      </h2>
      <div className="space-y-3" role="list" aria-label="Group members">
        {sortedMembers.map((member: MemberWithUser) => (
          <div
            key={member.id}
            role="listitem"
            className="flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors"
            tabIndex={0}
          >
            {member.user?.avatar ? (
              <img
                src={member.user.avatar}
                alt={`${member.user.name} avatar`}
                className="h-10 w-10 rounded-full"
                aria-hidden="false"
              />
            ) : (
              <div
                className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold"
                aria-label={`${member.user?.name || `User ${member.userId}`} avatar`}
              >
                {member.user?.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${member.userId}`}
                  className="font-semibold hover:underline truncate"
                  aria-label={`View ${member.user?.name || `User ${member.userId}`} profile`}
                >
                  {member.user?.name || `User ${member.userId}`}
                </Link>
                {member.role !== "member" && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      member.role === "owner"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                    aria-label={`Role: ${member.role}`}
                  >
                    {member.role === "owner" ? "Owner" : "Admin"}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground" aria-label={`Joined ${formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}`}>
                Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

