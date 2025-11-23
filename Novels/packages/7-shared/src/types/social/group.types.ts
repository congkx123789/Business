// Group types (Book Clubs)

export interface Group {
  id: string;
  name: string;
  description?: string;
  type: 'general' | 'book-club';
  storyId?: string; // For book clubs
  ownerId: string;
  memberCount: number;
  isPublic: boolean;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookClub extends Group {
  type: 'book-club';
  storyId: string;
  readingSchedule?: ReadingSchedule;
}

export interface ReadingSchedule {
  id: string;
  groupId: string;
  storyId: string;
  chapterNumber: number;
  deadline: Date;
  discussionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

