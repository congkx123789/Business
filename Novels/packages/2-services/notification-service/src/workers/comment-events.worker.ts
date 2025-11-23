import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { Injectable, Logger } from "@nestjs/common";
import { COMMENT_EVENTS } from "7-shared";
import { NotificationService } from "../modules/notification/notification.service";

interface CommentReplyPayload {
  email?: string;
  username?: string;
  storyTitle?: string;
  commentSnippet?: string;
  paragraphIndex?: number;
  pushTokens?: string[];
}

@Processor("comment-events")
@Injectable()
export class CommentEventsWorker {
  private readonly logger = new Logger(CommentEventsWorker.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Process(COMMENT_EVENTS.COMMENT_REPLIED)
  async handleCommentReply(job: Job<CommentReplyPayload>) {
    await this.sendCommentReply(job);
  }

  @Process(COMMENT_EVENTS.PARAGRAPH_COMMENT_REPLIED)
  async handleParagraphCommentReply(job: Job<CommentReplyPayload>) {
    await this.sendCommentReply(job);
  }

  @Process(COMMENT_EVENTS.CHAPTER_COMMENT_REPLIED)
  async handleChapterCommentReply(job: Job<CommentReplyPayload>) {
    await this.sendCommentReply(job);
  }

  @Process(COMMENT_EVENTS.REVIEW_REPLIED)
  async handleReviewReply(job: Job<CommentReplyPayload>) {
    await this.sendCommentReply(job);
  }

  private async sendCommentReply(job: Job<CommentReplyPayload>) {
    const payload = job.data ?? {};
    if (!payload.email) {
      this.logger.warn("Comment reply event missing recipient email");
      return;
    }

    await this.notificationService.sendTemplateEmail({
      to: payload.email,
      template: "comment-reply",
      variables: {
        username: payload.username ?? "Reader",
        storyTitle: payload.storyTitle ?? "your story",
        commentSnippet: payload.commentSnippet ?? "",
        paragraphIndex:
          typeof payload.paragraphIndex === "number"
            ? `Paragraph ${payload.paragraphIndex + 1}`
            : "",
      },
    });

    if (payload.pushTokens?.length) {
      await this.notificationService.sendTemplatePush({
        tokens: payload.pushTokens,
        template: "comment-reply",
        variables: {
          storyTitle: payload.storyTitle ?? "your story",
        },
      });
    }
  }
}


