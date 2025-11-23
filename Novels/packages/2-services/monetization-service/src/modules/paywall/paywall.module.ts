import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../common/database/database.module";
import { CacheModule } from "../../common/cache/cache.module";
import { PaywallService } from "./paywall.service";
import { AccessControlService } from "./access-control.service";

@Module({
  imports: [DatabaseModule, CacheModule],
  providers: [PaywallService, AccessControlService],
  exports: [PaywallService],
})
export class PaywallModule {}

