"use client";

import React from "react";
import { useReviews } from "@/lib/hooks/useReviews";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import { Button } from "@/components/ui/button";

interface ReviewsSectionProps {
  storyId: string;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ storyId }) => {
  const { data: reviews, isLoading, refetch } = useReviews(storyId, { limit: 10 });

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Community</p>
          <h2 className="text-2xl font-bold">Reviews</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      <ReviewForm storyId={storyId} />

      {isLoading ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 py-12 text-muted-foreground">
          Loading reviews...
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <ReviewCard
              key={review.id}
              review={{
                id: review.id,
                user: review.user,
                title: review.title,
                content: review.content,
                rating: review.rating,
                ratings: review.ratings,
                helpfulCount: review.helpfulCount,
                notHelpfulCount: review.notHelpfulCount,
                createdAt: review.createdAt,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          No reviews yet. Be the first to share your thoughts!
        </div>
      )}
    </section>
  );
};

