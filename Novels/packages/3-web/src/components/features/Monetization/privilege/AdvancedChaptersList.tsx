"use client";

import React from "react";

interface AdvancedChaptersListProps {
  chapters: Array<{ id: string; title: string; releaseDate?: string }>;
  onRead: (chapterId: string) => void;
}

export const AdvancedChaptersList: React.FC<AdvancedChaptersListProps> = ({ chapters, onRead }) => {
  if (chapters.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
        No advanced chapters available yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chapters.map((chapter) => (
        <div key={chapter.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-card/70 px-4 py-3">
          <div>
            <p className="font-medium text-foreground">{chapter.title}</p>
            {chapter.releaseDate && (
              <p className="text-xs text-muted-foreground">
                Releases {new Date(chapter.releaseDate).toLocaleDateString()}
              </p>
            )}
          </div>
          <button
            type="button"
            className="rounded-md border border-primary px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
            onClick={() => onRead(chapter.id)}
          >
            Read Now
          </button>
        </div>
      ))}
    </div>
  );
};

