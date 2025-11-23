import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CommentEventsService } from "../../common/queue/comment-events.service";

interface CreateQuizInput {
  storyId?: string;
  createdBy: string;
  title: string;
  description?: string;
  timeLimit?: number;
  questions: Array<{
    prompt: string;
    explanation?: string;
    options: Array<{
      text: string;
      isCorrect: boolean;
    }>;
  }>;
}

interface SubmitQuizInput {
  quizId: string;
  userId: string;
  timeSpent?: number;
  answers: Array<{
    questionId: string;
    optionId: string;
  }>;
}

@Injectable()
export class QuizzesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commentEvents: CommentEventsService
  ) {}

  async createQuiz(input: CreateQuizInput) {
    const quiz = await this.prisma.quiz.create({
      data: {
        storyId: input.storyId ?? null,
        createdBy: input.createdBy,
        title: input.title,
        description: input.description ?? null,
        timeLimit: input.timeLimit ?? null,
        questions: {
          create: input.questions.map((question) => ({
            prompt: question.prompt,
            explanation: question.explanation ?? null,
            options: {
              create: question.options.map((option) => ({
                text: option.text,
                isCorrect: option.isCorrect,
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    await this.commentEvents.quizCreated({
      quizId: quiz.id,
      storyId: quiz.storyId,
      createdBy: quiz.createdBy,
      questionCount: quiz.questions.length,
    });

    return {
      success: true,
      data: quiz,
    };
  }

  async getQuizzes(storyId?: string, limit = 20, offset = 0) {
    const [quizzes, total] = await this.prisma.$transaction([
      this.prisma.quiz.findMany({
        where: storyId ? { storyId } : {},
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      this.prisma.quiz.count({
        where: storyId ? { storyId } : {},
      }),
    ]);

    return {
      success: true,
      data: quizzes,
      total,
    };
  }

  async submitQuiz(input: SubmitQuizInput) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: input.quizId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      return { success: false, message: "Quiz not found" };
    }

    const answersByQuestion = new Map(input.answers.map((answer) => [answer.questionId, answer.optionId]));

    let score = 0;
    quiz.questions.forEach((question) => {
      const optionId = answersByQuestion.get(question.id);
      if (!optionId) {
        return;
      }
      const option = question.options.find((opt) => opt.id === optionId);
      if (option?.isCorrect) {
        score += 1;
      }
    });

    const submission = await this.prisma.quizSubmission.upsert({
      where: {
        quizId_userId: {
          quizId: input.quizId,
          userId: input.userId,
        },
      },
      create: {
        quizId: input.quizId,
        userId: input.userId,
        score,
        totalQuestions: quiz.questions.length,
        timeSpent: input.timeSpent ?? null,
        answers: {
          create: input.answers.map((answer) => ({
            questionId: answer.questionId,
            optionId: answer.optionId,
            isCorrect: quiz.questions
              .find((question) => question.id === answer.questionId)
              ?.options.find((option) => option.id === answer.optionId)?.isCorrect ?? false,
          })),
        },
      },
      update: {
        score,
        totalQuestions: quiz.questions.length,
        timeSpent: input.timeSpent ?? null,
        answers: {
          deleteMany: {},
          create: input.answers.map((answer) => ({
            questionId: answer.questionId,
            optionId: answer.optionId,
            isCorrect: quiz.questions
              .find((question) => question.id === answer.questionId)
              ?.options.find((option) => option.id === answer.optionId)?.isCorrect ?? false,
          })),
        },
      },
      include: {
        answers: true,
      },
    });

    await this.commentEvents.quizSubmitted({
      quizId: submission.quizId,
      submissionId: submission.id,
      userId: submission.userId,
      score: submission.score,
      totalQuestions: submission.totalQuestions,
    });

    return {
      success: true,
      data: submission,
    };
  }

  async getLeaderboard(quizId: string, limit = 50) {
    const submissions = await this.prisma.quizSubmission.findMany({
      where: { quizId },
      orderBy: [
        { score: "desc" },
        { timeSpent: "asc" },
        { createdAt: "asc" },
      ],
      take: limit,
    });

    return {
      success: true,
      entries: submissions,
    };
  }
}


