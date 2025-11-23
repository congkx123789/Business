import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../../../common/database/database.service";
import { CreateChapterCommentDto } from "./dto/create-chapter-comment.dto";
import { ReplyChapterCommentDto } from "./dto/reply-comment.dto";
import { CommunityEventsService } from "../../../common/queue/community-events.service";

@Injectable()
export class MesoCommentsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly events: CommunityEventsService
  ) {}

  async createChapterComment(payload: CreateChapterCommentDto) {
    const comment = await this.databaseService.chapterComment.create({
      data: {
        userId: payload.userId,
        storyId: payload.storyId,
        chapterId: payload.chapterId,
        content: payload.content,
        parentId: payload.parentCommentId ?? null,
      },
    });

    await this.events.chapterCommentCreated({
      commentId: comment.id,
      storyId: comment.storyId,
      chapterId: comment.chapterId,
      userId: comment.userId,
      parentId: comment.parentId,
    });

    return comment;
  }

  async getChapterComments(options: { chapterId: string; page?: number; limit?: number }) {
    const { chapterId, page = 1, limit = 20 } = options;
    const [data, total] = await Promise.all([
      this.databaseService.chapterComment.findMany({
        where: { chapterId, parentId: null },
        orderBy: [{ createdAt: "desc" }],
        include: {
          children: {
            orderBy: [{ createdAt: "asc" }],
          },
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.databaseService.chapterComment.count({
        where: { chapterId, parentId: null },
      }),
    ]);

    return {
      data,
      page,
      limit,
      total,
    };
  }

  async replyToChapterComment(payload: ReplyChapterCommentDto) {
    const parent = await this.databaseService.chapterComment.findUnique({
      where: { id: payload.parentCommentId },
    });
    if (!parent) {
      throw new NotFoundException("Parent chapter comment not found");
    }

    const reply = await this.databaseService.chapterComment.create({
      data: {
        userId: payload.userId,
        storyId: parent.storyId,
        chapterId: parent.chapterId,
        content: payload.content,
        parentId: payload.parentCommentId,
      },
    });

    await this.events.commentReplied({
      commentId: reply.id,
      parentId: payload.parentCommentId,
      userId: payload.userId,
    });

    return reply;
  }
}

