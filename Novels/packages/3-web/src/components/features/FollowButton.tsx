"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followUser, unfollowUser } from "@/lib/api/api";

interface FollowButtonProps {
  userId: number;
  isFollowing?: boolean;
}

export function FollowButton({ userId, isFollowing: initialFollowing = false }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: () => followUser(userId),
    onSuccess: () => {
      setIsFollowing(true);
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => unfollowUser(userId),
    onSuccess: () => {
      setIsFollowing(false);
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
    },
  });

  const handleClick = () => {
    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={followMutation.isPending || unfollowMutation.isPending}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        isFollowing
          ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          : "bg-primary text-primary-foreground hover:bg-primary/90"
      } disabled:opacity-50`}
    >
      {followMutation.isPending || unfollowMutation.isPending
        ? "Loading..."
        : isFollowing
        ? "Following"
        : "Follow"}
    </button>
  );
}
