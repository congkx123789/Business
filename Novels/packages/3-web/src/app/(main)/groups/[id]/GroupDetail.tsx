"use client";

import { notFound, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useGroup, useJoinGroup, useLeaveGroup } from "@/lib/api/useGroups";
import { useAuthStore } from "@/lib/hooks/use-auth";
import { PostList } from "@/components/features/PostList";
import { CreatePostForm } from "@/components/features/CreatePostForm";
import { GroupMembers } from "@/components/features/GroupMembers";
import { BookClubSchedule } from "@/components/features/BookClubSchedule";
import { formatDistanceToNow } from "date-fns";

export function GroupDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: group, isLoading, error } = useGroup(parseInt(id));
  const { user } = useAuthStore();
  const [joinError, setJoinError] = useState<string | null>(null);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  const isOwner = user && group && user.id === group.ownerId;
  const isMember = user && group && !isOwner;
  const isBookClub = group?.type === "book-club";

  const joinMutation = useJoinGroup();
  const leaveMutation = useLeaveGroup();

  const handleJoin = () => {
    if (!user) {
      setJoinError("Please log in to join a group");
      return;
    }
    setJoinError(null);
    joinMutation.mutate(parseInt(id), {
      onError: (error: any) => {
        setJoinError(
          error?.response?.data?.message ||
          error?.message ||
          "Failed to join group. Please try again."
        );
      },
    });
  };

  const handleLeave = () => {
    if (!user) {
      setLeaveError("Please log in to leave a group");
      return;
    }
    if (!confirm("Are you sure you want to leave this group?")) {
      return;
    }
    setLeaveError(null);
    leaveMutation.mutate(parseInt(id), {
      onSuccess: () => {
        // Redirect to groups list after leaving
        router.push("/groups");
      },
      onError: (error: any) => {
        setLeaveError(
          error?.response?.data?.message ||
          error?.message ||
          "Failed to leave group. Please try again."
        );
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-full mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
          <div className="h-10 bg-muted rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return notFound();
  }

  return (
    <>
      <header className="mb-8" role="banner">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2" id="group-title">
              {group.name}
            </h1>
            <p className="text-muted-foreground mb-4" id="group-description">
              {group.description}
            </p>
          </div>
          <div className="flex items-center gap-2" role="group" aria-label="Group actions">
            {isOwner ? (
              <Link
                href={`/groups/${id}/settings`}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 whitespace-nowrap"
                aria-label={`Manage ${group.name} group settings`}
              >
                Manage Group
              </Link>
            ) : isMember ? (
              <button
                onClick={handleLeave}
                onKeyDown={(e) => handleKeyDown(e, handleLeave)}
                disabled={leaveMutation.isPending || !user}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                aria-label={`Leave ${group.name} group`}
                aria-busy={leaveMutation.isPending}
              >
                {leaveMutation.isPending ? "Leaving..." : "Leave Group"}
              </button>
            ) : (
              <button
                onClick={handleJoin}
                onKeyDown={(e) => handleKeyDown(e, handleJoin)}
                disabled={joinMutation.isPending || !user}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                aria-label={`Join ${group.name} group`}
                aria-busy={joinMutation.isPending}
              >
                {joinMutation.isPending ? "Joining..." : "Join Group"}
              </button>
            )}
          </div>
        </div>
        {(joinError || leaveError) && (
          <div
            role="alert"
            aria-live="polite"
            aria-atomic="true"
            className="mb-4 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive"
          >
            {joinError || leaveError}
          </div>
        )}
        <div
          className="flex items-center gap-6 text-sm text-muted-foreground"
          aria-label="Group information"
        >
          <span aria-label={`${group.memberCount} members`}>
            {group.memberCount} members
          </span>
          {group.createdAt && (
            <span aria-label={`Created ${formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}`}>
              Created {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })}
            </span>
          )}
          {group.owner && (
            <span aria-label={`Owner: ${group.owner.name}`}>
              Owner: {group.owner.name}
            </span>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3" role="main">
        <div className="lg:col-span-2 space-y-6" aria-label="Group posts">
          <CreatePostForm groupId={group.id} />
          <PostList groupId={group.id} />
        </div>
        <aside className="space-y-6" aria-label="Group sidebar">
          <GroupMembers groupId={group.id} />
          {isBookClub && (
            <BookClubSchedule
              groupId={group.id}
              storyId={group.storyId}
              canSchedule={Boolean(isOwner)}
            />
          )}
        </aside>
      </div>
    </>
  );
}

