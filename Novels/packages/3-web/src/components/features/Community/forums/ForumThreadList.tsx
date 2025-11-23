"use client";

import React from "react";
import { ForumThreadCard } from "./ForumThreadCard";

interface ForumThreadListProps {
  threads: Array<ForumThreadCardProps["thread"]>;
  onSelectThread?: (threadId: string) => void;
}

export const ForumThreadList: React.FC<ForumThreadListProps> = ({ threads, onSelectThread }) => {
  if (threads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
        No threads yet. Start the conversation!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {threads.map((thread) => (
        <button key={thread.id} type="button" className="w-full text-left" onClick={() => onSelectThread?.(thread.id)}>
          <ForumThreadCard thread={thread} />
        </button>
      ))}
    </div>
  );
};

