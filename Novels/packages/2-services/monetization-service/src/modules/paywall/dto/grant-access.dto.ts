export interface GrantAccessDto {
  userId: string;
  chapterId: string;
  storyId: string;
  reason: "purchased" | "subscription" | "privilege";
  expiresAt?: string | null;
}

