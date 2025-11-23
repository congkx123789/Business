import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { appConfig, databaseConfig } from "./config/configuration";
import { DatabaseModule } from "./common/database/database.module";
import { QueueModule } from "./common/queue/queue.module";
import { CacheModule } from "./common/cache/cache.module";
import { PrivilegeModule } from "./modules/privilege/privilege.module";
import { PricingModule } from "./modules/pricing/pricing.module";
import { PaywallModule } from "./modules/paywall/paywall.module";
import { MonetizationController } from "./controllers/monetization.controller";
import { VirtualCurrencyModule } from "./modules/virtual-currency/virtual-currency.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
      load: [appConfig, databaseConfig],
    }),
    DatabaseModule,
    QueueModule,
    CacheModule,
    VirtualCurrencyModule,
    PaymentsModule,
    PrivilegeModule,
    PricingModule,
    PaywallModule,
    SubscriptionsModule,
  ],
  controllers: [MonetizationController],
})
export class AppModule {}

