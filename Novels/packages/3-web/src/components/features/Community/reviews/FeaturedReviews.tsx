"use client";

import React from "react";
import { useReviews } from "@/lib/hooks/useReviews";
import { ReviewCard } from "./ReviewCard";

interface FeaturedReviewsProps {
  storyId: string;
  limit?: number;
}

export const FeaturedReviews: React.FC<FeaturedReviewsProps> = ({ storyId, limit = 3 }) => {
  const { data: reviews, isLoading } = useReviews(storyId, { limit, sort: "helpful" });

  if (isLoading || !reviews || reviews.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-xl border border-border/60 bg-card/70 p-6">
      <h3 className="text-lg font-semibold">Featured Reviews</h3>
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
    </div>
  );
};

