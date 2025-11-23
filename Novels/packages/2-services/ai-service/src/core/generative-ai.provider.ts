import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

interface GenerateTextOptions {
  maxTokens?: number;
}

@Injectable()
export class GenerativeAIProvider {
  private readonly logger = new Logger(GenerativeAIProvider.name);
  private readonly model: GenerativeModel | null;
  private readonly maxTokensLimit: number | null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>("ai.googleApiKey");
    if (!apiKey) {
      this.logger.warn("AI service is not configured. Set AI_SERVICE_GOOGLE_API_KEY to enable features.");
      this.model = null;
      this.maxTokensLimit = null;
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = this.configService.get<string>("ai.model", "gemini-pro");
    this.model = genAI.getGenerativeModel({ model: modelName });
    const configuredLimit = this.configService.get<number>("ai.maxTokens", 1000);
    this.maxTokensLimit = Number.isFinite(configuredLimit) && configuredLimit > 0 ? configuredLimit : null;
  }

  isConfigured(): boolean {
    return Boolean(this.model);
  }

  async generateText(prompt: string, options?: GenerateTextOptions): Promise<string> {
    if (!this.model) {
      throw new Error("AI model is not configured");
    }

    const generationConfig = this.buildGenerationConfig(options);

    const result = await this.model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });

    return result.response.text();
  }

  private buildGenerationConfig(options?: GenerateTextOptions) {
    const requested = options?.maxTokens;
    const resolved = this.resolveMaxTokens(requested);

    if (!resolved) {
      return undefined;
    }

    return {
      maxOutputTokens: resolved,
    };
  }

  private resolveMaxTokens(requested?: number): number | undefined {
    const limit = this.maxTokensLimit;
    const sanitizedRequested = typeof requested === "number" && requested > 0 ? requested : undefined;

    if (sanitizedRequested && limit) {
      return Math.min(sanitizedRequested, limit);
    }

    if (sanitizedRequested) {
      return sanitizedRequested;
    }

    return limit ?? undefined;
  }
}


