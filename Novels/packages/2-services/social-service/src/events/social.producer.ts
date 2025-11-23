import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { EVENT_BUS_TOPICS } from "7-shared/constants";

@Injectable()
export class SocialProducer {
  constructor(
    @InjectQueue("social-events") private readonly socialQueue: Queue,
  ) {}

  async emitPostCreated(post: any) {
    await this.socialQueue.add(EVENT_BUS_TOPICS.POST_CREATED, {
      id: post.id,
      userId: post.userId,
      content: post.content,
      storyId: post.storyId,
      groupId: post.groupId,
      mediaUrls: post.mediaUrls ?? [],
      replyCount: post.replyCount ?? 0,
      createdAt: post.createdAt,
    });
  }

  async emitPostCreatedInGroup(post: any) {
    await this.socialQueue.add(EVENT_BUS_TOPICS.POST_CREATED_IN_GROUP, {
      id: post.id,
      userId: post.userId,
      content: post.content,
      groupId: post.groupId,
      mediaUrls: post.mediaUrls ?? [],
      replyCount: post.replyCount ?? 0,
      createdAt: post.createdAt,
    });
  }

  async emitPostDeleted(postId: string) {
    await this.socialQueue.add(EVENT_BUS_TOPICS.POST_DELETED, {
      id: postId,
    });
  }

  async emitPostLiked(postId: string, userId: string) {
    await this.socialQueue.add(EVENT_BUS_TOPICS.POST_LIKED, {
      postId,
      userId,
    });
  }

  async emitGroupCreated(group: any) {
    await this.socialQueue.add(EVENT_BUS_TOPICS.GROUP_CREATED, {
      id: group.id,
      ownerId: group.ownerId,
      name: group.name,
    });
  }

  async emitGroupMemberJoined(groupId: string, userId: string) {
    await this.socialQueue.add(EVENT_BUS_TOPICS.GROUP_MEMBER_JOINED, {
      groupId,
      userId,
    });
  }

  async emitUserFollowed(followerId: string, followingId: string) {
    await this.socialQueue.add(EVENT_BUS_TOPICS.USER_FOLLOWED, {
      followerId,
      followingId,
    });
  }

  async emitReadingChallengeCreated(challenge: any) {
    await this.socialQueue.add(EVENT_BUS_TOPICS.READING_CHALLENGE_CREATED, {
      id: challenge.id,
      creatorId: challenge.creatorId,
      goal: challenge.goal,
      challengeType: challenge.challengeType,
    });
  }

  async emitChallengeProgressUpdated(challengeId: string, userId: string, progress: number) {
    await this.socialQueue.add(EVENT_BUS_TOPICS.CHALLENGE_PROGRESS_UPDATED, {
      challengeId,
      userId,
      progress,
    });
  }

  async emitReadingGoalSet(userId: string, goalId: string) {
    await this.socialQueue.add(EVENT_BUS_TOPICS.READING_GOAL_SET, {
      userId,
      goalId,
    });
  }
}
