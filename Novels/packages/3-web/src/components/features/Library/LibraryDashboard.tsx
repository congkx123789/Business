// Library Dashboard component
"use client";

import React, { useMemo } from "react";
import { useLibrary, useRemoveFromLibrary } from "@/lib/hooks/useLibrary";
import { useLibraryStore } from "@/store/library-store";
import { SyncStatusIndicator } from "@/components/shared/SyncStatusIndicator";
import { useSyncStatus } from "@/lib/hooks/sync/useSyncStatus";
import { Button } from "@/components/ui/button";
import { LibraryGrid } from "./LibraryGrid";
import { LibraryList } from "./LibraryList";
import type { EnhancedLibraryItem } from "./LibraryItemCard";
import { useKeyboardShortcuts } from "@/lib/hooks/desktop/useKeyboardShortcuts";
import { useRouter } from "next/navigation";
import { AdvancedSearchPanel } from "@/components/desktop/advanced-search/AdvancedSearchPanel";
import { useSearchFiltersStore } from "@/store/desktop/search-filters-store";
import { applySearchQuery } from "@/lib/desktop/search/filter-engine";

type SortOption = "recent" | "title" | "progress" | "added";
type CompletionFilter = "all" | "reading" | "completed" | "unread";

const SORT_LABELS: Record<SortOption, string> = {
  recent: "Last read",
  title: "Title (A-Z)",
  progress: "Progress",
  added: "Date added",
};

const COMPLETION_LABELS: Record<CompletionFilter, string> = {
  all: "All statuses",
  reading: "Reading",
  completed: "Completed",
  unread: "Not started",
};

const normalizeId = (value: string | number) => value.toString();

const sortLibraryItems = (items: EnhancedLibraryItem[], sortBy: SortOption) => {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return (a.title ?? a.story?.title ?? "").localeCompare(b.title ?? b.story?.title ?? "");
      case "progress":
        return (b.progress ?? 0) - (a.progress ?? 0);
      case "added":
        return new Date(b.addedAt ?? b.updatedAt ?? 0).getTime() - new Date(a.addedAt ?? a.updatedAt ?? 0).getTime();
      case "recent":
      default:
        return new Date(b.lastReadAt ?? b.updatedAt ?? 0).getTime() - new Date(a.lastReadAt ?? a.updatedAt ?? 0).getTime();
    }
  });
};

const filterLibraryItems = (
  items: EnhancedLibraryItem[],
  completionStatus: CompletionFilter
) => {
  if (completionStatus === "all") {
    return items;
  }

  return items.filter((item) => (item.status ?? "reading") === completionStatus);
};

export const LibraryDashboard: React.FC = () => {
  const router = useRouter();
  const { data: libraryData, isLoading } = useLibrary();
  const removeFromLibrary = useRemoveFromLibrary();
  const {
    layout,
    setLayout,
    sortBy,
    setSortBy,
    filterBy,
    setFilterBy,
    selectedItems,
    setSelectedItems,
    clearSelection,
  } = useLibraryStore();
  const { status, lastSyncTime } = useSyncStatus();
  const { appliedQuery, query: draftQuery } = useSearchFiltersStore();

  // Register keyboard shortcuts for library
  useKeyboardShortcuts(
    [
      {
        action: "library.toggle-view",
        handler: () => {
          setLayout(layout === "grid" ? "list" : "grid");
        },
      },
      {
        action: "library.search",
        handler: () => {
          // Focus search input if it exists
          const searchInput = document.querySelector("input[type='search']") as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        },
      },
    ],
    "library"
  );

  const libraryItems: EnhancedLibraryItem[] = Array.isArray(libraryData) ? libraryData : [];

  const filteredItems = useMemo(() => {
    const completionStatus = (filterBy.completionStatus ?? "all") as CompletionFilter;
    const sortOption = (sortBy ?? "recent") as SortOption;
    const afterFilter = filterLibraryItems(libraryItems, completionStatus);
    const sorted = sortLibraryItems(afterFilter, sortOption);
    return applySearchQuery(sorted, appliedQuery ?? draftQuery);
  }, [libraryItems, filterBy.completionStatus, sortBy, appliedQuery, draftQuery]);

  const handleSelectItem = (itemId: string | number, checked: boolean) => {
    const id = normalizeId(itemId);
    if (checked && !selectedItems.includes(id)) {
      setSelectedItems([...selectedItems, id]);
      return;
    }

    if (!checked && selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((value) => value !== id));
    }
  };

  const handleOpenItem = (item: EnhancedLibraryItem) => {
    const storyId = item.storyId || item.id;
    if (storyId) {
      router.push(`/reader/${storyId}`);
    }
  };

  const handleAction = async (action: "remove" | "download" | "sync", item: EnhancedLibraryItem) => {
    const storyId = item.storyId || item.id;
    if (!storyId) {
      return;
    }

    switch (action) {
      case "remove":
        await removeFromLibrary.mutateAsync(storyId.toString());
        break;
      case "download":
        // Download functionality will be implemented when offline reading is ready
        break;
      case "sync":
        // Sync functionality is handled by sync manager
        break;
    }
  };

  const selectedCount = selectedItems.length;

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Library</h1>
            <p className="text-sm text-muted-foreground">
              {libraryItems.length} stories · Last sync{" "}
              {lastSyncTime ? lastSyncTime.toLocaleString() : "never"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SyncStatusIndicator status={status} />
            <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
              <Button
                variant={layout === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLayout("grid")}
              >
                Grid
              </Button>
              <Button
                variant={layout === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLayout("list")}
              >
                List
              </Button>
            </div>
          </div>
        </header>

        <section className="flex flex-wrap items-center gap-4 rounded-xl border bg-card/50 p-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Sort By</label>
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
            >
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Status</label>
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={filterBy.completionStatus ?? "all"}
              onChange={(event) =>
                setFilterBy({
                  completionStatus: event.target.value as CompletionFilter,
                })
              }
            >
              {Object.entries(COMPLETION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {selectedCount > 0 && (
            <div className="ml-auto flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{selectedCount} selected</span>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          )}
        </section>

        <AdvancedSearchPanel items={libraryItems} />

        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground">Loading library...</div>
        ) : filteredItems.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">Your library is empty</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Start adding stories to your library to see them here.
            </p>
          </div>
        ) : layout === "grid" ? (
          <LibraryGrid
            items={filteredItems}
            selectedItems={selectedItems}
            onSelectItem={handleSelectItem}
            onOpenItem={handleOpenItem}
            onAction={handleAction}
          />
        ) : (
          <LibraryList
            items={filteredItems}
            selectedItems={selectedItems}
            onSelectItem={handleSelectItem}
            onOpenItem={handleOpenItem}
            onAction={handleAction}
          />
        )}
      </div>
    </div>
  );
};

