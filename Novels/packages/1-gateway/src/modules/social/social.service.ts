import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import {
  getGrpcResultOrThrow,
  getGrpcDataOrThrow,
} from "../../common/utils/grpc.util";

interface SocialGrpcClient {
  GetFeed(data: { userId: string; page?: number; limit?: number }): Observable<any>;
  GetUserPosts(data: { userId: string; page?: number; limit?: number }): Observable<any>;
  GetGroupPosts(data: { groupId: string; page?: number; limit?: number }): Observable<any>;
  CreatePost(data: {
    userId: string;
    content: string;
    storyId?: string;
    groupId?: string;
    mediaUrls?: string[];
  }): Observable<any>;
  DeletePost(data: { postId: string; userId: string }): Observable<any>;
  LikePost(data: { postId: string; userId: string }): Observable<any>;
  CreateGroup(data: { ownerId: string; name: string; description: string; coverUrl?: string }): Observable<any>;
  GetGroup(data: { groupId: string }): Observable<any>;
  JoinGroup(data: { groupId: string; userId: string }): Observable<any>;
  LeaveGroup(data: { groupId: string; userId: string }): Observable<any>;
  CreateBookClub(data: {
    ownerId: string;
    name: string;
    description: string;
    storyId: string;
  }): Observable<any>;
  ScheduleReading(data: {
    groupId: string;
    storyId: string;
    chapterNumber: number;
    deadline?: string;
    discussionDate?: string;
  }): Observable<any>;
  GetSchedule(data: { groupId: string }): Observable<any>;
  CreateReadingChallenge(data: {
    creatorId: string;
    name: string;
    description: string;
    goal: number;
    goalType: string;
    challengeType: string;
    timeRange: string;
    startDate?: string;
    endDate?: string;
    isPublic?: boolean;
  }): Observable<any>;
  JoinReadingChallenge(data: { challengeId: string; userId: string }): Observable<any>;
  UpdateChallengeProgress(data: {
    challengeId: string;
    userId: string;
    progress: number;
  }): Observable<any>;
  GetReadingChallenge(data: { challengeId: string }): Observable<any>;
  GetChallengeParticipants(data: { challengeId: string }): Observable<any>;
  SetReadingGoal(data: {
    userId: string;
    goalType: string;
    target: number;
    timeRange: string;
    startDate?: string;
    endDate?: string;
  }): Observable<any>;
  GetReadingGoals(data: { userId: string }): Observable<any>;
  GetActivityFeed(data: { userId: string; page?: number; limit?: number }): Observable<any>;
  GetReadingStatistics(data: { userId: string }): Observable<any>;
}

@Injectable()
export class SocialService implements OnModuleInit {
  private client!: SocialGrpcClient;

  constructor(@Inject("SOCIAL_SERVICE") private readonly grpcClient: ClientGrpc) {}

  onModuleInit() {
    this.client = this.grpcClient.getService<SocialGrpcClient>("SocialService");
  }

  getFeed(userId: string, page?: number, limit?: number) {
    return getGrpcResultOrThrow(
      this.client.GetFeed({ userId, page, limit }),
      "Failed to load feed",
    );
  }

  getUserPosts(userId: string, page?: number, limit?: number) {
    return getGrpcResultOrThrow(
      this.client.GetUserPosts({ userId, page, limit }),
      "Failed to load user posts",
    );
  }

  getGroupPosts(groupId: string, page?: number, limit?: number) {
    return getGrpcResultOrThrow(
      this.client.GetGroupPosts({ groupId, page, limit }),
      "Failed to load group posts",
    );
  }

  createPost(payload: {
    userId: string;
    content: string;
    storyId?: string;
    groupId?: string;
    mediaUrls?: string[];
  }) {
    return getGrpcDataOrThrow(this.client.CreatePost(payload), "Failed to create post");
  }

  deletePost(postId: string, userId: string) {
    return getGrpcDataOrThrow(
      this.client.DeletePost({ postId, userId }),
      "Failed to delete post",
    );
  }

  likePost(postId: string, userId: string) {
    return getGrpcDataOrThrow(this.client.LikePost({ postId, userId }), "Failed to like post");
  }

  createGroup(payload: { ownerId: string; name: string; description: string; coverUrl?: string }) {
    return getGrpcDataOrThrow(this.client.CreateGroup(payload), "Failed to create group");
  }

  getGroup(groupId: string) {
    return getGrpcDataOrThrow(this.client.GetGroup({ groupId }), "Failed to load group");
  }

  joinGroup(groupId: string, userId: string) {
    return getGrpcDataOrThrow(
      this.client.JoinGroup({ groupId, userId }),
      "Failed to join group",
    );
  }

  leaveGroup(groupId: string, userId: string) {
    return getGrpcDataOrThrow(
      this.client.LeaveGroup({ groupId, userId }),
      "Failed to leave group",
    );
  }

  createBookClub(payload: { ownerId: string; name: string; description: string; storyId: string }) {
    return getGrpcDataOrThrow(
      this.client.CreateBookClub(payload),
      "Failed to create book club",
    );
  }

  scheduleReading(payload: {
    groupId: string;
    storyId: string;
    chapterNumber: number;
    deadline?: string;
    discussionDate?: string;
  }) {
    return getGrpcDataOrThrow(
      this.client.ScheduleReading(payload),
      "Failed to schedule reading",
    );
  }

  getSchedule(groupId: string) {
    return getGrpcResultOrThrow(
      this.client.GetSchedule({ groupId }),
      "Failed to load schedule",
    );
  }

  createReadingChallenge(payload: {
    creatorId: string;
    name: string;
    description: string;
    goal: number;
    goalType: string;
    challengeType: string;
    timeRange: string;
    startDate?: string;
    endDate?: string;
    isPublic?: boolean;
  }) {
    return getGrpcDataOrThrow(
      this.client.CreateReadingChallenge(payload),
      "Failed to create reading challenge",
    );
  }

  joinReadingChallenge(challengeId: string, userId: string) {
    return getGrpcDataOrThrow(
      this.client.JoinReadingChallenge({ challengeId, userId }),
      "Failed to join reading challenge",
    );
  }

  updateChallengeProgress(challengeId: string, userId: string, progress: number) {
    return getGrpcDataOrThrow(
      this.client.UpdateChallengeProgress({ challengeId, userId, progress }),
      "Failed to update challenge progress",
    );
  }

  getReadingChallenge(challengeId: string) {
    return getGrpcDataOrThrow(
      this.client.GetReadingChallenge({ challengeId }),
      "Failed to load reading challenge",
    );
  }

  getChallengeParticipants(challengeId: string) {
    return getGrpcResultOrThrow(
      this.client.GetChallengeParticipants({ challengeId }),
      "Failed to load challenge participants",
    );
  }

  setReadingGoal(payload: {
    userId: string;
    goalType: string;
    target: number;
    timeRange: string;
    startDate?: string;
    endDate?: string;
  }) {
    return getGrpcDataOrThrow(
      this.client.SetReadingGoal(payload),
      "Failed to set reading goal",
    );
  }

  getReadingGoals(userId: string) {
    return getGrpcResultOrThrow(
      this.client.GetReadingGoals({ userId }),
      "Failed to load reading goals",
    );
  }

  getActivityFeed(userId: string, page?: number, limit?: number) {
    return getGrpcResultOrThrow(
      this.client.GetActivityFeed({ userId, page, limit }),
      "Failed to load activity feed",
    );
  }

  getReadingStatistics(userId: string) {
    return getGrpcResultOrThrow(
      this.client.GetReadingStatistics({ userId }),
      "Failed to load reading statistics",
    );
  }
}


