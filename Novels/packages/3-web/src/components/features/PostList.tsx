"use client";

import { useFeed, useGroupPosts } from "@/lib/api/useFeed";
import { PostCard } from "./PostCard";

interface PostListProps {
  groupId?: number;
}

export function PostList({ groupId }: PostListProps) {
  const { data, isLoading, error } = groupId
    ? useGroupPosts(groupId)
    : useFeed();

  if (isLoading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data || data.posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No posts yet. Be the first to post!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

