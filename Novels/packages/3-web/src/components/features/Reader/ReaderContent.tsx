"use client";

import React, { useMemo, useState } from "react";
import { FocusModeContainer } from "./desktop/FocusModeContainer";
import { cn } from "@/lib/utils";
import { ParagraphCommentBubble } from "@/components/features/Community/paragraph-comments/ParagraphCommentBubble";
import { ParagraphCommentPanel } from "@/components/features/Community/paragraph-comments/ParagraphCommentPanel";
import { useParagraphCommentCounts } from "@/lib/hooks/useParagraphComments";
import { ProtectedContent } from "@/components/security/ProtectedContent";

export interface ChapterContent {
  id: string;
  title: string;
  content: string;
  index?: number;
  isProtected?: boolean;
}

export interface ReadingPreferences {
  fontSize?: number;
  lineHeight?: number;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  readingMode?: "scroll" | "page-turn";
  brightness?: number;
}

interface ReaderContentProps {
  chapter: ChapterContent | null;
  preferences?: ReadingPreferences;
  onParagraphClick?: (paragraphIndex: number) => void;
  onSelectionChange?: (payload: { text: string; rect: DOMRect | null }) => void;
  showParagraphComments?: boolean; // Enable/disable paragraph comments
  isProtectedContent?: boolean;
  watermarkLabel?: string;
  onProtectionTrigger?: (type: "copy" | "context-menu" | "screenshot") => void;
}

const DEFAULT_PREFERENCES: Required<ReadingPreferences> = {
  fontSize: 16,
  lineHeight: 1.7,
  backgroundColor: "#0f172a",
  textColor: "#e2e8f0",
  fontFamily: "var(--font-sans)",
  readingMode: "scroll",
  brightness: 1,
};

export const ReaderContent: React.FC<ReaderContentProps> = ({
  chapter,
  preferences,
  onParagraphClick,
  onSelectionChange,
  showParagraphComments = true,
  isProtectedContent = false,
  watermarkLabel = "Protected",
  onProtectionTrigger,
}) => {
  const mergedPreferences = { ...DEFAULT_PREFERENCES, ...preferences };
  const [openCommentPanel, setOpenCommentPanel] = useState<number | null>(null);
  
  // Fetch comment counts for all paragraphs
  const { data: commentCounts } = useParagraphCommentCounts(chapter?.id || "");

  if (!chapter) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Loading chapter...
      </div>
    );
  }

  const paragraphs = useMemo(
    () =>
      chapter.content
        ?.split(/\n+/)
        .map((paragraph) => paragraph.trim())
        .filter((paragraph) => paragraph.length > 0) ?? [],
    [chapter.content]
  );

  const handleSelection = () => {
    if (!onSelectionChange || typeof window === "undefined") return;

    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) {
      onSelectionChange({ text: "", rect: null });
      return;
    }

    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const rect = range ? range.getBoundingClientRect() : null;
    onSelectionChange({ text: selection.toString(), rect });
  };

  return (
    <div
      className="min-h-screen w-full transition-colors"
      style={{
        backgroundColor: mergedPreferences.backgroundColor,
        color: mergedPreferences.textColor,
        fontFamily: mergedPreferences.fontFamily,
        filter: `brightness(${mergedPreferences.brightness})`,
      }}
    >
      <div className="mx-auto max-w-5xl px-4 py-10">
        <FocusModeContainer>
          <ProtectedContent
            isProtected={isProtectedContent}
            watermark={watermarkLabel}
            onViolation={onProtectionTrigger}
          >
            <article
              className={cn(
                "rounded-2xl p-6 md:p-10 shadow-lg",
                "transition-all duration-300",
                mergedPreferences.readingMode === "page-turn"
                  ? "page-turn-mode overflow-hidden"
                  : "scroll-mode"
              )}
              style={{
                backgroundColor: mergedPreferences.backgroundColor,
              }}
              onMouseUp={handleSelection}
            >
            <header className="mb-8 space-y-2">
              {typeof chapter.index === "number" && (
                <p className="text-xs uppercase tracking-wide text-primary/70">
                  Chapter {chapter.index + 1}
                </p>
              )}
              <h1 className="text-3xl font-bold">{chapter.title}</h1>
            </header>
            <div
              className="space-y-6 text-lg"
              style={{
                fontSize: mergedPreferences.fontSize,
                lineHeight: mergedPreferences.lineHeight,
              }}
            >
              {paragraphs.map((paragraph, index) => {
                const commentCount = commentCounts?.[index] || 0;
                return (
                  <div key={`${chapter.id}-paragraph-${index}`} className="relative group">
                    <p
                      className="cursor-text pr-12"
                      data-paragraph-index={index}
                      onClick={() => onParagraphClick?.(index)}
                    >
                      {paragraph}
                    </p>
                    {showParagraphComments && (
                      <ParagraphCommentBubble
                        paragraphIndex={index}
                        commentCount={commentCount}
                        onClick={() => setOpenCommentPanel(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    )}
                  </div>
                );
              })}
            </div>
            </article>
          </ProtectedContent>
        </FocusModeContainer>
      </div>
      {showParagraphComments && chapter && openCommentPanel !== null && (
        <ParagraphCommentPanel
          chapterId={chapter.id}
          paragraphIndex={openCommentPanel}
          isOpen={true}
          onClose={() => setOpenCommentPanel(null)}
        />
      )}
    </div>
  );
};
