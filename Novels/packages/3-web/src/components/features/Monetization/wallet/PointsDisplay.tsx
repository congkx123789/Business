"use client";

import React from "react";

interface PointsDisplayProps {
  balance: number;
}

export const PointsDisplay: React.FC<PointsDisplayProps> = ({ balance }) => {
  return (
    <div className="rounded-xl border border-border/60 bg-card/70 p-4 text-center">
      <p className="text-sm text-muted-foreground">Current Balance</p>
      <p className="text-3xl font-bold text-primary">
        {balance.toLocaleString()} <span className="text-base font-medium text-muted-foreground">points</span>
      </p>
    </div>
  );
};

