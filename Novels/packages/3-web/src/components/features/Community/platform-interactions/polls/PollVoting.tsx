"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useVotePoll } from "@/lib/hooks/usePolls";

interface PollVotingProps {
  pollId: string;
  options: Array<{ id: string; text: string; votes?: number }>;
  selectedOptionId?: string;
}

export const PollVoting: React.FC<PollVotingProps> = ({ pollId, options, selectedOptionId }) => {
  const votePoll = useVotePoll();

  const handleVote = (optionId: string) => {
    votePoll.mutate({ pollId, optionId });
  };

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <Button
          key={option.id}
          type="button"
          variant={selectedOptionId === option.id ? "default" : "outline"}
          size="sm"
          className="w-full justify-between"
          onClick={() => handleVote(option.id)}
          disabled={votePoll.isPending}
        >
          <span>{option.text}</span>
          {typeof option.votes === "number" && (
            <span className="text-xs text-muted-foreground">{option.votes} votes</span>
          )}
        </Button>
      ))}
    </div>
  );
};

