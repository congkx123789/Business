import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CommentEventsService } from "../../common/queue/comment-events.service";

interface CreatePollInput {
  storyId?: string;
  createdBy: string;
  title: string;
  description?: string;
  options: string[];
  endsAt?: string;
}

interface VotePollInput {
  pollId: string;
  optionId: string;
  userId: string;
}

interface GetPollsInput {
  storyId?: string;
  activeOnly?: boolean;
}

@Injectable()
export class PollsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commentEvents: CommentEventsService
  ) {}

  async createPoll(input: CreatePollInput) {
    const poll = await this.prisma.poll.create({
      data: {
        storyId: input.storyId ?? null,
        createdBy: input.createdBy,
        title: input.title,
        description: input.description ?? null,
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
        options: {
          create: input.options.map((label, index) => ({
            label,
            order: index,
            voteCount: 0,
          })),
        },
      } as any,
      include: {
        options: true,
      },
    });

    await this.commentEvents.pollCreated({
      pollId: poll.id,
      storyId: poll.storyId,
      createdBy: poll.createdBy,
    });

    return {
      success: true,
      data: poll,
    };
  }

  async vote(input: VotePollInput) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: input.pollId },
      include: { options: true },
    });
    if (!poll) {
      return { success: false, message: "Poll not found" };
    }
    if (poll.endsAt && poll.endsAt.getTime() < Date.now()) {
      return { success: false, message: "Poll has ended" };
    }

    const optionExists = poll.options.some((option) => option.id === input.optionId);
    if (!optionExists) {
      return { success: false, message: "Option not found" };
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.pollVote.findUnique({
        where: {
          pollId_userId: {
            pollId: input.pollId,
            userId: input.userId,
          },
        },
      });

      if (existing && existing.optionId === input.optionId) {
        return { success: true, message: "Vote recorded" };
      }

      if (existing) {
        await tx.pollVote.delete({ where: { id: existing.id } });
        // Recalculate voteCount from votes relation
        const oldOptionVoteCount = await tx.pollVote.count({
          where: { optionId: existing.optionId },
        });
        await tx.pollOption.update({
          where: { id: existing.optionId },
          data: { voteCount: oldOptionVoteCount } as any,
        });
      }

      await tx.pollVote.create({
        data: {
          pollId: input.pollId,
          optionId: input.optionId,
          userId: input.userId,
        },
      });

      // Recalculate voteCount from votes relation
      const newOptionVoteCount = await tx.pollVote.count({
        where: { optionId: input.optionId },
      });
      await tx.pollOption.update({
        where: { id: input.optionId },
        data: { voteCount: newOptionVoteCount } as any,
      });

      return { success: true, message: "Vote recorded" };
    });

    const refreshed = await this.prisma.poll.findUnique({
      where: { id: input.pollId },
      include: { options: true },
    });

    await this.commentEvents.pollVoted({
      pollId: input.pollId,
      optionId: input.optionId,
      userId: input.userId,
    });

    return {
      ...result,
      data: refreshed,
    };
  }

  async getPolls(input: GetPollsInput = {}) {
    const { storyId, activeOnly } = input;
    const polls = await this.prisma.poll.findMany({
      where: {
        ...(storyId ? { storyId } : {}),
        ...(activeOnly
          ? {
              OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
            }
          : {}),
      },
      include: {
        options: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return {
      success: true,
      data: polls,
    };
  }

  async getPollResults(pollId: string) {
    const poll = await this.prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });

    if (!poll) {
      return { success: false, message: "Poll not found" };
    }

    return {
      success: true,
      data: poll,
    };
  }
}


