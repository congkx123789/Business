import { Injectable } from "@nestjs/common";
import { ReadingChallengesService } from "./reading-challenges.service";

interface CreateCommunityChallengeParams {
  creatorId: string;
  name: string;
  description?: string;
  goal: number;
  goalType: "books" | "chapters" | "reading-time" | "pages";
  timeRange: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  startDate: string;
  endDate: string;
}

@Injectable()
export class CommunityChallengesService {
  constructor(
    private readonly readingChallengesService: ReadingChallengesService,
  ) {}

  async createCommunityChallenge(params: CreateCommunityChallengeParams) {
    return this.readingChallengesService.createChallenge({
      creatorId: params.creatorId,
      name: params.name,
      description: params.description,
      challengeType: "community",
      goal: params.goal,
      goalType: params.goalType,
      timeRange: params.timeRange,
      startDate: params.startDate,
      endDate: params.endDate,
      isPublic: true,
    });
  }
}


