// Rating types

export interface Rating {
  id: string;
  userId: string;
  storyId: string;
  rating: number; // 1-5
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

