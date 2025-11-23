"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface VIPLevelsProps {
  levels: Array<{
    id: string;
    name: string;
    requiredSpend: number;
    benefits: string[];
  }>;
}

export const VIPLevels: React.FC<VIPLevelsProps> = ({ levels }) => {
  if (levels.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {levels.map((level) => (
        <div
          key={level.id}
          className={cn(
            "rounded-2xl border border-border/60 bg-card/70 p-4",
            level.id === "vip-5" && "border-yellow-400/60 shadow-lg shadow-yellow-500/10"
          )}
        >
          <p className="text-xs uppercase text-muted-foreground">{level.name}</p>
          <p className="text-sm text-muted-foreground">
            Spend ${level.requiredSpend.toLocaleString()} total
          </p>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {level.benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <span>•</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

