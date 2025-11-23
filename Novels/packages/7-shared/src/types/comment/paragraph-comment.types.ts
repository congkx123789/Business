// Paragraph Comment types (Duanping)

export interface ParagraphComment {
  id: string;
  userId: string;
  storyId: string;
  chapterId: string;
  paragraphIndex: number;
  paragraphText: string; // Snapshot of paragraph text
  content: string;
  reactionType?: ReactionType;
  likeCount: number;
  replyCount: number;
  isAuthorLiked: boolean;
  isAuthorReplied: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParagraphCommentLike {
  id: string;
  commentId: string;
  userId: string;
  isAuthor: boolean;
  createdAt: Date;
}

export interface ParagraphCommentReply {
  id: string;
  commentId: string;
  userId: string;
  content: string;
  isAuthorReply: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ReactionType = 'like' | 'laugh' | 'cry' | 'angry' | 'wow' | 'love' | null;

