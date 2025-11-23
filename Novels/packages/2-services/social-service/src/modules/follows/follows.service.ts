import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SocialProducer } from "../../events/social.producer";
import { RpcException } from "@nestjs/microservices";

interface PaginationParams {
  page: number;
  limit: number;
}

@Injectable()
export class FollowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socialProducer: SocialProducer,
  ) {}

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new RpcException("Cannot follow yourself");
    }

    const numericFollowerId = Number(followerId);
    const numericFollowingId = Number(followingId);
    const existing = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: numericFollowerId,
          followingId: numericFollowingId,
        },
      },
    });

    if (existing) {
      return { success: false };
    }

    const follow = await this.prisma.follow.create({
      data: {
        followerId: numericFollowerId,
        followingId: numericFollowingId,
      },
    });

    await this.socialProducer.emitUserFollowed(followerId, followingId);

    return this.mapFollow(follow);
  }

  async unfollowUser(followerId: string, followingId: string) {
    await this.prisma.follow.deleteMany({
      where: {
        followerId: Number(followerId),
        followingId: Number(followingId),
      },
    });

    return {};
  }

  async getFollowers(userId: string, pagination: PaginationParams) {
    const { page, limit } = pagination;
    const numericUserId = Number(userId);
    const [items, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followingId: numericUserId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.follow.count({ where: { followingId: numericUserId } }),
    ]);

    return {
      items: items.map((item) => this.mapFollow(item)),
      total,
      page,
      limit,
    };
  }

  async getFollowing(userId: string, pagination: PaginationParams) {
    const { page, limit } = pagination;
    const numericUserId = Number(userId);
    const [items, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: numericUserId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.follow.count({ where: { followerId: numericUserId } }),
    ]);

    return {
      items: items.map((item) => this.mapFollow(item)),
      total,
      page,
      limit,
    };
  }

  async getFollowingIds(userId: string) {
    const numericUserId = Number(userId);
    const following = await this.prisma.follow.findMany({
      where: { followerId: numericUserId },
      select: { followingId: true },
    });

    return following.map((entry) => String(entry.followingId));
  }

  private mapFollow(follow: { followerId: number; followingId: number; createdAt: Date }) {
    return {
      followerId: String(follow.followerId),
      followingId: String(follow.followingId),
      createdAt: follow.createdAt.toISOString(),
    };
  }
}


