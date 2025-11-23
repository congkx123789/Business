import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

@Injectable()
export class AnnotationRevisitationService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  async getRevisitationQueue(userId: string, limit = 20) {
    const normalizedUserId = this.normalizeUserId(userId);
    const annotations = await this.prisma.annotation.findMany({
      where: {
        userId: normalizedUserId,
        OR: [{ nextReviewDate: null }, { nextReviewDate: { lte: new Date() } }],
      },
      orderBy: { nextReviewDate: "asc" },
      take: limit,
    });

    return {
      success: true,
      data: annotations,
      message: "Revisitation queue retrieved",
    };
  }

  async markAsReviewed(annotationId: string) {
    await this.prisma.annotation.update({
      where: { id: annotationId },
      data: {
        lastReviewedAt: new Date(),
        reviewCount: { increment: 1 },
        nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      },
    });

    return {
      success: true,
      message: "Annotation review recorded",
    };
  }
}

