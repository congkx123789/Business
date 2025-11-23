import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

interface CreateThreadInput {
  storyId: string;
  userId: string;
  title: string;
  content: string;
  category: string;
}

interface ListThreadsInput {
  storyId: string;
  category?: string;
  limit?: number;
  offset?: number;
  pinnedFirst?: boolean;
}

@Injectable()
export class ForumThreadsService {
  constructor(private readonly prisma: PrismaService) {}

  async createThread(input: CreateThreadInput) {
    const thread = await this.prisma.forumThread.create({
      data: {
        storyId: input.storyId,
        userId: input.userId,
        title: input.title,
        content: input.content,
        category: input.category,
      },
    });

    return {
      success: true,
      data: thread,
    };
  }

  async listThreads(input: ListThreadsInput) {
    const { storyId, category, limit = 20, offset = 0, pinnedFirst = true } = input;
    const [threads, total] = await this.prisma.$transaction([
      this.prisma.forumThread.findMany({
        where: {
          storyId,
          ...(category ? { category } : {}),
        },
        orderBy: pinnedFirst
          ? [
              { isPinned: "desc" as const },
              { lastPostAt: "desc" as const },
              { createdAt: "desc" as const },
            ]
          : [{ lastPostAt: "desc" as const }],
        skip: offset,
        take: limit,
      }),
      this.prisma.forumThread.count({
        where: {
          storyId,
          ...(category ? { category } : {}),
        },
      }),
    ]);

    return {
      success: true,
      data: threads,
      total,
    };
  }

  async setPinned(threadId: string, isPinned: boolean) {
    const thread = await this.prisma.forumThread.update({
      where: { id: threadId },
      data: { isPinned },
    });
    return {
      success: true,
      data: thread,
    };
  }

  async setLocked(threadId: string, isLocked: boolean) {
    const thread = await this.prisma.forumThread.update({
      where: { id: threadId },
      data: { isLocked },
    });
    return {
      success: true,
      data: thread,
    };
  }

  async touchThread(threadId: string, incrementPostCount = true) {
    await this.prisma.forumThread.update({
      where: { id: threadId },
      data: {
        lastPostAt: new Date(),
        ...(incrementPostCount
          ? {
              postCount: {
                increment: 1,
              },
            }
          : {}),
      },
    });
  }
}


