"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ReviewRatings } from "./ReviewRatings";
import { ReviewHelpfulVoting } from "./ReviewHelpfulVoting";

export interface Review {
  id: string;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  title: string;
  content: string;
  rating: number;
  ratings?: {
    plot?: number;
    characters?: number;
    writing?: number;
    world?: number;
  };
  helpfulCount?: number;
  notHelpfulCount?: number;
  createdAt: string;
}

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{review.title}</CardTitle>
            <CardDescription>
              {review.user.username} • {new Date(review.createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            {review.rating.toFixed(1)} / 5
          </div>
        </div>
        {review.ratings && <ReviewRatings ratings={review.ratings} />}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-muted-foreground">{review.content}</p>
        <ReviewHelpfulVoting
          reviewId={review.id}
          helpfulCount={review.helpfulCount}
          notHelpfulCount={review.notHelpfulCount}
        />
      </CardContent>
    </Card>
  );
};

