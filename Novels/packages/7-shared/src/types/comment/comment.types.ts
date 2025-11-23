// Comment types

export interface Comment {
  id: string;
  userId: string;
  storyId?: string;
  chapterId?: string;
  content: string;
  parentId?: string; // For nested comments
  upvotes: number;
  downvotes: number;
  replies: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

