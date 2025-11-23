import { Injectable } from "@nestjs/common";
import { TranslationService } from "./translation.service";

type DisplayMode = "line-by-line" | "side-by-side" | "interleaved";

@Injectable()
export class ParallelTranslationService {
  constructor(private readonly translationService: TranslationService) {}

  async getParallelTranslation(text: string, fromLang: string, toLang: string, displayMode: DisplayMode = "line-by-line") {
    const translation = await this.translationService.translateText(text, fromLang, toLang);
    if (!translation.success) {
      return {
        success: false,
        pairs: [],
        message: translation.message,
      };
    }

    const originalLines = text.split("\n").filter(Boolean);
    const translatedLines = translation.translatedText.split("\n").filter(Boolean);
    const pairs = originalLines.map((line, index) => ({
      original: line,
      translated: translatedLines[index] ?? "",
    }));

    return {
      success: true,
      displayMode,
      pairs,
      message: "Parallel translation generated",
    };
  }
}


