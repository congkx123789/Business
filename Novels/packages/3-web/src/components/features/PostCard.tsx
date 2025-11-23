"use client";

import { Post } from "7-shared/types";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-start gap-4">
        {post.author?.avatar && (
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="h-10 w-10 rounded-full"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">
              {post.author?.name || `User ${post.userId}`}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>

          <p className="mb-4 whitespace-pre-wrap">{post.content}</p>

          {post.story && (
            <Link
              href={`/stories/${post.story.id}`}
              className="text-sm text-primary hover:underline mb-4 block"
            >
              📖 {post.story.title}
            </Link>
          )}

          {post.group && (
            <Link
              href={`/groups/${post.group.id}`}
              className="text-sm text-primary hover:underline mb-4 block"
            >
              👥 {post.group.name}
            </Link>
          )}

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <button className="hover:text-foreground">
              ❤️ {post.likeCount}
            </button>
            <button className="hover:text-foreground">💬 Comment</button>
          </div>
        </div>
      </div>
    </article>
  );
}
