import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { DiscoveryService } from "./discovery.service";

@Controller("voting")
@UseGuards(JwtAuthGuard)
export class VotingController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Post("cast-power-stone")
  castPowerStone(
    @CurrentUser() user: any,
    @Body() payload: { storyId: string; amount?: number },
  ) {
    return this.discoveryService.castPowerStone({
      storyId: payload.storyId,
      amount: payload.amount,
      userId: String(user?.userId ?? user?.id),
    });
  }

  @Post("cast-monthly-vote")
  castMonthlyVote(
    @CurrentUser() user: any,
    @Body() payload: { storyId: string; amount?: number },
  ) {
    return this.discoveryService.castMonthlyVote({
      storyId: payload.storyId,
      amount: payload.amount,
      userId: String(user?.userId ?? user?.id),
    });
  }

  @Get("user-votes")
  getUserVotes(@CurrentUser() user: any) {
    return this.discoveryService.getUserVotes(String(user?.userId ?? user?.id));
  }
}


