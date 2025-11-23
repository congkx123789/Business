import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { GamificationService } from "./gamification.service";

@Resolver("Gamification")
@UseGuards(JwtAuthGuard)
export class GamificationResolver {
  constructor(private readonly gamificationService: GamificationService) {}

  @Query("dailyMissions")
  dailyMissions(@CurrentUser() user: any) {
    return this.gamificationService.getDailyMissions(
      String(user?.userId ?? user?.id),
    );
  }

  @Mutation("claimDailyMission")
  claimDailyMission(
    @CurrentUser() user: any,
    @Args("missionId") missionId: string,
  ) {
    return this.gamificationService.claimDailyMission(
      String(user?.userId ?? user?.id),
      missionId,
    );
  }

  @Query("powerStones")
  powerStones(@CurrentUser() user: any) {
    return this.gamificationService.getPowerStones(
      String(user?.userId ?? user?.id),
    );
  }

  @Query("fastPasses")
  fastPasses(@CurrentUser() user: any) {
    return this.gamificationService.getFastPasses(
      String(user?.userId ?? user?.id),
    );
  }

  @Mutation("useFastPass")
  useFastPass(
    @CurrentUser() user: any,
    @Args("storyId") storyId: string,
  ) {
    return this.gamificationService.useFastPass(
      String(user?.userId ?? user?.id),
      storyId,
    );
  }

  @Mutation("exchangePoints")
  exchangePoints(
    @CurrentUser() user: any,
    @Args("amount") amount: number,
  ) {
    return this.gamificationService.exchangePoints(
      String(user?.userId ?? user?.id),
      amount,
    );
  }
}


