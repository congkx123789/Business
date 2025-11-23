"use client";

import React, { useState } from "react";
import { ForumPostForm } from "./ForumPostForm";
import { ForumThreadList } from "./ForumThreadList";
import { ForumThreadDetail } from "./ForumThreadDetail";
import { ForumCategorySelector } from "./ForumCategorySelector";
import { useForumThreads } from "@/lib/hooks/useForums";
import { Button } from "@/components/ui/button";

interface ForumSectionProps {
  storyId: string;
}

export const ForumSection: React.FC<ForumSectionProps> = ({ storyId }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const { data: threads, isLoading, refetch } = useForumThreads(storyId, {
    category: selectedCategory === "all" ? undefined : selectedCategory,
  });

  const handleThreadOpen = (threadId: string) => {
    setActiveThreadId(threadId);
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Community</p>
          <h2 className="text-2xl font-bold">Forums</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      <div className="space-y-4 rounded-2xl border border-border/60 bg-card/70 p-4">
        <ForumCategorySelector value={selectedCategory} onChange={setSelectedCategory} categories={[{ id: "all", label: "All" }, { id: "general", label: "General" }, { id: "predictions", label: "Predictions" }, { id: "characters", label: "Characters" }, { id: "spoilers", label: "Spoilers" }]} />
        {isLoading ? (
          <div className="rounded-lg border border-dashed border-border/60 py-8 text-center text-sm text-muted-foreground">
            Loading threads...
          </div>
        ) : (
          <ForumThreadList
            threads={(threads || []).map((thread: any) => ({
              id: thread.id,
              title: thread.title,
              category: thread.category,
              author: thread.author,
              replyCount: thread.replyCount,
              createdAt: thread.createdAt,
              lastReplyAt: thread.lastReplyAt,
            }))}
            onSelectThread={handleThreadOpen}
          />
        )}
      </div>

      <ForumPostForm storyId={storyId} />

      {activeThreadId && (
        <ForumThreadDetail threadId={activeThreadId} onClose={() => setActiveThreadId(null)} />
      )}
    </section>
  );
};

