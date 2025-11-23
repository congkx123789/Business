import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

@Injectable()
export class AnnotationExportService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  async exportToMarkdown(userId: string, annotationIds?: string[]) {
    const normalizedUserId = this.normalizeUserId(userId);
    const annotations = await this.prisma.annotation.findMany({
      where: {
        userId: normalizedUserId,
        ...(annotationIds ? { id: { in: annotationIds } } : {}),
      },
      orderBy: { createdAt: "asc" },
    });

    const markdown = annotations
      .map(
        (annotation) =>
          `> ${annotation.selectedText}\n\n${annotation.note ?? ""}\n\n---`
      )
      .join("\n\n");

    return {
      success: true,
      data: markdown,
      message: "Annotations exported to Markdown",
    };
  }
}

