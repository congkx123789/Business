"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ForumCategorySelector } from "./ForumCategorySelector";
import { useCreateForumPost } from "@/lib/hooks/useForums";

interface ForumPostFormProps {
  storyId: string;
}

export const ForumPostForm: React.FC<ForumPostFormProps> = ({ storyId }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const createPost = useCreateForumPost();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createPost.mutateAsync({ storyId, category, title, content });
    setTitle("");
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border/60 bg-card/70 p-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Category</label>
        <ForumCategorySelector value={category} onChange={setCategory} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Title</label>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What's on your mind?" required />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Content</label>
        <Textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Share your thoughts..." rows={5} required />
      </div>
      <Button type="submit" className="w-full" disabled={createPost.isPending}>
        {createPost.isPending ? "Posting..." : "Start Discussion"}
      </Button>
    </form>
  );
};

