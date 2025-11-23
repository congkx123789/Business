"use client";

import React from "react";
import { useLikeParagraphComment, useReplyToParagraphComment } from "@/lib/hooks/useParagraphComments";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart, MessageCircle, Trash2 } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  reactionType?: "like" | "laugh" | "cry" | "angry" | "wow" | "love";
  likeCount: number;
  isLiked: boolean;
  isAuthor: boolean; // Is comment author the story author
  createdAt: string;
  replies?: Comment[];
}

interface ParagraphCommentListProps {
  comments: Comment[];
  currentUserId?: string;
  onReply?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  sortBy?: "newest" | "most-liked";
}

export const ParagraphCommentList: React.FC<ParagraphCommentListProps> = ({
  comments,
  currentUserId,
  onReply,
  onDelete,
  sortBy = "newest",
}) => {
  const likeComment = useLikeParagraphComment();
  const replyToComment = useReplyToParagraphComment();

  const sortedComments = React.useMemo(() => {
    const sorted = [...comments];
    if (sortBy === "most-liked") {
      sorted.sort((a, b) => b.likeCount - a.likeCount);
    } else {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return sorted;
  }, [comments, sortBy]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {sortedComments.map((comment) => (
        <div key={comment.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
              {comment.author.avatar ? (
                <img src={comment.author.avatar} alt={comment.author.username} className="h-full w-full rounded-full" />
              ) : (
                comment.author.username.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{comment.author.username}</span>
                {comment.isAuthor && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">Author</span>
                )}
                {comment.reactionType && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground capitalize">
                    {comment.reactionType}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-sm mb-3">{comment.content}</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => likeComment.mutate(comment.id)}
                  className={cn(
                    "flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors",
                    comment.isLiked && "text-primary"
                  )}
                  disabled={likeComment.isPending}
                >
                  <Heart className={cn("h-4 w-4", comment.isLiked && "fill-current")} />
                  <span>{comment.likeCount}</span>
                </button>
                {onReply && (
                  <button
                    onClick={() => onReply(comment.id)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Reply</span>
                  </button>
                )}
                {onDelete && currentUserId === comment.author.id && (
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 ml-4 space-y-2 border-l-2 border-border pl-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{reply.author.username}</span>
                        {reply.isAuthor && (
                          <span className="px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary">Author</span>
                        )}
                        <span className="text-xs text-muted-foreground">{formatDate(reply.createdAt)}</span>
                      </div>
                      <p className="text-muted-foreground">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

