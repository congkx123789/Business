import { Controller } from "@nestjs/common";
import { GrpcMethod, RpcException } from "@nestjs/microservices";
import { PostsService } from "../modules/posts/posts.service";
import { GroupsService } from "../modules/groups/groups.service";
import { BookClubsService } from "../modules/groups/book-clubs.service";
import { FollowsService } from "../modules/follows/follows.service";
import { FeedService, FeedItem } from "../modules/feed/feed.service";
import { ReadingChallengesService } from "../modules/reading-challenges/reading-challenges.service";
import { ActivityTrackingService } from "../modules/activity-tracking/activity-tracking.service";

@Controller()
export class SocialController {
  constructor(
    private readonly postsService: PostsService,
    private readonly groupsService: GroupsService,
    private readonly bookClubsService: BookClubsService,
    private readonly followsService: FollowsService,
    private readonly feedService: FeedService,
    private readonly readingChallenges: ReadingChallengesService,
    private readonly activityTracking: ActivityTrackingService,
  ) {}

  // Posts & Feed
  @GrpcMethod("SocialService", "CreatePost")
  createPost(data: { userId: string | number; content: string; storyId?: string | number; groupId?: string | number }) {
    return this.postsService.createPost({
      userId: this.ensureString(data.userId, "userId"),
      content: data.content,
      storyId: data.storyId !== undefined ? this.ensureString(data.storyId, "storyId") : undefined,
      groupId: data.groupId !== undefined ? this.ensureString(data.groupId, "groupId") : undefined,
    });
  }

  @GrpcMethod("SocialService", "DeletePost")
  deletePost(data: { postId: string | number; userId: string | number }) {
    return this.postsService.deletePost(
      this.ensureString(data.postId, "postId"),
      this.ensureString(data.userId, "userId"),
    );
  }

  @GrpcMethod("SocialService", "LikePost")
  likePost(data: { postId: string | number; userId: string | number }) {
    return this.postsService.toggleLike(
      this.ensureString(data.postId, "postId"),
      this.ensureString(data.userId, "userId"),
    );
  }

  @GrpcMethod("SocialService", "GetFeed")
  getFeed(data: { userId: string | number; page?: number; limit?: number }) {
    const page = data.page && data.page > 0 ? data.page : 1;
    const limit = data.limit && data.limit > 0 ? data.limit : 20;
    return this.feedService.getFeed(this.ensureString(data.userId, "userId"), page, limit);
  }

  @GrpcMethod("SocialService", "GetUserPosts")
  getUserPosts(data: { userId: string | number; page?: number; limit?: number }) {
    return this.postsService.getUserPosts(this.ensureString(data.userId, "userId"), {
      page: data.page && data.page > 0 ? data.page : 1,
      limit: data.limit && data.limit > 0 ? data.limit : 20,
    });
  }

  @GrpcMethod("SocialService", "GetGroupPosts")
  getGroupPosts(data: { groupId: string | number; page?: number; limit?: number }) {
    return this.postsService.getGroupPosts(this.ensureString(data.groupId, "groupId"), {
      page: data.page && data.page > 0 ? data.page : 1,
      limit: data.limit && data.limit > 0 ? data.limit : 20,
    });
  }

  // Groups & Book Clubs
  @GrpcMethod("SocialService", "CreateGroup")
  createGroup(data: { ownerId: string | number; name: string; description?: string }) {
    return this.groupsService.createGroup({
      ownerId: this.ensureString(data.ownerId, "ownerId"),
      name: data.name,
      description: data.description,
    });
  }

  @GrpcMethod("SocialService", "GetGroup")
  getGroup(data: { groupId: string | number }) {
    return this.groupsService.getGroup(this.ensureString(data.groupId, "groupId"));
  }

  @GrpcMethod("SocialService", "JoinGroup")
  joinGroup(data: { groupId: string | number; userId: string | number }) {
    return this.groupsService.joinGroup(
      this.ensureString(data.groupId, "groupId"),
      this.ensureString(data.userId, "userId"),
    );
  }

  @GrpcMethod("SocialService", "LeaveGroup")
  leaveGroup(data: { groupId: string | number; userId: string | number }) {
    return this.groupsService.leaveGroup(
      this.ensureString(data.groupId, "groupId"),
      this.ensureString(data.userId, "userId"),
    );
  }

  @GrpcMethod("SocialService", "CreateBookClub")
  createBookClub(data: { ownerId: string | number; name: string; description?: string; storyId: string | number }) {
    return this.bookClubsService.createBookClub({
      ownerId: this.ensureString(data.ownerId, "ownerId"),
      name: data.name,
      description: data.description,
      storyId: this.ensureString(data.storyId, "storyId"),
    });
  }

  @GrpcMethod("SocialService", "ScheduleReading")
  scheduleReading(data: {
    groupId: string | number;
    storyId: string | number;
    chapterNumber: number;
    deadline: string;
    discussionDate?: string;
  }) {
    return this.bookClubsService.scheduleReading({
      groupId: this.ensureString(data.groupId, "groupId"),
      storyId: this.ensureString(data.storyId, "storyId"),
      chapterNumber: data.chapterNumber,
      deadline: data.deadline,
      discussionDate: data.discussionDate,
    });
  }

  @GrpcMethod("SocialService", "GetSchedule")
  getSchedule(data: { groupId: string | number }) {
    return this.bookClubsService.getSchedule(this.ensureString(data.groupId, "groupId"));
  }

  // Follow
  @GrpcMethod("SocialService", "FollowUser")
  followUser(data: { followerId: string | number; followingId: string | number }) {
    return this.followsService.followUser(
      this.ensureString(data.followerId, "followerId"),
      this.ensureString(data.followingId, "followingId"),
    );
  }

  @GrpcMethod("SocialService", "UnfollowUser")
  unfollowUser(data: { followerId: string | number; followingId: string | number }) {
    return this.followsService.unfollowUser(
      this.ensureString(data.followerId, "followerId"),
      this.ensureString(data.followingId, "followingId"),
    );
  }

  @GrpcMethod("SocialService", "GetFollowers")
  getFollowers(data: { userId: string | number; page?: number; limit?: number }) {
    return this.followsService.getFollowers(this.ensureString(data.userId, "userId"), {
      page: data.page && data.page > 0 ? data.page : 1,
      limit: data.limit && data.limit > 0 ? data.limit : 20,
    });
  }

  @GrpcMethod("SocialService", "GetFollowing")
  getFollowing(data: { userId: string | number; page?: number; limit?: number }) {
    return this.followsService.getFollowing(this.ensureString(data.userId, "userId"), {
      page: data.page && data.page > 0 ? data.page : 1,
      limit: data.limit && data.limit > 0 ? data.limit : 20,
    });
  }

  // Reading Challenges
  @GrpcMethod("SocialService", "CreateReadingChallenge")
  createReadingChallenge(data: {
    creatorId: string | number;
    name: string;
    description?: string;
    challengeType: "personal" | "community";
    goal: number;
    goalType: "books" | "chapters" | "reading-time" | "pages";
    timeRange: "daily" | "weekly" | "monthly" | "yearly" | "custom";
    startDate: string;
    endDate: string;
    isPublic?: boolean;
  }) {
    return this.readingChallenges.createChallenge({
      creatorId: this.ensureString(data.creatorId, "creatorId"),
      name: data.name,
      description: data.description,
      challengeType: data.challengeType,
      goal: data.goal,
      goalType: data.goalType,
      timeRange: data.timeRange,
      startDate: data.startDate,
      endDate: data.endDate,
      isPublic: data.isPublic,
    });
  }

  @GrpcMethod("SocialService", "JoinReadingChallenge")
  joinReadingChallenge(data: { challengeId: string | number; userId: string | number }) {
    return this.readingChallenges.joinChallenge(
      this.ensureString(data.challengeId, "challengeId"),
      this.ensureString(data.userId, "userId"),
    );
  }

  @GrpcMethod("SocialService", "UpdateChallengeProgress")
  updateChallengeProgress(data: { challengeId: string | number; userId: string | number; progress: number }) {
    return this.readingChallenges.updateProgress(
      this.ensureString(data.challengeId, "challengeId"),
      this.ensureString(data.userId, "userId"),
      data.progress,
    );
  }

  @GrpcMethod("SocialService", "GetReadingChallenge")
  getReadingChallenge(data: { challengeId: string | number }) {
    return this.readingChallenges.getChallengeDetail(this.ensureString(data.challengeId, "challengeId"));
  }

  @GrpcMethod("SocialService", "GetChallengeParticipants")
  getChallengeParticipants(data: { challengeId: string | number }) {
    return this.readingChallenges.getChallengeParticipants(this.ensureString(data.challengeId, "challengeId"));
  }

  @GrpcMethod("SocialService", "GetFriendProgress")
  getFriendProgress(data: { challengeId: string | number; userId: string | number }) {
    return this.readingChallenges.getFriendProgress(
      this.ensureString(data.challengeId, "challengeId"),
      this.ensureString(data.userId, "userId"),
    );
  }

  // Activity Tracking
  @GrpcMethod("SocialService", "SetReadingGoal")
  setReadingGoal(data: {
    userId: string | number;
    goalType: "books" | "chapters" | "reading-time" | "pages";
    target: number;
    timeRange: "daily" | "weekly" | "monthly" | "yearly" | "custom";
    startDate: string;
    endDate: string;
  }) {
    return this.activityTracking.setReadingGoal(this.ensureString(data.userId, "userId"), {
      goalType: data.goalType,
      target: data.target,
      timeRange: data.timeRange,
      startDate: data.startDate,
      endDate: data.endDate,
    });
  }

  @GrpcMethod("SocialService", "GetReadingGoals")
  getReadingGoals(data: { userId: string | number }) {
    return this.activityTracking.getReadingGoals(this.ensureString(data.userId, "userId"));
  }

  @GrpcMethod("SocialService", "GetActivityFeed")
  getActivityFeed(data: { userId: string | number; page?: number; limit?: number }) {
    const page = data.page && data.page > 0 ? data.page : 1;
    const limit = data.limit && data.limit > 0 ? data.limit : 20;
    return this.activityTracking.getActivityFeed(this.ensureString(data.userId, "userId"), page, limit);
  }

  @GrpcMethod("SocialService", "GetReadingStatistics")
  getReadingStatistics(data: { userId: string | number }) {
    return this.activityTracking.getReadingStatistics(this.ensureString(data.userId, "userId"));
  }

  protected ensureString(value: string | number | undefined, field: string): string {
    if (value === undefined || value === null) {
      throw new RpcException(`${field} is required`);
    }

    return String(value);
  }
}

