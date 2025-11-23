"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateReview } from "@/lib/hooks/useReviews";

interface ReviewFormProps {
  storyId: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ storyId }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(4);
  const [plotRating, setPlotRating] = useState(4);
  const [charactersRating, setCharactersRating] = useState(4);
  const [writingRating, setWritingRating] = useState(4);
  const [worldRating, setWorldRating] = useState(4);

  const createReview = useCreateReview();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createReview.mutateAsync({
      storyId,
      title,
      content,
      rating,
      ratings: {
        plot: plotRating,
        characters: charactersRating,
        writing: writingRating,
        world: worldRating,
      },
    });
    setTitle("");
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border/60 bg-card p-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Title</label>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Amazing story!" required />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Overall Rating ({rating}/5)</label>
        <input
          type="range"
          min={1}
          max={5}
          step={0.5}
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
          className="w-full"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs uppercase text-muted-foreground">Plot ({plotRating})</label>
          <input type="range" min={1} max={5} step={0.5} value={plotRating} onChange={(event) => setPlotRating(Number(event.target.value))} className="w-full" />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase text-muted-foreground">Characters ({charactersRating})</label>
          <input type="range" min={1} max={5} step={0.5} value={charactersRating} onChange={(event) => setCharactersRating(Number(event.target.value))} className="w-full" />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase text-muted-foreground">Writing ({writingRating})</label>
          <input type="range" min={1} max={5} step={0.5} value={writingRating} onChange={(event) => setWritingRating(Number(event.target.value))} className="w-full" />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase text-muted-foreground">World ({worldRating})</label>
          <input type="range" min={1} max={5} step={0.5} value={worldRating} onChange={(event) => setWorldRating(Number(event.target.value))} className="w-full" />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Review</label>
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Share your thoughts..."
          rows={5}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={createReview.isPending}>
        {createReview.isPending ? "Submitting..." : "Post Review"}
      </Button>
    </form>
  );
};

