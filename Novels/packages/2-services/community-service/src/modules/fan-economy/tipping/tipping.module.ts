import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../../common/database/database.module";
import { TippingService } from "./tipping.service";

@Module({
  imports: [DatabaseModule],
  providers: [TippingService],
  exports: [TippingService],
})
export class TippingModule {}

