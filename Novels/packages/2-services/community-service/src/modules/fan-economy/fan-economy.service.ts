import { Injectable } from "@nestjs/common";
import { TippingService } from "./tipping/tipping.service";
import { RankingsService } from "./rankings/rankings.service";
import { GamificationService } from "./gamification/gamification.service";
import { VotesService } from "./votes/votes.service";
import { AuthorFanService } from "./author-fan/author-fan.service";
import { CreateTipDto } from "./tipping/dto/create-tip.dto";
import { GetRankingsDto } from "./rankings/dto/get-rankings.dto";
import { CastVoteDto } from "./votes/dto/cast-vote.dto";
import { CreateQADto } from "./author-fan/dto/create-qa.dto";
import { CreateAuthorUpdateDto } from "./author-fan/dto/create-author-update.dto";

@Injectable()
export class FanEconomyService {
  constructor(
    private readonly tippingService: TippingService,
    private readonly rankingsService: RankingsService,
    private readonly gamificationService: GamificationService,
    private readonly votesService: VotesService,
    private readonly authorFanService: AuthorFanService
  ) {}

  createTip(payload: CreateTipDto) {
    return this.tippingService.createTip(payload);
  }

  getTipHistory(options: { storyId: string; authorId?: string; userId?: string; page?: number; limit?: number }) {
    return this.tippingService.getTipHistory(options);
  }

  getTotalTips(options: { storyId?: string; authorId?: string }) {
    return this.tippingService.getTotalTips(options);
  }

  calculateFanRankings(options: GetRankingsDto) {
    return this.rankingsService.calculateFanRankings(options);
  }

  getFanRankings(options: GetRankingsDto) {
    return this.rankingsService.getFanRankings(options);
  }

  getUserRanking(options: { userId: string; storyId?: string; authorId?: string }) {
    return this.rankingsService.getUserRanking(options);
  }

  calculateBonusVotes(payload: { tipAmount: number }) {
    return this.gamificationService.calculateBonusVotes(payload);
  }

  awardReward(payload: {
    userId: string;
    storyId?: string;
    rewardType: "bonus_votes" | "badge" | "status";
    amount?: number;
  }) {
    return this.gamificationService.awardReward(payload);
  }

  getUserRewards(userId: string) {
    return this.gamificationService.getUserRewards(userId);
  }

  castMonthlyVote(payload: CastVoteDto) {
    return this.votesService.castVote(payload);
  }

  getMonthlyVoteResults(options: { storyId: string; year?: number; month?: number }) {
    return this.votesService.getMonthlyVoteResults(options);
  }

  getUserVotes(options: { userId: string; year?: number; month?: number }) {
    return this.votesService.getUserVotes(options);
  }

  resetMonthlyVotes() {
    return this.votesService.resetMonthlyVotes();
  }

  createQASession(payload: CreateQADto) {
    return this.authorFanService.createQASession(payload);
  }

  createAuthorUpdate(payload: CreateAuthorUpdateDto) {
    return this.authorFanService.createAuthorUpdate(payload);
  }

  getAuthorInteractions(options: { authorId: string; type?: "qa" | "update"; limit?: number }) {
    return this.authorFanService.getAuthorInteractions(options);
  }

  getFanAnalytics(authorId: string) {
    return this.authorFanService.getFanAnalytics(authorId);
  }
}
