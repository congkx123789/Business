"use client";

import React from "react";
import { cn } from "@/lib/utils";

const DEFAULT_CATEGORIES = [
  { id: "general", label: "General Discussion" },
  { id: "predictions", label: "Predictions" },
  { id: "characters", label: "Characters" },
  { id: "spoilers", label: "Spoilers" },
];

interface ForumCategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  categories?: Array<{ id: string; label: string }>;
}

export const ForumCategorySelector: React.FC<ForumCategorySelectorProps> = ({
  value,
  onChange,
  categories = DEFAULT_CATEGORIES,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onChange(category.id)}
          className={cn(
            "rounded-full border px-4 py-1 text-sm transition-colors",
            value === category.id
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
          )}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};

