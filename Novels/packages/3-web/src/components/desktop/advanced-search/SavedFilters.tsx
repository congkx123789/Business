"use client";

import React from "react";
import type { SavedFilter } from "@/lib/desktop/search/saved-filters";
import { Button } from "@/components/ui/button";

interface SavedFiltersProps {
  filters: SavedFilter[];
  activeFilterId: string | null;
  onSelect: (filterId: string) => void;
  onDelete: (filterId: string) => void;
  onRename: (filterId: string, name: string) => void;
}

export const SavedFilters: React.FC<SavedFiltersProps> = ({
  filters,
  activeFilterId,
  onSelect,
  onDelete,
  onRename,
}) => {
  if (filters.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
        No saved filters yet. Configure your query and click “Save Filter” to reuse it later.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filters.map((filter) => (
        <div
          key={filter.id}
          className="flex flex-col gap-2 rounded-xl border bg-card/30 p-3 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <div className="text-sm font-semibold">{filter.name}</div>
            <div className="text-xs text-muted-foreground">
              Updated {new Date(filter.updatedAt).toLocaleString()}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter.id === activeFilterId ? "default" : "outline"}
              size="sm"
              onClick={() => onSelect(filter.id)}
            >
              Apply
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onRename(filter.id, prompt("Rename filter", filter.name) ?? filter.name)}>
              Rename
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(filter.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};


