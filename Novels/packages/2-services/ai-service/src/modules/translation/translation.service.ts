import { Injectable } from "@nestjs/common";
import { GenerativeAIProvider } from "../../core/generative-ai.provider";
import { TranslationCacheService } from "./translation-cache.service";
import { StoriesClientService } from "../../clients/stories-client.service";

export interface TranslationResult {
  success: boolean;
  translatedText: string;
  message: string;
}

@Injectable()
export class TranslationService {
  constructor(
    private readonly aiProvider: GenerativeAIProvider,
    private readonly translationCache: TranslationCacheService,
    private readonly storiesClient: StoriesClientService
  ) {}

  async translateText(text: string, fromLang: string, toLang: string, context?: string): Promise<TranslationResult> {
    if (!this.aiProvider.isConfigured()) {
      return {
        success: false,
        translatedText: "",
        message: "AI model is not configured",
      };
    }

    return this.translationCache.getOrSet(text, fromLang, toLang, context, async () => {
      try {
        const prompt = `Translate the following text from ${fromLang} to ${toLang}. Preserve names and cultural nuances.${
          context ? `\nContext: ${context}` : ""
        }\n\n${text}`;
        const translated = await this.aiProvider.generateText(prompt, { maxTokens: Math.min(text.length * 2, 1024) });
        return {
          success: true,
          translatedText: translated.trim(),
          message: "Text translated successfully",
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to translate text";
        return {
          success: false,
          translatedText: "",
          message,
        };
      }
    });
  }

  async translateSentence(sentence: string, fromLang: string, toLang: string, context?: string): Promise<TranslationResult> {
    return this.translateText(sentence, fromLang, toLang, context);
  }

  async translateChapter(chapterId: string, fromLang: string, toLang: string): Promise<TranslationResult> {
    const content = await this.fetchChapterContent(chapterId);
    if (!content) {
      return {
        success: false,
        translatedText: "",
        message: `Chapter content for ${chapterId} is not available`,
      };
    }

    return this.translateText(content, fromLang, toLang, `chapterId:${chapterId}`);
  }

  private async fetchChapterContent(chapterId: string): Promise<string | null> {
    return this.storiesClient.getChapterContent(chapterId);
  }
}


