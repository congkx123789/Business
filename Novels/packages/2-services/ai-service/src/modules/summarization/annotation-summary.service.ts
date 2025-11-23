import { Injectable } from "@nestjs/common";
import { GenerativeAIProvider } from "../../core/generative-ai.provider";

export interface AnnotationSummaryPayload {
  annotationIds?: string[];
  highlights: string[];
  context?: string;
}

@Injectable()
export class AnnotationSummaryService {
  constructor(private readonly aiProvider: GenerativeAIProvider) {}

  private ensureConfigured() {
    if (!this.aiProvider.isConfigured()) {
      return {
        success: false,
        summary: "",
        insights: [],
        message: "AI model is not configured",
      };
    }
    return null;
  }

  async summarizeAnnotations(payload: AnnotationSummaryPayload) {
    const notConfigured = this.ensureConfigured();
    if (notConfigured) {
      return notConfigured;
    }

    try {
      const highlights = payload.highlights.join("\n- ");
      const ids = payload.annotationIds?.length ? `Annotation IDs: ${payload.annotationIds.join(", ")}\n` : "";
      const prompt = `You are an annotation assistant. Summarize the following highlights into key takeaways and insights. Provide a concise summary plus 3 insights.\n\n${ids}Context: ${
        payload.context ?? "Not provided"
      }\nHighlights:\n- ${highlights}`;
      const response = await this.aiProvider.generateText(prompt, { maxTokens: 600 });

      const [summary, ...insights] = response.split("\n").filter(Boolean);
      return {
        success: true,
        summary: summary ?? "",
        insights: insights.slice(0, 3),
        message: "Annotation summary generated",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to summarize annotations";
      return {
        success: false,
        summary: "",
        insights: [],
        message,
      };
    }
  }

  async summarizeSelection(selectedText: string, surroundingText?: string, context?: string) {
    const notConfigured = this.ensureConfigured();
    if (notConfigured) {
      return notConfigured;
    }

    try {
      const prompt = `Generate a concise summary and three insights based only on the provided highlight. Use surrounding text for extra context when supplied.\n\nContext: ${
        context ?? "Not provided"
      }\n\nSurrounding Text:\n${surroundingText ?? "Not provided"}\n\nHighlight:\n${selectedText}`;
      const response = await this.aiProvider.generateText(prompt, { maxTokens: 400 });
      const [summary, ...insights] = response.split("\n").filter(Boolean);
      return {
        success: true,
        summary: summary ?? "",
        insights: insights.slice(0, 3),
        message: "Annotation summary generated",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to summarize selection";
      return {
        success: false,
        summary: "",
        insights: [],
        message,
      };
    }
  }
}


