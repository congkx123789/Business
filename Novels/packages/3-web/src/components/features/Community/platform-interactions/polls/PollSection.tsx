"use client";

import React, { useState } from "react";
import { usePolls } from "@/lib/hooks/usePolls";
import { PollCard } from "./PollCard";
import { Button } from "@/components/ui/button";

interface PollSectionProps {
  storyId: string;
}

export const PollSection: React.FC<PollSectionProps> = ({ storyId }) => {
  const [showResults, setShowResults] = useState<boolean>(false);
  const { data: polls, isLoading, refetch } = usePolls(storyId);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Community</p>
          <h2 className="text-2xl font-bold">Polls</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowResults((prev) => !prev)}>
            {showResults ? "Vote view" : "Show results"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          Loading polls...
        </div>
      ) : polls && polls.length > 0 ? (
        <div className="space-y-4">
          {polls.map((poll: any) => (
            <PollCard
              key={poll.id}
              poll={{
                id: poll.id,
                question: poll.question,
                description: poll.description,
                options: poll.options,
                totalVotes: poll.totalVotes,
                expiresAt: poll.expiresAt,
                userVoteOptionId: poll.userVoteOptionId,
              }}
              showResults={showResults}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          No polls yet.
        </div>
      )}
    </section>
  );
};

