import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../common/database/database.module";
import { QueueModule } from "../../common/queue/queue.module";
import { CacheModule } from "../../common/cache/cache.module";
import { VirtualCurrencyService } from "./virtual-currency.service";
import { WalletService } from "./wallet.service";

@Module({
  imports: [DatabaseModule, QueueModule, CacheModule],
  providers: [VirtualCurrencyService, WalletService],
  exports: [VirtualCurrencyService, WalletService],
})
export class VirtualCurrencyModule {}


