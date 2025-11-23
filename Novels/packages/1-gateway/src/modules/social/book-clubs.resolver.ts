import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SocialService } from "./social.service";

@Resolver("BookClub")
@UseGuards(JwtAuthGuard)
export class BookClubsResolver {
  constructor(private readonly socialService: SocialService) {}

  @Mutation("createBookClub")
  createBookClub(
    @CurrentUser() user: any,
    @Args("name") name: string,
    @Args("description") description: string,
    @Args("storyId") storyId: string,
  ) {
    return this.socialService.createBookClub({
      ownerId: String(user.userId ?? user.id),
      name,
      description,
      storyId,
    });
  }

  @Mutation("scheduleGroupReading")
  scheduleGroupReading(
    @Args("groupId") groupId: string,
    @Args("storyId") storyId: string,
    @Args("chapterNumber") chapterNumber: number,
    @Args("deadline") deadline?: string,
    @Args("discussionDate") discussionDate?: string,
  ) {
    return this.socialService.scheduleReading({
      groupId,
      storyId,
      chapterNumber,
      deadline,
      discussionDate,
    });
  }

  @Query("bookClubSchedule")
  bookClubSchedule(@Args("groupId") groupId: string) {
    return this.socialService.getSchedule(groupId);
  }
}


