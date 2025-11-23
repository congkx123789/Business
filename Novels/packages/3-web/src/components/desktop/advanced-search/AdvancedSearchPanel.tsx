"use client";

import React from "react";
import { SearchBuilder } from "./SearchBuilder";
import { SavedFilters } from "./SavedFilters";
import { Button } from "@/components/ui/button";
import { useAdvancedSearch } from "@/lib/hooks/desktop/useAdvancedSearch";
import type { EnhancedLibraryItem } from "@/components/features/Library/LibraryItemCard";
import { Input } from "@/components/ui/input";

interface AdvancedSearchPanelProps {
  items?: EnhancedLibraryItem[] | null;
  onResults?: (items: EnhancedLibraryItem[]) => void;
}

export const AdvancedSearchPanel: React.FC<AdvancedSearchPanelProps> = ({ items, onResults }) => {
  const {
    query,
    filteredItems,
    savedFilters,
    activeFilterId,
    setQuery,
    resetQuery,
    applyCurrentQuery,
    clearAppliedQuery,
    saveCurrentFilter,
    deleteFilter,
    renameFilter,
    setActiveFilter,
    ensureEditableQuery,
  } = useAdvancedSearch(items);

  React.useEffect(() => {
    ensureEditableQuery();
  }, []);

  React.useEffect(() => {
    onResults?.(filteredItems);
  }, [filteredItems, onResults]);

  const [newFilterName, setNewFilterName] = React.useState("");

  const handleSaveFilter = () => {
    if (!newFilterName.trim()) {
      return;
    }
    saveCurrentFilter(newFilterName.trim());
    setNewFilterName("");
  };

  return (
    <div className="space-y-6 rounded-3xl border bg-background/80 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">Advanced Search</h3>
          <p className="text-sm text-muted-foreground">
            Combine multiple conditions to pinpoint stories in your library.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetQuery}>
            Clear
          </Button>
          <Button onClick={applyCurrentQuery}>Apply</Button>
          <Button variant="ghost" onClick={clearAppliedQuery}>
            Remove Filter
          </Button>
        </div>
      </div>

      <SearchBuilder query={query} onChange={setQuery} />

      <div className="rounded-2xl border bg-muted/30 p-4">
        <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Save Filter
        </h4>
        <div className="flex flex-col gap-2 md:flex-row">
          <Input
            placeholder="Filter name"
            value={newFilterName}
            onChange={(event) => setNewFilterName(event.target.value)}
          />
          <Button onClick={handleSaveFilter}>Save</Button>
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Saved Filters
        </h4>
        <SavedFilters
          filters={savedFilters}
          activeFilterId={activeFilterId}
          onSelect={setActiveFilter}
          onDelete={deleteFilter}
          onRename={renameFilter}
        />
      </div>
    </div>
  );
};


