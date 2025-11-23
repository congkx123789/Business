export interface ReceiptDto {
  receiptNumber: string;
  purchaseId: string;
  userId: string;
  storyId: string;
  chapterIds: string[];
  totalPrice: number;
  balanceBefore: number;
  balanceAfter: number;
  currency: string;
  issuedAt: string;
  paymentMethod: string;
}


