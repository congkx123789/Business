"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PollVoting } from "./PollVoting";
import { PollResults } from "./PollResults";

export interface Poll {
  id: string;
  question: string;
  description?: string;
  options: Array<{ id: string; text: string; votes?: number }>;
  totalVotes?: number;
  expiresAt?: string;
  userVoteOptionId?: string | null;
}

interface PollCardProps {
  poll: Poll;
  showResults?: boolean;
}

export const PollCard: React.FC<PollCardProps> = ({ poll, showResults }) => {
  const totalVotes =
    poll.totalVotes ??
    poll.options.reduce((sum, option) => sum + (typeof option.votes === "number" ? option.votes : 0), 0);

  const expiresLabel = poll.expiresAt
    ? `Ends ${new Date(poll.expiresAt).toLocaleDateString()}`
    : undefined;

  return (
    <Card className="border-border/60 bg-card/70">
      <CardHeader>
        <CardTitle className="text-lg">{poll.question}</CardTitle>
        {poll.description && <CardDescription>{poll.description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {showResults ? (
          <PollResults
            options={poll.options.map((option) => ({
              ...option,
              votes: option.votes ?? 0,
            }))}
            totalVotes={totalVotes}
            selectedOptionId={poll.userVoteOptionId}
          />
        ) : (
          <PollVoting pollId={poll.id} options={poll.options} selectedOptionId={poll.userVoteOptionId ?? undefined} />
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{totalVotes} votes</span>
          {expiresLabel && <span>{expiresLabel}</span>}
        </div>
      </CardContent>
    </Card>
  );
};

