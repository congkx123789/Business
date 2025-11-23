import { Injectable, Logger } from "@nestjs/common";
import { Processor, Process } from "@nestjs/bull";
import { Job } from "bull";
import { CommunityGateway } from "../gateways/community.gateway";
import { EVENT_BUS_TOPICS } from "7-shared/constants";

type ParagraphCommentJobData = {
  id: string;
  storyId?: string;
  bookId?: string;
  chapterId?: string;
  userId?: string;
  content?: string;
  paragraphIndex?: number;
  reactions?: Record<string, number>;
  totalLikes?: number;
  totalCount?: number;
};

type TipJobData = {
  id: string;
  userId: string;
  authorId: string;
  amount: number;
  storyId?: string;
  createdAt?: string | number;
};

type VoteJobData = {
  userId: string;
  storyId: string;
  votes: number;
  month?: number;
  year?: number;
};

type RankingJobData = {
  storyId: string;
  rankings: Array<{
    userId: string;
    username?: string;
    power?: number;
  }>;
  updatedAt?: string | number;
};

@Processor("community-events")
@Injectable()
export class CommunityEventsWorker {
  private readonly logger = new Logger(CommunityEventsWorker.name);

  constructor(private readonly communityGateway: CommunityGateway) {}

  @Process(EVENT_BUS_TOPICS.PARAGRAPH_COMMENT_CREATED)
  async handleParagraphCommentCreated(job: Job<ParagraphCommentJobData>) {
    const payload = job.data;
    this.logger.log(`Broadcasting paragraph.comment.created (${payload.id})`);
    this.communityGateway.emitParagraphComment({
      ...payload,
      paragraphIndex: payload.paragraphIndex ?? 0,
      chapterId: payload.chapterId ?? "",
    });
  }

  @Process(EVENT_BUS_TOPICS.PARAGRAPH_COMMENT_LIKED)
  async handleParagraphCommentLiked(job: Job<ParagraphCommentJobData>) {
    const payload = job.data;
    this.logger.log(`Broadcasting paragraph.comment.liked (${payload.id})`);
    this.communityGateway.emitParagraphLike({
      id: payload.id,
      chapterId: payload.chapterId ?? "",
      paragraphIndex: payload.paragraphIndex ?? 0,
      totalLikes: payload.totalLikes ?? 0,
    });
  }

  @Process(EVENT_BUS_TOPICS.PARAGRAPH_COMMENT_COUNT_UPDATED)
  async handleParagraphCommentCount(job: Job<ParagraphCommentJobData>) {
    const payload = job.data;
    this.logger.log(`Broadcasting paragraph.comment.count.updated (${payload.id})`);
    this.communityGateway.emitParagraphCountUpdate({
      chapterId: payload.chapterId ?? "",
      paragraphIndex: payload.paragraphIndex ?? 0,
      totalCount: payload.totalCount ?? payload.totalLikes ?? 0,
    });
  }

  @Process(EVENT_BUS_TOPICS.CHAPTER_COMMENT_CREATED)
  async handleChapterComment(job: Job<ParagraphCommentJobData>) {
    const payload = job.data;
    this.logger.log(`Broadcasting chapter.comment.created (${payload.id})`);
    this.communityGateway.emitChapterComment({
      id: payload.id,
      chapterId: payload.chapterId ?? "",
      storyId: payload.storyId,
      bookId: payload.bookId,
      userId: payload.userId,
      content: payload.content,
    });
  }

  @Process(EVENT_BUS_TOPICS.TIP_CREATED)
  async handleTipCreated(job: Job<TipJobData>) {
    const payload = job.data;
    this.logger.log(`Broadcasting tip.created (${payload.id})`);
    this.communityGateway.emitTip(payload);
  }

  @Process(EVENT_BUS_TOPICS.MONTHLY_VOTE_CAST)
  async handleMonthlyVote(job: Job<VoteJobData>) {
    const payload = job.data;
    this.logger.log(`Broadcasting monthly.vote.cast (${payload.storyId})`);
    this.communityGateway.emitMonthlyVote(payload);
  }

  @Process(EVENT_BUS_TOPICS.FAN_RANKING_UPDATED)
  async handleFanRanking(job: Job<RankingJobData>) {
    const payload = job.data;
    this.logger.log(`Broadcasting fan.ranking.updated (${payload.storyId})`);
    this.communityGateway.emitFanRankingUpdate(payload);
  }
}


