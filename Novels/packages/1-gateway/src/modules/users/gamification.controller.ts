import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { GamificationService } from "./gamification.service";

@Controller("gamification")
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get("daily-missions")
  getDailyMissions(@CurrentUser() user: any) {
    return this.gamificationService.getDailyMissions(
      String(user?.userId ?? user?.id),
    );
  }

  @Post("claim-mission")
  claimMission(
    @CurrentUser() user: any,
    @Body() payload: { missionId: string },
  ) {
    return this.gamificationService.claimDailyMission(
      String(user?.userId ?? user?.id),
      payload.missionId,
    );
  }

  @Get("power-stones")
  getPowerStones(@CurrentUser() user: any) {
    return this.gamificationService.getPowerStones(
      String(user?.userId ?? user?.id),
    );
  }

  @Get("fast-passes")
  getFastPasses(@CurrentUser() user: any) {
    return this.gamificationService.getFastPasses(
      String(user?.userId ?? user?.id),
    );
  }

  @Post("use-fast-pass")
  useFastPass(
    @CurrentUser() user: any,
    @Body() payload: { storyId: string },
  ) {
    return this.gamificationService.useFastPass(
      String(user?.userId ?? user?.id),
      payload.storyId,
    );
  }

  @Post("exchange-points")
  exchangePoints(
    @CurrentUser() user: any,
    @Body() payload: { amount: number },
  ) {
    return this.gamificationService.exchangePoints(
      String(user?.userId ?? user?.id),
      Number(payload.amount),
    );
  }
}


