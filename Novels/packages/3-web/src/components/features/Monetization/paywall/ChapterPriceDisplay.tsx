"use client";

import React from "react";

interface ChapterPriceDisplayProps {
  price: number;
  remainingFreeChapters?: number;
}

export const ChapterPriceDisplay: React.FC<ChapterPriceDisplayProps> = ({
  price,
  remainingFreeChapters,
}) => {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/70 px-4 py-3 text-sm">
      <div>
        <p className="text-muted-foreground">Chapter Price</p>
        <p className="text-xl font-semibold text-primary">{price} pts</p>
      </div>
      {typeof remainingFreeChapters === "number" && remainingFreeChapters > 0 && (
        <div className="text-right">
          <p className="text-xs uppercase text-emerald-400">Free chapters left</p>
          <p className="text-2xl font-bold text-emerald-400">{remainingFreeChapters}</p>
        </div>
      )}
    </div>
  );
};

