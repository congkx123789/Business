// Table of Contents component for reader
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Chapter {
  id: string;
  title: string;
  index?: number;
}

interface TableOfContentsProps {
  chapters: Chapter[];
  currentChapterId?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onChapterSelect: (chapterId: string) => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  chapters,
  currentChapterId,
  isOpen,
  onClose,
  onChapterSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-80 bg-background border-r shadow-lg overflow-y-auto">
        <div className="sticky top-0 bg-background border-b px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Table of Contents</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
        <div className="p-4 space-y-1">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => {
                onChapterSelect(chapter.id);
                onClose();
              }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                currentChapterId === chapter.id
                  ? "bg-accent font-medium"
                  : "hover:bg-muted"
              )}
            >
              {chapter.title || `Chapter ${chapter.index !== undefined ? chapter.index + 1 : chapter.id}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

