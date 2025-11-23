"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useReaderUIStore } from "@/store/reader-ui-store";
import { ReadingSettingsPanel } from "./ReadingSettingsPanel";
import { BACKGROUND_PRESETS } from "./reader-presets";
import { useUpdateReadingPreferences } from "@/lib/hooks/useReadingPreferences";

interface ReaderControlsProps {
  storyTitle?: string;
  chapters?: Array<{ id: string; title: string }>;
  currentChapterId?: string | null;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  onChapterSelect?: (chapterId: string) => void;
  onOpenSettings: () => void;
  onToggleMenu: () => void;
  readingMode?: "scroll" | "page-turn";
}

export const ReaderControls: React.FC<ReaderControlsProps> = ({
  storyTitle,
  chapters = [],
  currentChapterId,
  onPrevChapter,
  onNextChapter,
  onChapterSelect,
  onOpenSettings,
  onToggleMenu,
  readingMode = "scroll",
}) => {
  const { showControls, isSettingsOpen } = useReaderUIStore();
  const updatePreferences = useUpdateReadingPreferences();

  if (!showControls) {
    return null;
  }

  const currentChapter = chapters.find((chapter) => chapter.id === currentChapterId);
  const nextReadingMode = readingMode === "scroll" ? "page-turn" : "scroll";

  const handleReadingModeToggle = () => {
    updatePreferences.mutate({ readingMode: nextReadingMode });
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = BACKGROUND_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;
    updatePreferences.mutate({
      backgroundColor: preset.backgroundColor,
      textColor: preset.textColor,
    });
  };

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-tight text-muted-foreground">Reading</p>
            <h2 className="text-sm font-semibold">{storyTitle || "Story"}</h2>
          </div>

          <div className="flex flex-1 items-center justify-end gap-2 text-sm">
            <select
              className="rounded-md border border-border bg-background px-3 py-2"
              value={currentChapterId ?? ""}
              onChange={(event) => onChapterSelect?.(event.target.value)}
            >
              <option value="" disabled>
                Jump to chapter
              </option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </option>
              ))}
            </select>

            <Button variant="ghost" size="sm" onClick={onPrevChapter}>
              Previous
            </Button>
            <Button variant="ghost" size="sm" onClick={onNextChapter}>
              Next
            </Button>
            <Button variant="outline" size="sm" onClick={onOpenSettings}>
              Aa
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggleMenu}>
              Menu
            </Button>
          </div>
        </div>

        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 border-t border-border/50 px-4 py-2 text-xs uppercase text-muted-foreground">
          <span>Background</span>
          {BACKGROUND_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              size="sm"
              variant="ghost"
              className="rounded-full border border-border text-xs"
              onClick={() => handlePresetSelect(preset.id)}
            >
              {preset.label}
            </Button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-xs">
            <span>Mode:</span>
            <Button variant="ghost" size="sm" onClick={handleReadingModeToggle}>
              {readingMode === "scroll" ? "Scroll" : "Page Turn"}
            </Button>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 bg-background/90 backdrop-blur border-t border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 text-sm">
          <Button variant="ghost" size="sm" onClick={onPrevChapter}>
            ← Previous
          </Button>
          <div className="text-center">
            <p className="text-muted-foreground text-xs">Current Chapter</p>
            <p className="font-medium">{currentChapter?.title || "—"}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onNextChapter}>
            Next →
          </Button>
        </div>
      </div>

      <ReadingSettingsPanel open={isSettingsOpen} />
    </>
  );
};

