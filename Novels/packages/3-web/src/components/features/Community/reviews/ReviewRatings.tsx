"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ReviewRatingsProps {
  ratings?: {
    plot?: number;
    characters?: number;
    writing?: number;
    world?: number;
  };
}

const categories: Array<keyof NonNullable<ReviewRatingsProps["ratings"]>> = [
  "plot",
  "characters",
  "writing",
  "world",
];

export const ReviewRatings: React.FC<ReviewRatingsProps> = ({ ratings }) => {
  if (!ratings) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((category) => {
        const score = ratings[category];
        if (typeof score !== "number") return null;

        return (
          <div key={category} className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
            <span className="text-sm capitalize text-muted-foreground">{category}</span>
            <span className="font-semibold">{score.toFixed(1)}</span>
          </div>
        );
      })}
    </div>
  );
};

