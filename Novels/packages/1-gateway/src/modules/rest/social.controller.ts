import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { SocialService } from "../social/social.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

const resolveUserId = (user: any): number => {
  const value = Number(user?.userId ?? user?.id);
  return Number.isNaN(value) ? 0 : value;
};

@Controller("feed")
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private readonly socialService: SocialService) {}

  @Get()
  async getFeed(
    @CurrentUser() user: any,
    @Query("page") page = "1",
    @Query("limit") limit = "20",
  ) {
    const userId = resolveUserId(user).toString();
    return this.socialService.getFeed(userId, parseInt(page), parseInt(limit));
  }
}

@Controller("posts")
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly socialService: SocialService) {}

  @Post()
  async createPost(
    @Body() body: { content: string; storyId?: number; groupId?: number },
    @CurrentUser() user: any,
  ) {
    const userId = resolveUserId(user).toString();
    return this.socialService.createPost({
      userId,
      content: body.content,
      storyId: body.storyId?.toString(),
      groupId: body.groupId?.toString(),
    });
  }

  @Delete(":id")
  async deletePost(@Param("id") id: string, @CurrentUser() user: any) {
    const userId = resolveUserId(user).toString();
    return this.socialService.deletePost(id, userId);
  }

  @Post(":id/like")
  async likePost(@Param("id") id: string, @CurrentUser() user: any) {
    const userId = resolveUserId(user).toString();
    return this.socialService.likePost(id, userId);
  }
}

@Controller("groups")
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly socialService: SocialService) {}

  @Post()
  async createGroup(
    @Body() body: { name: string; description: string },
    @CurrentUser() user: any,
  ) {
    const ownerId = resolveUserId(user).toString();
    return this.socialService.createGroup({
      ownerId,
      name: body.name,
      description: body.description,
    });
  }

  @Get(":id")
  async getGroup(@Param("id") id: string) {
    return this.socialService.getGroup(id);
  }

  @Post(":id/join")
  async joinGroup(@Param("id") id: string, @CurrentUser() user: any) {
    const userId = resolveUserId(user).toString();
    return this.socialService.joinGroup(id, userId);
  }
}

@Controller("book-clubs")
@UseGuards(JwtAuthGuard)
export class BookClubsController {
  constructor(private readonly socialService: SocialService) {}

  @Post()
  async createBookClub(
    @Body()
    body: { name: string; description?: string; storyId: number },
    @CurrentUser() user: any,
  ) {
    const ownerId = resolveUserId(user).toString();
    return this.socialService.createBookClub({
      ownerId,
      name: body.name,
      description: body.description || "",
      storyId: body.storyId.toString(),
    });
  }

  @Post(":id/schedule-reading")
  async scheduleReading(
    @Param("id") id: string,
    @Body()
    body: {
      storyId: number;
      chapterNumber: number;
      deadline: string;
      discussionDate?: string;
    },
  ) {
    return this.socialService.scheduleReading({
      groupId: id,
      storyId: body.storyId.toString(),
      chapterNumber: body.chapterNumber,
      deadline: body.deadline,
      discussionDate: body.discussionDate,
    });
  }

  @Get(":id/schedule")
  async getSchedule(@Param("id") id: string) {
    return this.socialService.getSchedule(id);
  }
}

@Controller("follow")
@UseGuards(JwtAuthGuard)
export class FollowController {
  constructor(private readonly socialService: SocialService) {}

  @Post(":userId")
  async followUser(
    @Param("userId") followingId: string,
    @CurrentUser() user: any,
  ) {
    const followerId = resolveUserId(user).toString();
    // Note: Follow/unfollow methods need to be added to SocialService
    // For now, this is a placeholder - the service needs these methods
    throw new Error("Follow/unfollow methods not yet implemented in SocialService");
  }

  @Delete(":userId")
  async unfollowUser(
    @Param("userId") followingId: string,
    @CurrentUser() user: any,
  ) {
    const followerId = resolveUserId(user).toString();
    // Note: Follow/unfollow methods need to be added to SocialService
    throw new Error("Follow/unfollow methods not yet implemented in SocialService");
  }
}

@Controller("reading-challenges")
@UseGuards(JwtAuthGuard)
export class ReadingChallengesController {
  constructor(private readonly socialService: SocialService) {}

  @Post()
  async createChallenge(
    @Body()
    body: {
      name: string;
      description?: string;
      challengeType: "personal" | "community";
      goal: number;
      goalType: "books" | "chapters" | "reading-time" | "pages";
      timeRange: "daily" | "weekly" | "monthly" | "yearly" | "custom";
      startDate: string;
      endDate: string;
      isPublic?: boolean;
    },
    @CurrentUser() user: any,
  ) {
    const creatorId = resolveUserId(user).toString();
    return this.socialService.createReadingChallenge({
      creatorId,
      name: body.name,
      description: body.description || "",
      goal: body.goal,
      goalType: body.goalType,
      challengeType: body.challengeType,
      timeRange: body.timeRange,
      startDate: body.startDate,
      endDate: body.endDate,
      isPublic: body.isPublic,
    });
  }

  @Post(":id/join")
  async joinChallenge(@Param("id") id: string, @CurrentUser() user: any) {
    const userId = resolveUserId(user).toString();
    return this.socialService.joinReadingChallenge(id, userId);
  }

  @Post(":id/progress")
  async updateProgress(
    @Param("id") id: string,
    @Body() body: { progress: number },
    @CurrentUser() user: any,
  ) {
    const userId = resolveUserId(user).toString();
    return this.socialService.updateChallengeProgress(id, userId, body.progress);
  }

  @Get(":id/progress")
  async getProgress(@Param("id") id: string) {
    return this.socialService.getReadingChallenge(id);
  }

  @Get(":id/friends-progress")
  async getFriendProgress(
    @Param("id") id: string,
    @CurrentUser() user: any,
  ) {
    const userId = resolveUserId(user).toString();
    return this.socialService.getChallengeParticipants(id);
  }
}

@Controller("activity-tracking")
@UseGuards(JwtAuthGuard)
export class ActivityTrackingController {
  constructor(private readonly socialService: SocialService) {}

  @Post("goals")
  async setReadingGoal(
    @Body()
    body: {
      goalType: "books" | "chapters" | "reading-time" | "pages";
      target: number;
      timeRange: "daily" | "weekly" | "monthly" | "yearly" | "custom";
      startDate: string;
      endDate: string;
    },
    @CurrentUser() user: any,
  ) {
    const userId = resolveUserId(user).toString();
    return this.socialService.setReadingGoal({
      userId,
      goalType: body.goalType,
      target: body.target,
      timeRange: body.timeRange,
      startDate: body.startDate,
      endDate: body.endDate,
    });
  }

  @Get("feed")
  async getActivityFeed(
    @CurrentUser() user: any,
    @Query("page") page = "1",
    @Query("limit") limit = "20",
  ) {
    const userId = resolveUserId(user).toString();
    return this.socialService.getActivityFeed(
      userId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get("statistics")
  async getReadingStatistics(@CurrentUser() user: any) {
    const userId = resolveUserId(user).toString();
    return this.socialService.getReadingStatistics(userId);
  }
}

