export interface PurchaseBulkDto {
  userId: string;
  storyId: string;
  chapterIds: string[];
  idempotencyKey?: string;
}


