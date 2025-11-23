"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useVoteReviewHelpful } from "@/lib/hooks/useReviews";

interface ReviewHelpfulVotingProps {
  reviewId: string;
  helpfulCount?: number;
  notHelpfulCount?: number;
}

export const ReviewHelpfulVoting: React.FC<ReviewHelpfulVotingProps> = ({
  reviewId,
  helpfulCount = 0,
  notHelpfulCount = 0,
}) => {
  const voteHelpful = useVoteReviewHelpful();

  const handleVote = (helpful: boolean) => {
    voteHelpful.mutate({ reviewId, helpful });
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <Button variant="outline" size="sm" onClick={() => handleVote(true)} disabled={voteHelpful.isPending}>
        👍 Helpful ({helpfulCount})
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleVote(false)} disabled={voteHelpful.isPending}>
        👎 ({notHelpfulCount})
      </Button>
    </div>
  );
};

