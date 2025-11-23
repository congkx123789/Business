import { UseGuards } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SocialService } from "../social/social.service";

const resolveUserId = (user: any): number =>
  Number(user?.userId ?? user?.id ?? 0);

type OperationResult = { success?: boolean };

@Resolver()
@UseGuards(JwtAuthGuard)
export class SocialResolver {
  constructor(private readonly socialService: SocialService) {}

  @Query(() => [Post], { name: "feed" })
  async getFeed(
    @CurrentUser() user: any,
    @Args("page", { type: () => Int, nullable: true, defaultValue: 1 })
    page: number,
    @Args("limit", { type: () => Int, nullable: true, defaultValue: 20 })
    limit: number,
  ) {
    const userId = resolveUserId(user).toString();
    const result = await this.socialService.getFeed(userId, page, limit);
    return result?.posts || result || [];
  }

  @Mutation(() => Post, { name: "createPost" })
  async createPost(
    @CurrentUser() user: any,
    @Args("content") content: string,
    @Args("storyId", { type: () => Int, nullable: true }) storyId?: number,
    @Args("groupId", { type: () => Int, nullable: true }) groupId?: number,
  ) {
    const userId = resolveUserId(user).toString();
    return this.socialService.createPost({
      userId,
      content,
      storyId: storyId?.toString(),
      groupId: groupId?.toString(),
    });
  }

  @Query(() => Group, { name: "group" })
  async getGroup(@Args("id", { type: () => Int }) id: number) {
    return this.socialService.getGroup(id.toString());
  }

  @Mutation(() => Boolean, { name: "joinGroup" })
  async joinGroup(
    @CurrentUser() user: any,
    @Args("groupId", { type: () => Int }) groupId: number,
  ) {
    const userId = resolveUserId(user).toString();
    const result = (await this.socialService.joinGroup(
      groupId.toString(),
      userId,
    )) as OperationResult;
    return Boolean(result?.success ?? true);
  }

  @Mutation(() => Boolean, { name: "followUser" })
  async followUser(@Args("followingId", { type: () => Int }) followingId: number, @CurrentUser() user: any) {
    // Note: Follow/unfollow methods need to be added to SocialService
    throw new Error("Follow/unfollow methods not yet implemented in SocialService");
  }

  @Mutation(() => Boolean, { name: "unfollowUser" })
  async unfollowUser(@Args("followingId", { type: () => Int }) followingId: number, @CurrentUser() user: any) {
    // Note: Follow/unfollow methods need to be added to SocialService
    throw new Error("Follow/unfollow methods not yet implemented in SocialService");
  }

  @Mutation(() => Group, { name: "createBookClub" })
  async createBookClub(
    @CurrentUser() user: any,
    @Args("name") name: string,
    @Args("storyId", { type: () => Int }) storyId: number,
    @Args("description", { nullable: true }) description?: string,
  ) {
    const ownerId = resolveUserId(user).toString();
    return this.socialService.createBookClub({
      ownerId,
      name,
      description: description || "",
      storyId: storyId.toString(),
    });
  }

  @Mutation(() => Boolean, { name: "scheduleGroupReading" })
  async scheduleGroupReading(
    @Args("groupId", { type: () => Int }) groupId: number,
    @Args("storyId", { type: () => Int }) storyId: number,
    @Args("chapterNumber", { type: () => Int }) chapterNumber: number,
    @Args("deadline") deadline: string,
    @Args("discussionDate", { nullable: true }) discussionDate?: string,
  ) {
    const result = (await this.socialService.scheduleReading({
      groupId: groupId.toString(),
      storyId: storyId.toString(),
      chapterNumber,
      deadline,
      discussionDate,
    })) as OperationResult;
    return Boolean(result?.success ?? true);
  }

  @Query(() => [BookClubScheduleItem], { name: "bookClubSchedule" })
  async getBookClubSchedule(@Args("groupId", { type: () => Int }) groupId: number) {
    const result = await this.socialService.getSchedule(groupId.toString());
    return result?.items ?? [];
  }

  @Mutation(() => ReadingChallenge, { name: "createReadingChallenge" })
  async createReadingChallenge(
    @CurrentUser() user: any,
    @Args("name") name: string,
    @Args("challengeType") challengeType: string,
    @Args("goal", { type: () => Int }) goal: number,
    @Args("goalType") goalType: string,
    @Args("timeRange") timeRange: string,
    @Args("startDate") startDate: string,
    @Args("endDate") endDate: string,
    @Args("description", { nullable: true }) description?: string,
    @Args("isPublic", { nullable: true }) isPublic?: boolean,
  ) {
    const creatorId = resolveUserId(user).toString();
    return this.socialService.createReadingChallenge({
      creatorId,
      name,
      description: description || "",
      goal,
      goalType,
      challengeType,
      timeRange,
      startDate,
      endDate,
      isPublic,
    });
  }

  @Mutation(() => Boolean, { name: "joinReadingChallenge" })
  async joinReadingChallenge(
    @CurrentUser() user: any,
    @Args("challengeId", { type: () => Int }) challengeId: number,
  ) {
    const userId = resolveUserId(user).toString();
    const result = (await this.socialService.joinReadingChallenge(
      challengeId.toString(),
      userId,
    )) as OperationResult;
    return Boolean(result?.success ?? true);
  }

  @Mutation(() => Boolean, { name: "updateReadingChallengeProgress" })
  async updateReadingChallengeProgress(
    @CurrentUser() user: any,
    @Args("challengeId", { type: () => Int }) challengeId: number,
    @Args("progress", { type: () => Int }) progress: number,
  ) {
    const userId = resolveUserId(user).toString();
    const result = (await this.socialService.updateChallengeProgress(
      challengeId.toString(),
      userId,
      progress,
    )) as OperationResult;
    return Boolean(result?.success ?? true);
  }

  @Query(() => ChallengeProgressPayload, { name: "challengeProgress" })
  async challengeProgress(@Args("challengeId", { type: () => Int }) challengeId: number) {
    return this.socialService.getReadingChallenge(challengeId.toString());
  }

  @Query(() => [ChallengeParticipant], { name: "friendChallengeProgress" })
  async friendChallengeProgress(
    @CurrentUser() user: any,
    @Args("challengeId", { type: () => Int }) challengeId: number,
  ) {
    const userId = resolveUserId(user).toString();
    const result = await this.socialService.getChallengeParticipants(challengeId.toString());
    return result?.items ?? result?.participants ?? [];
  }

  @Mutation(() => ReadingGoalResult, { name: "setReadingGoal" })
  async setReadingGoal(
    @CurrentUser() user: any,
    @Args("goalType") goalType: string,
    @Args("target", { type: () => Int }) target: number,
    @Args("timeRange") timeRange: string,
    @Args("startDate") startDate: string,
    @Args("endDate") endDate: string,
  ) {
    const userId = resolveUserId(user).toString();
    return this.socialService.setReadingGoal({
      userId,
      goalType,
      target,
      timeRange,
      startDate,
      endDate,
    });
  }

  @Query(() => ActivityFeed, { name: "activityFeed" })
  async activityFeed(
    @CurrentUser() user: any,
    @Args("page", { type: () => Int, nullable: true, defaultValue: 1 })
    page: number,
    @Args("limit", { type: () => Int, nullable: true, defaultValue: 20 })
    limit: number,
  ) {
    const userId = resolveUserId(user).toString();
    return this.socialService.getActivityFeed(userId, page, limit);
  }

  @Query(() => ReadingStatistics, { name: "readingStatistics" })
  async readingStatistics(@CurrentUser() user: any) {
    const userId = resolveUserId(user).toString();
    return this.socialService.getReadingStatistics(userId);
  }
}

class Post {
  id!: number;
  userId!: number;
  content!: string;
  storyId?: number;
  groupId?: number;
  likeCount!: number;
  createdAt!: string;
}

class Group {
  id!: number;
  ownerId!: number;
  name!: string;
  description!: string;
  memberCount!: number;
  createdAt!: string;
}

class BookClubScheduleItem {
  id!: number;
  chapterNumber!: number;
  deadline!: string;
  discussionDate?: string;
}

class ChallengeParticipant {
  userId!: number;
  progress!: number;
  joinedAt!: string;
  updatedAt!: string;
}

class ReadingChallenge {
  id!: number;
  creatorId!: number;
  name!: string;
  description?: string;
  challengeType!: string;
  goal!: number;
  goalType!: string;
  timeRange!: string;
  startDate!: string;
  endDate!: string;
  progress!: number;
  status!: string;
  isPublic!: boolean;
}

class ChallengeProgressPayload {
  challenge!: ReadingChallenge;
  participants!: ChallengeParticipant[];
}

class ReadingGoalResult {
  goal!: ReadingGoal;
}

class ReadingGoal {
  id!: number;
  goalType!: string;
  target!: number;
  current!: number;
  timeRange!: string;
  startDate!: string;
  endDate!: string;
  status!: string;
}

class ActivityFeedItem {
  id!: number;
  activityType!: string;
  storyId?: number;
  chapterId?: number;
  metadata?: string;
  timestamp!: string;
}

class ActivityFeed {
  items!: ActivityFeedItem[];
  total!: number;
  page!: number;
  limit!: number;
}

class ReadingStatistics {
  activityCounts!: Array<{ activityType: string; count: number }>;
  activeGoals!: ReadingGoal[];
}
