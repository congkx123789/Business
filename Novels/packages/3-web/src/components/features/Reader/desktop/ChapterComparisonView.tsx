"use client";

import React, { useMemo, useRef } from "react";
import { SplitView } from "@/components/ui/split-view";
import {
  ReaderContent,
  type ChapterContent,
  type ReadingPreferences,
} from "@/components/features/Reader/ReaderContent";
import { Button } from "@/components/ui/button";
import { useSplitView } from "@/lib/hooks/desktop/useSplitView";
import { cn } from "@/lib/utils";

interface ChapterComparisonViewProps {
  leftChapter: ChapterContent | null;
  rightChapter: ChapterContent | null;
  leftTitle?: string;
  rightTitle?: string;
  preferences?: {
    left?: ReadingPreferences;
    right?: ReadingPreferences;
  };
  onSelectLeft?: () => void;
  onSelectRight?: () => void;
  onExit?: () => void;
  isProtectedContent?: boolean;
}

export const ChapterComparisonView: React.FC<ChapterComparisonViewProps> = ({
  leftChapter,
  rightChapter,
  leftTitle,
  rightTitle,
  preferences,
  onSelectLeft,
  onSelectRight,
  onExit,
  isProtectedContent = false,
}) => {
  const {
    splitPosition,
    setSplitPosition,
    syncScroll,
    toggleSyncScroll,
    swapChapters,
  } = useSplitView();
  const leftContainerRef = useRef<HTMLDivElement>(null);
  const rightContainerRef = useRef<HTMLDivElement>(null);
  const syncSideRef = useRef<"left" | "right" | null>(null);

  const handleScroll =
    (side: "left" | "right") =>
    (event: React.UIEvent<HTMLDivElement>) => {
      if (!syncScroll) return;
      if (syncSideRef.current && syncSideRef.current !== side) return;

      const otherRef = side === "left" ? rightContainerRef.current : leftContainerRef.current;
      if (!otherRef) return;

      syncSideRef.current = side;
      otherRef.scrollTop = (event.currentTarget as HTMLDivElement).scrollTop;
      requestAnimationFrame(() => {
        syncSideRef.current = null;
      });
    };

  const leftLabel = leftTitle || leftChapter?.title || "Select chapter";
  const rightLabel = rightTitle || rightChapter?.title || "Select chapter";

  const emptyState = useMemo(
    () => (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 rounded-2xl border bg-muted/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">Select a chapter to begin comparison.</p>
      </div>
    ),
    []
  );

  return (
    <div className="space-y-4 rounded-3xl border bg-background/90 p-4 shadow-lg">
      <header className="flex flex-wrap items-center gap-3 rounded-2xl border bg-muted/40 px-4 py-3">
        <div className="flex flex-1 flex-wrap gap-4 text-sm">
          <div>
            <div className="text-xs uppercase text-muted-foreground">Left Pane</div>
            <div className="font-semibold">{leftLabel}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-muted-foreground">Right Pane</div>
            <div className="font-semibold">{rightLabel}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={swapChapters} disabled={!leftChapter && !rightChapter}>
            Swap
          </Button>
          <Button
            variant={syncScroll ? "default" : "outline"}
            size="sm"
            onClick={toggleSyncScroll}
          >
            {syncScroll ? "Synced Scroll" : "Sync Scroll"}
          </Button>
          {onExit && (
            <Button variant="ghost" size="sm" onClick={onExit}>
              Exit
            </Button>
          )}
        </div>
      </header>

      <SplitView
        position={splitPosition}
        onPositionChange={setSplitPosition}
        left={
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <div className="text-sm font-medium">Left Chapter</div>
              <Button size="sm" variant="outline" onClick={onSelectLeft}>
                Change
              </Button>
            </div>
            <div
              ref={leftContainerRef}
              className="h-full overflow-y-auto"
              onScroll={handleScroll("left")}
            >
              {leftChapter ? (
                <ReaderContent
                  chapter={leftChapter}
                  preferences={preferences?.left}
                  showParagraphComments={false}
                  isProtectedContent={isProtectedContent || !!leftChapter.isProtected}
                />
              ) : (
                emptyState
              )}
            </div>
          </div>
        }
        right={
          <div className="flex h-full flex-col border-l">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <div className="text-sm font-medium">Right Chapter</div>
              <Button size="sm" variant="outline" onClick={onSelectRight}>
                Change
              </Button>
            </div>
            <div
              ref={rightContainerRef}
              className="h-full overflow-y-auto"
              onScroll={handleScroll("right")}
            >
              {rightChapter ? (
                <ReaderContent
                  chapter={rightChapter}
                  preferences={preferences?.right}
                  showParagraphComments={false}
                  isProtectedContent={isProtectedContent || !!rightChapter.isProtected}
                />
              ) : (
                emptyState
              )}
            </div>
          </div>
        }
      />

      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        <div>
          Drag the divider to adjust pane sizes. Scroll sync keeps both panes aligned when enabled.
        </div>
        <div className="flex gap-2">
          <span className={cn("rounded-full bg-background px-2 py-1 font-semibold text-foreground")}>
            {Number(splitPosition.toFixed(0))} / {100 - Number(splitPosition.toFixed(0))}
          </span>
        </div>
      </footer>
    </div>
  );
};


