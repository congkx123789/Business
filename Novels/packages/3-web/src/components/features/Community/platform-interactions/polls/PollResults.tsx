"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PollResultsProps {
  options: Array<{ id: string; text: string; votes: number }>;
  totalVotes: number;
  selectedOptionId?: string | null;
}

export const PollResults: React.FC<PollResultsProps> = ({
  options,
  totalVotes,
  selectedOptionId,
}) => {
  return (
    <div className="space-y-3">
      {options.map((option) => {
        const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
        return (
          <div key={option.id} className="space-y-1">
            <div className="flex items-center justify-between text-xs uppercase text-muted-foreground">
              <span>{option.text}</span>
              <span>{percentage}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full bg-primary transition-all",
                  selectedOptionId === option.id && "bg-primary/80"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground">{totalVotes} total votes</p>
    </div>
  );
};

