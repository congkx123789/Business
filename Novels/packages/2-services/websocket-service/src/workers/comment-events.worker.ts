import { Injectable, Logger } from "@nestjs/common";
import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { CommentsGateway } from "../gateways/comments.gateway";
import { EVENT_BUS_TOPICS } from "7-shared/constants";

type CommentJobData = {
  id: string;
  storyId?: string;
  bookId?: string;
  chapterId?: string;
  userId?: string;
  content?: string;
  parentId?: string;
  paragraphIndex?: number;
  totalLikes?: number;
  totalCount?: number;
  reactions?: Record<string, number>;
};

@Processor("comment-events")
@Injectable()
export class CommentEventsWorker {
  private readonly logger = new Logger(CommentEventsWorker.name);

  constructor(private readonly commentsGateway: CommentsGateway) {}

  @Process(EVENT_BUS_TOPICS.COMMENT_CREATED)
  async handleCommentCreated(job: Job<CommentJobData>) {
    const payload = job.data;
    this.logger.log(`Broadcasting comment.created (${payload.id})`);
    this.commentsGateway.emitCommentCreated(payload);
  }

  @Process(EVENT_BUS_TOPICS.COMMENT_UPDATED)
  async handleCommentUpdated(job: Job<CommentJobData>) {
    const payload = job.data;
    this.logger.log(`Broadcasting comment.updated (${payload.id})`);
    this.commentsGateway.emitCommentUpdated(payload);
  }

  @Process(EVENT_BUS_TOPICS.COMMENT_DELETED)
  async handleCommentDeleted(job: Job<CommentJobData>) {
    const payload = job.data;
    this.logger.log(`Broadcasting comment.deleted (${payload.id})`);
    this.commentsGateway.emitCommentDeleted(payload);
  }

  @Process(EVENT_BUS_TOPICS.COMMENT_REPLIED)
  async handleCommentReplied(job: Job<CommentJobData>) {
    const payload = job.data;
    this.logger.log(`Broadcasting comment.replied (${payload.id})`);
    this.commentsGateway.emitCommentReplied(payload);
  }
}


