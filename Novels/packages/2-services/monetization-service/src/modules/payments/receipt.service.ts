import { Injectable } from "@nestjs/common";
import { ReceiptDto } from "./dto/receipt.dto";
import { PurchaseRecord } from "./purchase.service";

@Injectable()
export class ReceiptService {
  private readonly receipts = new Map<string, ReceiptDto>();

  generateReceipt(purchase: PurchaseRecord, paymentMethod: string): ReceiptDto {
    if (this.receipts.has(purchase.id)) {
      return this.receipts.get(purchase.id)!;
    }

    const receipt: ReceiptDto = {
      receiptNumber: `RCPT-${Date.now().toString(36).toUpperCase()}`,
      purchaseId: purchase.id,
      userId: purchase.userId,
      storyId: purchase.storyId,
      chapterIds: purchase.chapterIds,
      totalPrice: purchase.totalPrice,
      balanceBefore: purchase.balanceBefore,
      balanceAfter: purchase.balanceAfter,
      currency: "points",
      issuedAt: new Date().toISOString(),
      paymentMethod,
    };

    this.receipts.set(purchase.id, receipt);
    return receipt;
  }

  getReceipt(purchaseId: string) {
    return this.receipts.get(purchaseId);
  }
}


