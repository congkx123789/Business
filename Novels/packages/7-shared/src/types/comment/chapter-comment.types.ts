// Chapter Comment types

export interface ChapterComment {
  id: string;
  userId: string;
  chapterId: string;
  content: string;
  parentId?: string; // For nested comments
  upvotes: number;
  downvotes: number;
  replies: ChapterComment[];
  createdAt: Date;
  updatedAt: Date;
}

