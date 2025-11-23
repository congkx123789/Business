import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SocialProducer } from "../../events/social.producer";
import { RpcException } from "@nestjs/microservices";

interface CreatePostParams {
  userId: string;
  content: string;
  storyId?: string;
  groupId?: string;
  mediaUrls?: string[];
}

interface PaginationParams {
  page: number;
  limit: number;
}

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly socialProducer: SocialProducer,
  ) {}

  async createPost(params: CreatePostParams) {
    const post = await this.prisma.post.create({
      data: {
        userId: Number(params.userId),
        content: params.content,
        storyId: params.storyId ? Number(params.storyId) : undefined,
        groupId: params.groupId ? Number(params.groupId) : undefined,
      },
    });

    if (params.groupId) {
      await this.socialProducer.emitPostCreatedInGroup(post);
    } else {
      await this.socialProducer.emitPostCreated(post);
    }

    return this.mapPost(post);
  }

  async deletePost(postId: string, userId: string) {
    const numericPostId = Number(postId);
    const numericUserId = Number(userId);
    const post = await this.prisma.post.findFirst({
      where: { id: numericPostId, userId: numericUserId },
    });

    if (!post) {
      throw new RpcException("Post not found or unauthorized");
    }

    await this.prisma.post.delete({ where: { id: numericPostId } });
    await this.socialProducer.emitPostDeleted(postId);

    return {};
  }

  async toggleLike(postId: string, userId: string) {
    const numericPostId = Number(postId);
    const numericUserId = Number(userId);
    const existingLike = await this.prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId: numericPostId,
          userId: numericUserId,
        },
      },
    });

    if (existingLike) {
      await this.prisma.postLike.delete({ where: { id: existingLike.id } });
      await this.prisma.post.update({
        where: { id: numericPostId },
        data: { likeCount: { decrement: 1 } },
      });
    } else {
      await this.prisma.postLike.create({
        data: {
          postId: numericPostId,
          userId: numericUserId,
        },
      });
      await this.prisma.post.update({
        where: { id: numericPostId },
        data: { likeCount: { increment: 1 } },
      });
      await this.socialProducer.emitPostLiked(postId, userId);
    }

    const updated = await this.prisma.post.findUnique({ where: { id: numericPostId } });
    if (!updated) {
      throw new RpcException("Post not found after like update");
    }

    return this.mapPost(updated);
  }

  async getUserPosts(userId: string, pagination: PaginationParams) {
    const { page, limit } = pagination;
    const numericUserId = Number(userId);
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { userId: numericUserId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.post.count({ where: { userId: numericUserId } }),
    ]);

    return {
      posts: posts.map((post) => this.mapPost(post)),
      total,
      page,
      limit,
    };
  }

  async getGroupPosts(groupId: string, pagination: PaginationParams) {
    const { page, limit } = pagination;
    const numericGroupId = Number(groupId);
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { groupId: numericGroupId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.post.count({ where: { groupId: numericGroupId } }),
    ]);

    return {
      posts: posts.map((post) => this.mapPost(post)),
      total,
      page,
      limit,
    };
  }

  private mapPost(post: {
    id: number;
    userId: number;
    content: string;
    storyId: number | null;
    groupId: number | null;
    likeCount: number;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
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
    };
  }
}


