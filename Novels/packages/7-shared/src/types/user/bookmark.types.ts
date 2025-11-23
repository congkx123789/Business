// Bookmark types

export interface Bookmark {
  id: string;
  userId: string;
  storyId: string;
  chapterId: string;
  paragraphIndex?: number; // Optional paragraph-level bookmark
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

