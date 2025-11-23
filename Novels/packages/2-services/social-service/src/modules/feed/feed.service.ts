import { Inject, Injectable } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { PrismaService } from "../../prisma/prisma.service";

const FEED_CACHE_TTL_SECONDS = 300;

export interface FeedItem {
  id: string;
  type: "post" | "activity";
  createdAt: string;
  post?: {
    id: string;
    userId: string;
    content: string;
    storyId?: string;
    groupId?: string;
    mediaUrls: string[];
    replyCount: number;
    likeCount: number;
    createdAt: string;
    updatedAt: string;
  };
  activity?: {
    id: string;
    userId: string;
    activityType: string;
    storyId?: string;
    chapterId?: string;
    metadata?: Record<string, unknown>;
    timestamp: string;
  };
}

@Injectable()
export class FeedService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getFeed(userId: string, page: number, limit: number) {
    const cacheKey = `feed:${userId}:${page}:${limit}`;
    const cached = await this.cacheManager.get<{
      items: FeedItem[];
      total: number;
      page: number;
      limit: number;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    const numericUserId = Number(userId);
    const following = await this.prisma.follow.findMany({
      where: { followerId: numericUserId },
      select: { followingId: true },
    });

    const participantIds = Array.from(
      new Set([numericUserId, ...following.map((f) => f.followingId)]),
    );

    const skip = (page - 1) * limit;
    const take = skip + limit;

    const [posts, activities, totalPosts, totalActivities] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          userId: { in: participantIds },
          groupId: null,
        },
        orderBy: { createdAt: "desc" },
        take,
      }),
      this.prisma.activityTracking.findMany({
        where: { userId: { in: participantIds } },
        orderBy: { timestamp: "desc" },
        take,
      }),
      this.prisma.post.count({
        where: { userId: { in: participantIds }, groupId: null },
      }),
      this.prisma.activityTracking.count({
        where: { userId: { in: participantIds } },
      }),
    ]);

    const combined = [
      ...posts.map((post) => ({
        createdAt: post.createdAt,
        item: this.mapPostFeedItem(post),
      })),
      ...activities.map((activity) => ({
        createdAt: activity.timestamp,
        item: this.mapActivityFeedItem(activity),
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const pagedItems = combined.slice(skip, skip + limit).map((entry) => entry.item);

    const result = {
      items: pagedItems,
      total: totalPosts + totalActivities,
      page,
      limit,
    };

    await this.cacheManager.set(cacheKey, result, FEED_CACHE_TTL_SECONDS * 1000);

    return result;
  }

  private mapPostFeedItem(post: {
    id: number;
    userId: number;
    content: string;
    storyId: number | null;
    groupId: number | null;
    likeCount: number;
    createdAt: Date;
    updatedAt: Date;
  }): FeedItem {
    return {
      id: `post:${post.id}`,
      type: "post",
      createdAt: post.createdAt.toISOString(),
      post: {
        id: String(post.id),
        userId: String(post.userId),
        content: post.content,
        storyId: post.storyId ? String(post.storyId) : undefined,
        groupId: post.groupId ? String(post.groupId) : undefined,
        mediaUrls: [],
        replyCount: 0,
        likeCount: post.likeCount,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      },
    };
  }

  private mapActivityFeedItem(activity: {
    id: number;
    userId: number;
    activityType: string;
    storyId: number | null;
    chapterId: number | null;
    metadata: any;
    timestamp: Date;
  }): FeedItem {
    return {
      id: `activity:${activity.id}`,
      type: "activity",
      createdAt: activity.timestamp.toISOString(),
      activity: {
        id: String(activity.id),
        userId: String(activity.userId),
        activityType: activity.activityType,
        storyId: activity.storyId ? String(activity.storyId) : undefined,
        chapterId: activity.chapterId ? String(activity.chapterId) : undefined,
        metadata: activity.metadata ?? undefined,
        timestamp: activity.timestamp.toISOString(),
      },
    };
  }
}

