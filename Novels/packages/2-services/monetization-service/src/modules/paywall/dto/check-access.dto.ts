export interface CheckAccessDto {
  userId: string;
  chapterId: string;
  storyId: string;
  chapterNumber?: number;
}

export interface AccessDecision {
  hasAccess: boolean;
  reason: "free" | "purchased" | "subscription" | "privilege" | "paywall" | "expired";
  price?: number;
  expiresAt?: string | null;
}


