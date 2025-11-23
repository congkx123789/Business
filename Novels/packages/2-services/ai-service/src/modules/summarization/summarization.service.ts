import { Injectable } from "@nestjs/common";
import { GenerativeAIProvider } from "../../core/generative-ai.provider";

export interface SummarizationResult {
  success: boolean;
  summary: string;
  message: string;
}

@Injectable()
export class SummarizationService {
  constructor(private readonly aiProvider: GenerativeAIProvider) {}

  async summarize(text: string, maxLength = 200): Promise<SummarizationResult> {
    if (!this.aiProvider.isConfigured()) {
      return {
        success: false,
        summary: "",
        message: "AI model is not configured",
      };
    }

    try {
      const prompt = `Summarize the following text using no more than ${maxLength} words. Focus on the core plot points and tone.\n\n${text}`;
      const summary = await this.aiProvider.generateText(prompt, { maxTokens: Math.min(maxLength * 2, 1024) });
      return {
        success: true,
        summary: summary.trim(),
        message: "Text summarized successfully",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to summarize text";
      return {
        success: false,
        summary: "",
        message,
      };
    }
  }
}


