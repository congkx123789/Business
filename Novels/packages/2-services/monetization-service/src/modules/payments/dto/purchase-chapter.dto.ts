export interface PurchaseChapterDto {
  userId: string;
  storyId: string;
  chapterId: string;
  idempotencyKey?: string;
}


