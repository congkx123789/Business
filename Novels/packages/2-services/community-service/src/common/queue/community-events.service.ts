import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";
import { EVENT_BUS_TOPICS } from "7-shared/constants";

type EventPayload = Record<string, unknown>;

const COMMUNITY_QUEUE = "community-events";

@Injectable()
export class CommunityEventsService {
  constructor(
    @InjectQueue(COMMUNITY_QUEUE)
    private readonly communityQueue: Queue
  ) {}

  private async emit(topic: keyof typeof EVENT_BUS_TOPICS | string, payload: EventPayload) {
    const jobName =
      typeof topic === "string" && topic in EVENT_BUS_TOPICS
        ? EVENT_BUS_TOPICS[topic as keyof typeof EVENT_BUS_TOPICS]
        : topic;

    await this.communityQueue.add(
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

  paragraphCommentCountUpdated(payload: EventPayload) {
    return this.emit("PARAGRAPH_COMMENT_COUNT_UPDATED", payload);
  }

  chapterCommentCreated(payload: EventPayload) {
    return this.emit("CHAPTER_COMMENT_CREATED", payload);
  }

  commentReplied(payload: EventPayload) {
    return this.emit("COMMENT_REPLIED", payload);
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

  tipCreated(payload: EventPayload) {
    return this.emit("TIP_CREATED", payload);
  }

  tipLarge(payload: EventPayload) {
    return this.emit("TIP_LARGE", payload);
  }

  monthlyVoteCast(payload: EventPayload) {
    return this.emit("MONTHLY_VOTE_CAST", payload);
  }

  fanRankingUpdated(payload: EventPayload) {
    return this.emit("FAN_RANKING_UPDATED", payload);
  }

  commentDeleted(payload: EventPayload) {
    return this.emit("COMMENT_DELETED", payload);
  }
}


