import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SocialService } from "./social.service";

@Controller("social/book-clubs")
@UseGuards(JwtAuthGuard)
export class BookClubsController {
  constructor(private readonly socialService: SocialService) {}

  @Post()
  createBookClub(
    @CurrentUser() user: any,
    @Body() payload: { name: string; description: string; storyId: string },
  ) {
    return this.socialService.createBookClub({
      ownerId: String(user.userId ?? user.id),
      name: payload.name,
      description: payload.description,
      storyId: payload.storyId,
    });
  }

  @Post(":groupId/schedule")
  scheduleReading(
    @Param("groupId") groupId: string,
    @Body()
    payload: { storyId: string; chapterNumber: number; deadline?: string; discussionDate?: string },
  ) {
    return this.socialService.scheduleReading({
      groupId,
      storyId: payload.storyId,
      chapterNumber: payload.chapterNumber,
      deadline: payload.deadline,
      discussionDate: payload.discussionDate,
    });
  }

  @Get(":groupId/schedule")
  getSchedule(@Param("groupId") groupId: string) {
    return this.socialService.getSchedule(groupId);
  }
}


