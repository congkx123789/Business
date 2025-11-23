import { Injectable } from "@nestjs/common";
import { GenerativeAIProvider } from "../../core/generative-ai.provider";

@Injectable()
export class ContentGenerationService {
  constructor(private readonly aiProvider: GenerativeAIProvider) {}

  async generateContent(prompt: string, maxTokens: number) {
    if (!this.aiProvider.isConfigured()) {
      return {
        success: false,
        content: "",
        message: "AI model is not configured",
      };
    }

    try {
      const content = await this.aiProvider.generateText(prompt, { maxTokens });
      return {
        success: true,
        content,
        message: "Content generated successfully",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate content";
      return {
        success: false,
        content: "",
        message,
      };
    }
  }
}


