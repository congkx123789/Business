"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "@/lib/api/api";

interface CreatePostFormProps {
  storyId?: number;
  groupId?: number;
}

export function CreatePostForm({ storyId, groupId }: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { content: string; storyId?: number; groupId?: number }) =>
      createPost(data),
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    mutation.mutate({
      content: content.trim(),
      storyId,
      groupId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-4 mb-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={groupId ? "Share something with the group..." : "What's on your mind?"}
        className="w-full min-h-[100px] resize-none rounded-md border bg-background p-3 mb-3"
        maxLength={5000}
      />
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {content.length}/5000
        </span>
        <button
          type="submit"
          disabled={!content.trim() || mutation.isPending}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {mutation.isPending ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}
