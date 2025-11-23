import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

@Injectable()
export class AnnotationUnificationService {
  constructor(private readonly prisma: DatabaseService) {}

  private normalizeUserId(userId: string) {
    const parsed = Number(userId);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid user id");
    }
    return parsed;
  }

  async unifyFromSource(userId: string, sourceType: string, annotations: Array<{ selectedText: string; note?: string }>) {
    const normalizedUserId = this.normalizeUserId(userId);
    const operations = annotations.map((annotation) =>
      this.prisma.annotation.create({
        data: {
          userId: normalizedUserId,
          sourceType: sourceType as any,
          selectedText: annotation.selectedText,
          note: annotation.note ?? "",
          startOffset: 0,
          endOffset: annotation.selectedText.length,
        },
      })
    );

    await this.prisma.$transaction(operations);
    return {
      success: true,
      message: "Annotations unified",
    };
  }
}

