import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../../../common/database/database.service";
import { CreatePollDto } from "./dto/create-poll.dto";
import { CreateQuizDto } from "./dto/create-quiz.dto";
import { CommunityEventsService } from "../../../common/queue/community-events.service";

@Injectable()
export class PlatformInteractionsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly events: CommunityEventsService
  ) {}

  async createPoll(payload: CreatePollDto) {
    const endsAt = payload.endsAt ? new Date(payload.endsAt) : null;
    const poll = await this.databaseService.poll.create({
      data: {
        storyId: payload.storyId ?? null,
        createdBy: payload.createdBy,
        question: payload.question,
        endsAt,
        options: {
          create: payload.options.map((label, index) => ({
            label,
            order: index,
          })),
        },
      },
      include: { options: true },
    });

    await this.events.pollCreated({
      pollId: poll.id,
      storyId: poll.storyId,
      createdBy: poll.createdBy,
    });

    return poll;
  }

  async getPolls(options: { storyId?: string; isActive?: boolean }) {
    const polls = await this.databaseService.poll.findMany({
      where: {
        ...(options.storyId ? { storyId: options.storyId } : {}),
        ...(typeof options.isActive === "boolean" ? { isActive: options.isActive } : {}),
      },
      include: { options: true },
      orderBy: { createdAt: "desc" },
    });

    return polls;
  }

  async votePoll(payload: { pollId: string; userId: string; optionId?: string; optionIndex?: number }) {
    const poll = await this.databaseService.poll.findUnique({
      where: { id: payload.pollId },
      include: { options: true },
    });
    if (!poll) {
      throw new NotFoundException("Poll not found");
    }
    let optionId = payload.optionId;
    if (!optionId && typeof payload.optionIndex === "number") {
      optionId = poll.options.find((opt) => opt.order === payload.optionIndex)?.id;
    }

    const option = poll.options.find((opt) => opt.id === optionId);
    if (!option) {
      throw new NotFoundException("Poll option not found");
    }
    optionId = option.id;

    await this.databaseService.$transaction(async (tx) => {
      const vote = await tx.pollVote.upsert({
        where: {
          pollId_userId: {
            pollId: payload.pollId,
            userId: payload.userId,
          },
        },
        update: { optionId },
        create: {
          pollId: payload.pollId,
          userId: payload.userId,
          optionId,
        },
      });

      const [totalVotes, optionVotes] = await Promise.all([
        tx.pollVote.count({ where: { pollId: payload.pollId } }),
        tx.pollVote.count({ where: { pollId: payload.pollId, optionId } }),
      ]);

      await Promise.all([
        tx.poll.update({
          where: { id: payload.pollId },
          data: { totalVotes },
        }),
        tx.pollOption.update({
          where: { id: optionId },
          data: { votes: optionVotes },
        }),
      ]);
    });

    const result = { pollId: payload.pollId, optionId, userId: payload.userId };
    await this.events.pollVoted(result);
    return result;
  }

  async getPollResults(pollId: string) {
    const poll = await this.databaseService.poll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });
    if (!poll) {
      throw new NotFoundException("Poll not found");
    }

    return poll;
  }

  async createQuiz(payload: CreateQuizDto) {
    const quiz = await this.databaseService.quiz.create({
      data: {
        storyId: payload.storyId ?? null,
        createdBy: payload.createdBy,
        title: payload.title,
        questions: {
          create: payload.questions.map((question, index) => ({
            prompt: question.question,
            options: question.options,
            answerIdx: question.answerIndex,
            order: index,
          })),
        },
      },
      include: { questions: true },
    });

    await this.events.quizCreated({
      quizId: quiz.id,
      storyId: quiz.storyId,
      createdBy: quiz.createdBy,
      questionCount: quiz.questions.length,
    });

    return quiz;
  }

  async submitQuizAnswers(payload: { quizId: string; userId: string; answers: number[] }) {
    const questions = await this.databaseService.quizQuestion.findMany({
      where: { quizId: payload.quizId },
      orderBy: { order: "asc" },
    });
    if (!questions.length) {
      throw new NotFoundException("Quiz not found");
    }

    const score = questions.reduce((acc, question, index) => {
      return acc + (payload.answers[index] === question.answerIdx ? 1 : 0);
    }, 0);

    const submission = await this.databaseService.quizSubmission.upsert({
      where: {
        quizId_userId: {
          quizId: payload.quizId,
          userId: payload.userId,
        },
      },
      update: {
        answers: payload.answers,
        score,
      },
      create: {
        quizId: payload.quizId,
        userId: payload.userId,
        answers: payload.answers,
        score,
      },
    });

    const result = {
      quizId: payload.quizId,
      submissionId: submission.id,
      score,
      userId: payload.userId,
    };

    await this.events.quizSubmitted(result);
    return result;
  }
}
