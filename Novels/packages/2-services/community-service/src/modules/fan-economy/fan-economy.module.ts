import { Module } from "@nestjs/common";
import { FanEconomyService } from "./fan-economy.service";
import { TippingModule } from "./tipping/tipping.module";
import { RankingsModule } from "./rankings/rankings.module";
import { GamificationModule } from "./gamification/gamification.module";
import { VotesModule } from "./votes/votes.module";
import { AuthorFanModule } from "./author-fan/author-fan.module";

@Module({
  imports: [TippingModule, RankingsModule, GamificationModule, VotesModule, AuthorFanModule],
  providers: [FanEconomyService],
  exports: [FanEconomyService],
})
export class FanEconomyModule {}

