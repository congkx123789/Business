"use client";

import React from "react";
import { Poll, PollCard } from "./PollCard";

interface PollListProps {
  polls: Poll[];
}

export const PollList: React.FC<PollListProps> = ({ polls }) => {
  if (polls.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        No polls available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {polls.map((poll) => (
        <PollCard key={poll.id} poll={poll} />
      ))}
    </div>
  );
};

