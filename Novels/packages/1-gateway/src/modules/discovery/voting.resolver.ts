import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { DiscoveryService } from "./discovery.service";

@Resolver("Voting")
@UseGuards(JwtAuthGuard)
export class VotingResolver {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Mutation("castPowerStone")
  castPowerStone(
    @CurrentUser() user: any,
    @Args("storyId") storyId: string,
    @Args("amount") amount?: number,
  ) {
    return this.discoveryService.castPowerStone({
      storyId,
      amount,
      userId: String(user?.userId ?? user?.id),
    });
  }

  @Mutation("castMonthlyVote")
  castMonthlyVote(
    @CurrentUser() user: any,
    @Args("storyId") storyId: string,
    @Args("amount") amount?: number,
  ) {
    return this.discoveryService.castMonthlyVote({
      storyId,
      amount,
      userId: String(user?.userId ?? user?.id),
    });
  }

  @Query("userVotes")
  userVotes(@CurrentUser() user: any) {
    return this.discoveryService.getUserVotes(String(user?.userId ?? user?.id));
  }
}


