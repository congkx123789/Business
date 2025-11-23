import { Injectable } from "@nestjs/common";

@Injectable()
export class AnnotationAiSummaryService {
  async generateSummaryFromAnnotations(annotationTexts: string[]) {
    // Placeholder for AI integration (calls ai-service via gRPC in future)
    const summary = annotationTexts.slice(0, 5).join(" ").slice(0, 500);
    return {
      success: true,
      data: summary,
      message: "Annotation summary generated",
    };
  }
}

