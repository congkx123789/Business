import { Module } from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service";
import { AllYouCanReadService } from "./all-you-can-read/all-you-can-read.service";
import { LoyaltyProgramService } from "./loyalty-program/loyalty-program.service";
import { VirtualCurrencyModule } from "../virtual-currency/virtual-currency.module";
import { DatabaseModule } from "../../common/database/database.module";
import { QueueModule } from "../../common/queue/queue.module";

@Module({
  imports: [DatabaseModule, QueueModule, VirtualCurrencyModule],
  providers: [SubscriptionsService, AllYouCanReadService, LoyaltyProgramService],
  exports: [SubscriptionsService, AllYouCanReadService, LoyaltyProgramService],
})
export class SubscriptionsModule {}


