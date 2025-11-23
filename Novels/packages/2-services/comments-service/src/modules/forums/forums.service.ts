import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CommentEventsService } from "../../common/queue/comment-events.service";
import { ForumThreadsService } from "./forum-threads.service";

interface CreatePostInput {
  threadId: string;
  userId: string;
  content: string;
  parentPostId?: string;
}

interface ListPostsInput {
  threadId: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class ForumsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly threadsService: ForumThreadsService,
    private readonly commentEvents: CommentEventsService
  ) {}

  async createPost(input: CreatePostInput) {
    const thread = await this.prisma.forumThread.findUnique({ where: { id: input.threadId } });
    if (!thread) {
      return { success: false, message: "Thread not found" };
    }
    if (thread.isLocked) {
      return { success: false, message: "Thread is locked" };
    }

    const post = await this.prisma.forumPost.create({
      data: {
        threadId: input.threadId,
        userId: input.userId,
        content: input.content,
        parentPostId: input.parentPostId ?? null,
      },
    });

    await this.threadsService.touchThread(input.threadId);

    await this.commentEvents.forumPostCreated({
      threadId: input.threadId,
      postId: post.id,
      userId: post.userId,
    });

    return {
      success: true,
      data: post,
    };
  }

  async listPosts(input: ListPostsInput) {
    const { threadId, limit = 50, offset = 0 } = input;
    const [posts, total] = await this.prisma.$transaction([
      this.prisma.forumPost.findMany({
        where: { threadId, parentPostId: null },
        include: {
          replies: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
        skip: offset,
        take: limit,
      }),
      this.prisma.forumPost.count({ where: { threadId, parentPostId: null } }),
    ]);

    return {
      success: true,
      data: posts,
      total,
    };
  }
}


