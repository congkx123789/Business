"use client";

import React from "react";

interface FreeChaptersIndicatorProps {
  freeChaptersRemaining: number;
  totalFreeChapters: number;
}

export const FreeChaptersIndicator: React.FC<FreeChaptersIndicatorProps> = ({
  freeChaptersRemaining,
  totalFreeChapters,
}) => {
  const percentage = Math.round((freeChaptersRemaining / totalFreeChapters) * 100);

  return (
    <div className="rounded-xl border border-border/60 bg-card/70 p-4">
      <p className="text-xs uppercase text-muted-foreground">Free Chapter Progress</p>
      <div className="mt-2 flex items-center justify-between text-sm">
        <span>{freeChaptersRemaining} remaining</span>
        <span className="text-muted-foreground">{totalFreeChapters} total</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

