import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { EVENT_BUS_TOPICS } from "7-shared/constants";

type EventPayload = Record<string, unknown>;

@Injectable()
export class CommentEventsService {
  constructor(
    @InjectQueue("comment-events")
    private readonly commentQueue: Queue
  ) {}

  async emit(topic: keyof typeof EVENT_BUS_TOPICS | string, payload: EventPayload) {
    const jobName = typeof topic === "string" && topic in EVENT_BUS_TOPICS ? EVENT_BUS_TOPICS[topic as keyof typeof EVENT_BUS_TOPICS] : topic;

    await this.commentQueue.add(
      jobName,
      {
        ...payload,
        emittedAt: new Date().toISOString(),
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );
  }

  paragraphCommentCreated(payload: EventPayload) {
    return this.emit("PARAGRAPH_COMMENT_CREATED", payload);
  }

  paragraphCommentLiked(payload: EventPayload) {
    return this.emit("PARAGRAPH_COMMENT_LIKED", payload);
  }

  paragraphCommentReplied(payload: EventPayload) {
    return this.emit("PARAGRAPH_COMMENT_REPLIED", payload);
  }

  chapterCommentCreated(payload: EventPayload) {
    return this.emit("CHAPTER_COMMENT_CREATED", payload);
  }

  reviewCreated(payload: EventPayload) {
    return this.emit("REVIEW_CREATED", payload);
  }

  forumPostCreated(payload: EventPayload) {
    return this.emit("FORUM_POST_CREATED", payload);
  }

  pollCreated(payload: EventPayload) {
    return this.emit("POLL_CREATED", payload);
  }

  pollVoted(payload: EventPayload) {
    return this.emit("POLL_VOTED", payload);
  }

  quizCreated(payload: EventPayload) {
    return this.emit("QUIZ_CREATED", payload);
  }

  quizSubmitted(payload: EventPayload) {
    return this.emit("QUIZ_SUBMITTED", payload);
  }

  commentDeleted(payload: EventPayload) {
    return this.emit("COMMENT_DELETED", payload);
  }

  ratingUpdated(payload: EventPayload) {
    return this.emit("RATING_UPDATED", payload);
  }
}


