import { Injectable } from "@nestjs/common";
import { DictionaryIntegrationService } from "./dictionary-integration.service";
import { PronunciationService } from "./pronunciation.service";
import { RedisCacheService } from "../../cache/redis-cache.service";
import { createHash } from "crypto";

export interface DictionaryResponse {
  success: boolean;
  data: {
    word: string;
    pronunciation?: string;
    pinyin?: string;
    definitions: string[];
    examples: string[];
  } | null;
  message: string;
}

@Injectable()
export class DictionaryService {
  constructor(
    private readonly integrationService: DictionaryIntegrationService,
    private readonly pronunciationService: PronunciationService,
    private readonly cache: RedisCacheService
  ) {}

  private cacheKey(word: string, fromLang: string, toLang: string, source?: string) {
    const hash = createHash("md5").update(`${word}:${fromLang}:${toLang}:${source ?? "default"}`).digest("hex");
    return `dictionary:${hash}`;
  }

  async lookupWord(word: string, fromLang: string, toLang: string, dictionarySource?: string): Promise<DictionaryResponse> {
    const key = this.cacheKey(word, fromLang, toLang, dictionarySource);
    // Dictionary cache TTL: 30 days (as per documentation)
    const ttlMs = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

    return this.cache.wrap(key, async () => {
      const entry = await this.integrationService.lookup(word, dictionarySource);
      if (!entry) {
        return {
          success: false,
          data: null,
          message: "No dictionary entry found",
        };
      }

      return {
        success: true,
        data: {
          word,
          pronunciation: entry.pronunciation,
          pinyin: entry.pinyin,
          definitions: entry.definitions,
          examples: entry.examples,
        },
        message: "Dictionary entry retrieved",
      };
    }, ttlMs);
  }

  async touchTranslate(word: string, fromLang: string, toLang: string, position?: string) {
    const response = await this.lookupWord(word, fromLang, toLang);
    return {
      ...response,
      metadata: {
        position,
      },
    };
  }

  async getPronunciation(word: string, language: string) {
    return this.pronunciationService.getPronunciation(word, language);
  }
}


