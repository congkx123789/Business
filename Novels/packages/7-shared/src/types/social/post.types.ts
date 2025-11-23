// Post types

export interface Post {
  id: string;
  userId: string;
  content: string;
  images?: string[];
  storyId?: string;
  chapterId?: string;
  groupId?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
  updatedAt: Date;
}

