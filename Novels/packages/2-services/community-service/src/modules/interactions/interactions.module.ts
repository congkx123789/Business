import { Module } from "@nestjs/common";
import { MicroCommentsModule } from "./micro/micro-comments.module";
import { MesoCommentsModule } from "./meso/meso-comments.module";
import { MacroCommentsModule } from "./macro/macro-comments.module";
import { PlatformInteractionsModule } from "./platform/platform-interactions.module";
import { InteractionsService } from "./interactions.service";

@Module({
  imports: [MicroCommentsModule, MesoCommentsModule, MacroCommentsModule, PlatformInteractionsModule],
  providers: [InteractionsService],
  exports: [InteractionsService],
})
export class InteractionsModule {}

