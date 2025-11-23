"use client";

import React from "react";
import { useBulkSelection } from "@/lib/hooks/desktop/useBulkSelection";
import { Button } from "@/components/ui/button";

interface SelectionManagerProps {
  allItemIds: Array<string | number>;
  className?: string;
}

export const SelectionManager: React.FC<SelectionManagerProps> = ({ allItemIds, className }) => {
  const { selectedIds, selectionCount, selectMany, clear } = useBulkSelection();

  const handleSelectAll = () => {
    selectMany(allItemIds.map((id) => id.toString()));
  };

  const isFullySelected = selectionCount > 0 && selectionCount === allItemIds.length;

  if (allItemIds.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
        <span>
          {selectionCount === 0
            ? "No items selected"
            : `${selectionCount} of ${allItemIds.length} selected`}
        </span>
        <div className="flex gap-2">
          <Button size="xs" variant="secondary" onClick={handleSelectAll} disabled={isFullySelected}>
            Select All
          </Button>
          <Button size="xs" variant="ghost" onClick={clear} disabled={selectedIds.length === 0}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};


