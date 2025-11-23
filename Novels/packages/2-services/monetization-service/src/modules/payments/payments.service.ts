import { Injectable } from "@nestjs/common";
import { PurchaseService } from "./purchase.service";
import { ReceiptService } from "./receipt.service";
import { PurchaseChapterDto } from "./dto/purchase-chapter.dto";
import { PurchaseBulkDto } from "./dto/purchase-bulk.dto";
import { PurchaseHistoryQueryDto } from "./dto/purchase-history-query.dto";

@Injectable()
export class PaymentsService {
  constructor(
    private readonly purchaseService: PurchaseService,
    private readonly receiptService: ReceiptService
  ) {}

  async purchaseChapter(request: PurchaseChapterDto) {
    const record = await this.purchaseService.purchaseChapter(request);
    return {
      success: true,
      data: record,
      message: "Purchase completed",
    };
  }

  async purchaseBulk(request: PurchaseBulkDto) {
    const record = await this.purchaseService.purchaseBulk(request);
    return {
      success: true,
      data: record,
      message: "Bulk purchase completed",
    };
  }

  async getPurchaseHistory(query: PurchaseHistoryQueryDto) {
    const history = await this.purchaseService.getPurchaseHistory(query);
    return {
      success: true,
      data: history.data,
      total: history.total,
      message: "Purchase history retrieved",
    };
  }

  getPurchaseReceipt(purchaseId: string, paymentMethod = "wallet") {
    const record = this.purchaseService.getPurchase(purchaseId);
    if (!record) {
      return {
        success: false,
        message: "Purchase not found",
      };
    }

    return {
      success: true,
      data: this.receiptService.generateReceipt(record, paymentMethod),
      message: "Receipt generated",
    };
  }

  async refundPurchase(purchaseId: string, reason: string) {
    const record = await this.purchaseService.refundPurchase(purchaseId, reason);
    if (!record) {
      return {
        success: false,
        message: "Purchase not found or already refunded",
      };
    }

    return {
      success: true,
      data: record,
      message: "Purchase refunded",
    };
  }
}

