import { Module } from "@nestjs/common";
import { MonetizationService } from "./monetization.service";
import { WalletController } from "./wallet.controller";
import { WalletResolver } from "./wallet.resolver";
import { MembershipController } from "./membership.controller";
import { MembershipResolver } from "./membership.resolver";
import { PrivilegeController } from "./privilege.controller";
import { PrivilegeResolver } from "./privilege.resolver";
import { PaymentsController } from "./payments.controller";
import { PaymentsResolver } from "./payments.resolver";
import { MonetizationClientModule } from "../../clients/monetization-client.module";

@Module({
  imports: [MonetizationClientModule],
  controllers: [
    WalletController,
    MembershipController,
    PrivilegeController,
    PaymentsController,
  ],
  providers: [
    MonetizationService,
    WalletResolver,
    MembershipResolver,
    PrivilegeResolver,
    PaymentsResolver,
  ],
})
export class MonetizationModule {}

