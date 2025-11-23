"use client";

import React from "react";
import { useBulkSelection } from "@/lib/hooks/desktop/useBulkSelection";
import { cn } from "@/lib/utils";

interface BulkSelectorProps {
  itemId: string | number;
  label?: React.ReactNode;
  className?: string;
}

export const BulkSelector: React.FC<BulkSelectorProps> = ({ itemId, label = "Select", className }) => {
  const { isSelected, toggle } = useBulkSelection();
  const checked = isSelected(itemId.toString());

  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 rounded-full bg-background/80 px-2 py-1 text-xs font-medium shadow-sm ring-1 ring-border transition hover:bg-background",
        className
      )}
    >
      <input
        type="checkbox"
        className="h-3.5 w-3.5 rounded border-muted-foreground/50"
        checked={checked}
        onChange={() => toggle(itemId.toString())}
      />
      {label}
    </label>
  );
};


