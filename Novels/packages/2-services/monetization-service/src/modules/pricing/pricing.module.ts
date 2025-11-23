import { Module } from "@nestjs/common";
import { PricingService } from "./pricing.service";
import { PricingRuleService } from "./pricing-rule.service";
import { DatabaseModule } from "../../common/database/database.module";
import { CacheModule } from "../../common/cache/cache.module";

@Module({
  imports: [DatabaseModule, CacheModule],
  providers: [PricingService, PricingRuleService],
  exports: [PricingService, PricingRuleService],
})
export class PricingModule {}

