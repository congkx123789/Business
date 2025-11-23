"use client";

import { useState, useMemo } from "react";
import { useGroups } from "@/lib/api/useGroups";
import { GroupCard } from "@/components/features/GroupCard";
import { Group } from "7-shared/types";

export function GroupsList() {
  const { data: groups, isLoading, error } = useGroups();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = useMemo(() => {
    if (!groups) return [];
    if (!searchQuery.trim()) return groups;

    const query = searchQuery.toLowerCase();
    return groups.filter(
      (group: Group) =>
        group.name.toLowerCase().includes(query) ||
        group.description?.toLowerCase().includes(query)
    );
  }, [groups, searchQuery]);

  if (isLoading) {
    return (
      <div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        role="status"
        aria-label="Loading groups"
        aria-live="polite"
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border bg-card p-6"
            aria-hidden="true"
          >
            <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-full mb-2"></div>
            <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="text-center py-12 text-destructive"
        role="alert"
        aria-live="assertive"
      >
        <span className="sr-only">Error: </span>
        Error loading groups: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6" role="main">
      {/* Search Bar */}
      <div className="relative">
        <label htmlFor="group-search" className="sr-only">
          Search groups by name or description
        </label>
        <input
          id="group-search"
          type="search"
          placeholder="Search groups by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border bg-background px-4 py-2 pl-10 pr-4"
          aria-label="Search groups"
          aria-describedby={searchQuery ? "search-results" : undefined}
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Groups Grid */}
      {!filteredGroups || filteredGroups.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          {searchQuery ? (
            <>
              No groups found matching "{searchQuery}". Try a different search term.
            </>
          ) : (
            <>No groups found. Be the first to create one!</>
          )}
        </div>
      ) : (
        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Groups list"
        >
          {filteredGroups.map((group: Group) => (
            <div key={group.id} role="listitem">
              <GroupCard group={group} />
            </div>
          ))}
        </div>
      )}

      {/* Search Results Count */}
      {searchQuery && filteredGroups && filteredGroups.length > 0 && (
        <div
          id="search-results"
          className="text-sm text-muted-foreground text-center"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          Found {filteredGroups.length} group{filteredGroups.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

