import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../../common/database/database.service";
import { CreateQADto } from "./dto/create-qa.dto";
import { CreateAuthorUpdateDto } from "./dto/create-author-update.dto";

@Injectable()
export class AuthorFanService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createQASession(payload: CreateQADto) {
    return this.databaseService.authorFanInteraction.create({
      data: {
        authorId: payload.authorId,
        userId: payload.userId,
        interactionType: "QA",
        question: payload.question,
        answer: payload.answer,
      },
    });
  }

  async createAuthorUpdate(payload: CreateAuthorUpdateDto) {
    return this.databaseService.authorFanInteraction.create({
      data: {
        authorId: payload.authorId,
        interactionType: "UPDATE",
        title: payload.title,
        content: payload.content,
      },
    });
  }

  async getAuthorInteractions(options: { authorId: string; type?: "qa" | "update"; limit?: number }) {
    return this.databaseService.authorFanInteraction.findMany({
      where: {
        authorId: options.authorId,
        ...(options.type ? { interactionType: options.type.toUpperCase() as any } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: options.limit ?? 50,
    });
  }

  async getFanAnalytics(authorId: string) {
    const [tipAgg, voteAgg] = await Promise.all([
      this.databaseService.tip.aggregate({
        where: { authorId },
        _sum: { amount: true },
        _count: { userId: true },
      }),
      this.databaseService.monthlyVote.aggregate({
        where: { storyId: authorId },
        _sum: { votes: true },
      }),
    ]);

    return {
      authorId,
      totalTips: tipAgg._sum.amount?.toNumber() ?? 0,
      activeFans: tipAgg._count.userId,
      totalVotes: voteAgg._sum.votes ?? 0,
    };
  }
}

