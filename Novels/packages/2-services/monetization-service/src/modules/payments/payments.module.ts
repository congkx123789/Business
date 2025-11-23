import { Module } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PurchaseService } from "./purchase.service";
import { ReceiptService } from "./receipt.service";
import { PaywallModule } from "../paywall/paywall.module";
import { PricingModule } from "../pricing/pricing.module";
import { VirtualCurrencyModule } from "../virtual-currency/virtual-currency.module";
import { DatabaseModule } from "../../common/database/database.module";
import { QueueModule } from "../../common/queue/queue.module";

@Module({
  imports: [DatabaseModule, QueueModule, PaywallModule, PricingModule, VirtualCurrencyModule],
  providers: [PaymentsService, PurchaseService, ReceiptService],
  exports: [PaymentsService],
})
export class PaymentsModule {}


