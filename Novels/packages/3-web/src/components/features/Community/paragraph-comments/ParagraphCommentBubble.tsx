// Paragraph Comment Bubble component - Shows comment count on paragraph
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ParagraphCommentBubbleProps {
  paragraphIndex: number;
  commentCount: number;
  onClick: () => void;
  className?: string;
}

export const ParagraphCommentBubble: React.FC<ParagraphCommentBubbleProps> = ({
  paragraphIndex,
  commentCount,
  onClick,
  className,
}) => {
  if (commentCount === 0) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "absolute right-0 top-0 px-2 py-1 text-xs font-semibold rounded-full",
        "bg-primary/10 text-primary hover:bg-primary/20 transition-colors",
        "border border-primary/20",
        className
      )}
      aria-label={`${commentCount} comments on this paragraph`}
    >
      {commentCount}
    </button>
  );
};

