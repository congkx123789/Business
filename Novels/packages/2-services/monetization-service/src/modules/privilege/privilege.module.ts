import { Module } from "@nestjs/common";
import { PrivilegeService } from "./privilege.service";
import { VirtualCurrencyModule } from "../virtual-currency/virtual-currency.module";
import { DatabaseModule } from "../../common/database/database.module";
import { QueueModule } from "../../common/queue/queue.module";

@Module({
  imports: [DatabaseModule, QueueModule, VirtualCurrencyModule],
  providers: [PrivilegeService],
  exports: [PrivilegeService],
})
export class PrivilegeModule {}

