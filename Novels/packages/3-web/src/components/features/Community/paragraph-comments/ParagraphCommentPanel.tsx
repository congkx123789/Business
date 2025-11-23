// Paragraph Comment Panel component - Panel showing all comments for a paragraph
"use client";

import React, { useState } from "react";
import { useParagraphComments, useCreateParagraphComment } from "@/lib/hooks/useParagraphComments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ParagraphCommentList } from "./ParagraphCommentList";
import { QuickReactionButtons, ReactionType } from "./QuickReactionButtons";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ParagraphCommentPanelProps {
  chapterId: string;
  paragraphIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ParagraphCommentPanel: React.FC<ParagraphCommentPanelProps> = ({
  chapterId,
  paragraphIndex,
  isOpen,
  onClose,
}) => {
  const [newComment, setNewComment] = useState("");
  const [selectedReaction, setSelectedReaction] = useState<ReactionType | undefined>();
  const [sortBy, setSortBy] = useState<"newest" | "most-liked">("newest");
  const { data: comments = [], isLoading } = useParagraphComments(chapterId, paragraphIndex);
  const createComment = useCreateParagraphComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await createComment.mutateAsync({
      chapterId,
      paragraphIndex,
      content: newComment,
      reactionType: selectedReaction,
    });
    setNewComment("");
    setSelectedReaction(undefined);
  };

  const handleReaction = (reactionType: ReactionType) => {
    setSelectedReaction(reactionType);
    // Auto-submit quick reaction
    createComment.mutate({
      chapterId,
      paragraphIndex,
      content: "", // Quick reactions don't need text
      reactionType,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold">Paragraph Comments</h3>
          <p className="text-xs text-muted-foreground">Paragraph {paragraphIndex + 1}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close panel">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="border-b p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-muted-foreground">Sort by:</span>
          <Button
            variant={sortBy === "newest" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSortBy("newest")}
          >
            Newest
          </Button>
          <Button
            variant={sortBy === "most-liked" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSortBy("most-liked")}
          >
            Most Liked
          </Button>
        </div>
        <QuickReactionButtons onReaction={handleReaction} selectedReaction={selectedReaction} />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Loading comments...</div>
        ) : comments && comments.length > 0 ? (
          <ParagraphCommentList comments={comments} sortBy={sortBy} />
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>

      <div className="border-t p-4 bg-muted/30">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[80px] resize-none"
            rows={3}
          />
          <Button type="submit" size="sm" className="w-full" disabled={!newComment.trim() || createComment.isPending}>
            {createComment.isPending ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      </div>
    </div>
  );
};

