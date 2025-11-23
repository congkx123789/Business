// Library item card used by both grid and list layouts
"use client";

import React from "react";
import { LibraryItem } from "7-shared";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface LibraryStorySummary {
  id: string | number;
  title: string;
  author?: string;
  coverImage?: string;
  description?: string;
  badges?: string[];
}

export type EnhancedLibraryItem = Partial<LibraryItem> & {
  id: string | number;
  storyId?: string | number;
  title?: string;
  author?: string;
  description?: string;
  coverImage?: string;
  tags?: string[];
  status?: "reading" | "completed" | "unread";
  progress?: number; // 0 - 1
  lastReadAt?: string;
  updatedAt?: string;
  story?: LibraryStorySummary;
};

export interface LibraryItemCardProps {
  item: EnhancedLibraryItem;
  layout?: "grid" | "list";
  isSelected?: boolean;
  onSelect?: (itemId: string | number, checked: boolean) => void;
  onOpen?: (item: EnhancedLibraryItem) => void;
  onAction?: (action: "remove" | "download" | "sync", item: EnhancedLibraryItem) => void;
}

const FALLBACK_COVER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='428' viewBox='0 0 320 428'><rect width='320' height='428' rx='24' fill='%23f5f5f5'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='20' fill='%23999999'>No Cover</text></svg>";

const getDisplayTitle = (item: EnhancedLibraryItem) =>
  item.story?.title ?? item.title ?? `Story #${item.storyId ?? item.id}`;
const getDisplayAuthor = (item: EnhancedLibraryItem) => item.story?.author ?? item.author ?? "Unknown author";
const getCoverImage = (item: EnhancedLibraryItem) =>
  item.coverImage ?? item.story?.coverImage ?? FALLBACK_COVER;

export const LibraryItemCard: React.FC<LibraryItemCardProps> = ({
  item,
  layout = "grid",
  isSelected = false,
  onSelect,
  onOpen,
  onAction,
}) => {
  const title = getDisplayTitle(item);
  const author = getDisplayAuthor(item);
  const coverImage = getCoverImage(item);
  const tags = item.tags ?? item.story?.badges ?? [];
  const progress = typeof item.progress === "number" ? Math.min(Math.max(item.progress, 0), 1) : undefined;
  const status = item.status ?? "reading";

  const handleSelectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelect?.(item.id, event.target.checked);
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground transition-all",
        isSelected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md",
        layout === "list" ? "p-4" : "p-0"
      )}
      data-testid={`library-item-${item.id}`}
    >
      <div className={cn("flex gap-4", layout === "grid" ? "flex-col" : "flex-row items-start")}>
        <div className={cn("relative shrink-0", layout === "grid" ? "w-full" : "w-28 h-40")}>
          <div
            className={cn(
              "overflow-hidden rounded-lg bg-muted",
              layout === "grid" ? "aspect-[3/4]" : "w-full h-full"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt={title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          <label className="absolute left-2 top-2 inline-flex items-center gap-2 rounded-full bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-muted-foreground/50"
              checked={isSelected}
              onChange={handleSelectChange}
            />
            Select
          </label>

          <span className="absolute bottom-2 left-2 rounded-full bg-primary/90 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">
            {status}
          </span>
        </div>

        <div className="flex-1 space-y-3 px-4 pb-4 pt-2">
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold leading-snug">{title}</h3>
                <p className="text-sm text-muted-foreground">{author}</p>
              </div>
              {item.lastReadAt && (
                <span className="text-xs text-muted-foreground">
                  Last read {new Date(item.lastReadAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {(item.description ?? item.story?.description) && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {item.description ?? item.story?.description}
              </p>
            )}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {progress !== undefined && (
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button size="sm" onClick={() => onOpen?.(item)}>
              Continue Reading
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction?.("download", item)}
            >
              Download
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onAction?.("remove", item)}
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


