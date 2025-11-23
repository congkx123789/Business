"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Grid, LayoutGrid, Square } from "lucide-react";

type LayoutMode = "single" | "grid" | "tiled";

interface WindowLayoutProps {
  children: React.ReactNode;
  defaultMode?: LayoutMode;
}

/**
 * WindowLayout component provides multi-pane layout management:
 * - Single view: One tab at a time (default)
 * - Grid view: Multiple tabs in a grid (2x2, 3x3, etc.)
 * - Tiled view: Tabs arranged side-by-side (split view)
 */
export const WindowLayout: React.FC<WindowLayoutProps> = ({
  children,
  defaultMode = "single",
}) => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(defaultMode);
  const [gridColumns, setGridColumns] = useState(2);
  const [gridRows, setGridRows] = useState(2);

  return (
    <div className="relative h-full w-full">
      {/* Layout Controls */}
      <div className="absolute right-4 top-4 z-10 flex gap-2 rounded-lg border border-border bg-background/80 p-2 backdrop-blur-sm">
        <button
          onClick={() => setLayoutMode("single")}
          className={cn(
            "rounded p-2 transition-colors",
            layoutMode === "single"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
          aria-label="Single view"
          title="Single view"
        >
          <Square className="h-4 w-4" />
        </button>
        <button
          onClick={() => setLayoutMode("grid")}
          className={cn(
            "rounded p-2 transition-colors",
            layoutMode === "grid"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
          aria-label="Grid view"
          title="Grid view"
        >
          <Grid className="h-4 w-4" />
        </button>
        <button
          onClick={() => setLayoutMode("tiled")}
          className={cn(
            "rounded p-2 transition-colors",
            layoutMode === "tiled"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
          aria-label="Tiled view"
          title="Tiled view"
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
      </div>

      {/* Layout Content */}
      <div
        className={cn(
          "h-full w-full",
          layoutMode === "single" && "flex",
          layoutMode === "grid" && "grid gap-2 p-2",
          layoutMode === "tiled" && "flex gap-2 p-2"
        )}
        style={
          layoutMode === "grid"
            ? {
                gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
                gridTemplateRows: `repeat(${gridRows}, 1fr)`,
              }
            : undefined
        }
      >
        {layoutMode === "single" ? (
          <div className="h-full w-full">{children}</div>
        ) : layoutMode === "grid" ? (
          // Grid view: Show multiple tabs in a grid
          <div className="col-span-full row-span-full">{children}</div>
        ) : (
          // Tiled view: Side-by-side tabs
          <div className="flex-1">{children}</div>
        )}
      </div>
    </div>
  );
};

