// Privilege types (Advanced Chapters)

export interface Privilege {
  id: string;
  userId: string;
  storyId: string;
  purchasedAt: Date;
  expiresAt: Date; // Resets monthly (1st of month)
  status: 'active' | 'expired' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface AdvancedChapter {
  id: string;
  storyId: string;
  chapterId: string;
  chapterNumber: number;
  releaseDate: Date;
  privilegeRequired: boolean;
  premiumPrice?: number; // Additional price in points
  createdAt: Date;
  updatedAt: Date;
}

export interface PrivilegePurchase {
  id: string;
  privilegeId: string;
  userId: string;
  storyId: string;
  coinsSpent: number;
  purchasedAt: Date;
  createdAt: Date;
}

