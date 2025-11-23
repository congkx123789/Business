"use client";

import React from "react";
import { useBulkSelection } from "@/lib/hooks/desktop/useBulkSelection";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BulkAction {
  id: string;
  label: string;
  onClick: (selectedIds: string[]) => Promise<void> | void;
  variant?: React.ComponentProps<typeof Button>["variant"];
  disabled?: boolean;
}

interface BulkActionBarProps {
  actions: BulkAction[];
  className?: string;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({ actions, className }) => {
  const { selectedIds, selectionCount, clear } = useBulkSelection();
  if (selectionCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "sticky bottom-4 z-30 flex flex-wrap items-center gap-3 rounded-2xl border bg-background/95 p-3 shadow-2xl",
        className
      )}
    >
      <div className="text-sm font-semibold">
        {selectionCount} selected
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            size="sm"
            variant={action.variant ?? "default"}
            disabled={action.disabled}
            onClick={() => action.onClick(selectedIds)}
          >
            {action.label}
          </Button>
        ))}
      </div>
      <Button size="sm" variant="ghost" onClick={clear}>
        Clear
      </Button>
    </div>
  );
};


