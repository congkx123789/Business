"use client";

import React from "react";

interface ForumThreadCardProps {
  thread: {
    id: string;
    title: string;
    category: string;
    author: { username: string };
    replyCount: number;
    createdAt: string;
    lastReplyAt?: string;
  };
}

export const ForumThreadCard: React.FC<ForumThreadCardProps> = ({ thread }) => {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 px-4 py-3 transition hover:border-primary/40 hover:bg-card/80">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary">
            <span>{thread.category}</span>
            <span className="text-muted-foreground">•</span>
            <span>by {thread.author.username}</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground">{thread.title}</h3>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>{thread.replyCount} replies</p>
          <p>{thread.lastReplyAt ? new Date(thread.lastReplyAt).toLocaleString() : new Date(thread.createdAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

