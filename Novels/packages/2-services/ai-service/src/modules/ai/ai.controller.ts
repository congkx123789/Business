import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { AIService } from "./ai.service";

interface SummarizeRequest {
  text: string;
  maxLength?: number;
}

interface TranslateRequest {
  text: string;
  fromLang: string;
  toLang: string;
  context?: string;
}

interface TranslateSentenceRequest {
  sentence: string;
  fromLang: string;
  toLang: string;
  context?: string;
}

interface TranslateChapterRequest {
  chapterId: string;
  fromLang: string;
  toLang: string;
}

interface ParallelTranslationRequest {
  text: string;
  fromLang: string;
  toLang: string;
  displayMode?: "line-by-line" | "side-by-side" | "interleaved";
}

interface GetRecommendationsRequest {
  userId: number;
  limit?: number;
}

interface MoodRecommendationsRequest extends GetRecommendationsRequest {
  mood: string;
}

interface NaturalLanguageSearchRequest extends GetRecommendationsRequest {
  query: string;
}

interface ExploreRequest {
  userId: number;
  limit?: number;
}

interface TrendingStoriesRequest {
  timeRange: "daily" | "weekly" | "monthly";
  genre?: string;
  limit?: number;
}

interface SimilarStoriesRequest {
  storyId: number;
  limit?: number;
}

interface ExplainRecommendationRequest {
  userId: number;
  storyId?: number;
}

interface GenerateContentRequest {
  prompt: string;
  maxTokens?: number;
}

interface AnnotationSummaryRequest {
  annotationIds?: string[];
  highlights?: string[];
  selectedText?: string;
  surroundingText?: string;
  context?: string;
}

interface SynthesizeSpeechRequest {
  text: string;
  language: string;
  voice?: string;
  speed?: number;
  emotion?: string;
  voiceStyle?: string;
  context?: string;
  syncMode?: "word-by-word" | "sentence-by-sentence";
}

interface SynthesizeEmotionalSpeechRequest {
  text: string;
  language: string;
  voice?: string;
  emotion?: string;
  voiceStyle?: string;
  context?: string;
}

interface GetHumanNarrationRequest {
  storyId: string;
  chapterId: string;
}

interface LookupWordRequest {
  word: string;
  fromLang: string;
  toLang: string;
  dictionarySource?: string;
}

interface TouchTranslateRequest {
  word: string;
  fromLang: string;
  toLang: string;
  position?: string;
}

interface PronunciationRequest {
  word: string;
  language: string;
}

@Controller()
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @GrpcMethod("AIService", "Summarize")
  summarize(data: SummarizeRequest) {
    return this.aiService.summarize(data.text, data.maxLength ?? 200);
  }

  @GrpcMethod("AIService", "Translate")
  translate(data: TranslateRequest) {
    return this.aiService.translate(data.text, data.fromLang, data.toLang, data.context);
  }

  @GrpcMethod("AIService", "TranslateSentence")
  translateSentence(data: TranslateSentenceRequest) {
    return this.aiService.translateSentence(data.sentence, data.fromLang, data.toLang, data.context);
  }

  @GrpcMethod("AIService", "GetParallelTranslation")
  getParallelTranslation(data: ParallelTranslationRequest) {
    return this.aiService.getParallelTranslation(data.text, data.fromLang, data.toLang, data.displayMode);
  }

  @GrpcMethod("AIService", "TranslateChapter")
  translateChapter(data: TranslateChapterRequest) {
    return this.aiService.translateChapter(data.chapterId, data.fromLang, data.toLang);
  }

  @GrpcMethod("AIService", "GetRecommendations")
  getRecommendations(data: GetRecommendationsRequest) {
    return this.aiService.getRecommendations(data.userId, data.limit ?? 10);
  }

  @GrpcMethod("AIService", "GetMoodBasedRecommendations")
  getMoodRecommendations(data: MoodRecommendationsRequest) {
    return this.aiService.getMoodRecommendations(data.userId, data.mood, data.limit ?? 10);
  }

  @GrpcMethod("AIService", "SearchByNaturalLanguage")
  searchByNaturalLanguage(data: NaturalLanguageSearchRequest) {
    return this.aiService.searchByNaturalLanguage(data.userId, data.query, data.limit ?? 10);
  }

  @GrpcMethod("AIService", "ExploreNewTerritories")
  exploreNewTerritories(data: ExploreRequest) {
    return this.aiService.exploreNewTerritories(data.userId, data.limit ?? 10);
  }

  @GrpcMethod("AIService", "GetTrendingStories")
  getTrendingStories(data: TrendingStoriesRequest) {
    return this.aiService.getTrendingStories(data.timeRange, data.genre, data.limit ?? 10);
  }

  @GrpcMethod("AIService", "ExplainRecommendation")
  explainRecommendation(data: ExplainRecommendationRequest) {
    return this.aiService.explainRecommendation(data.userId, data.storyId);
  }

  @GrpcMethod("AIService", "GetSimilarStories")
  getSimilarStories(data: SimilarStoriesRequest) {
    return this.aiService.getSimilarStories(data.storyId, data.limit ?? 10);
  }

  @GrpcMethod("AIService", "GenerateContent")
  generateContent(data: GenerateContentRequest) {
    return this.aiService.generateContent(data.prompt, data.maxTokens ?? 1000);
  }

  @GrpcMethod("AIService", "SynthesizeSpeech")
  synthesizeSpeech(data: SynthesizeSpeechRequest) {
    return this.aiService.synthesizeSpeech(data.text, data);
  }

  @GrpcMethod("AIService", "SynthesizeEmotionalSpeech")
  synthesizeEmotionalSpeech(data: SynthesizeEmotionalSpeechRequest) {
    return this.aiService.synthesizeEmotionalSpeech(data.text, data);
  }

  @GrpcMethod("AIService", "GetTTSWithSync")
  getTtsWithSync(data: SynthesizeSpeechRequest) {
    return this.aiService.getTtsWithSync(data.text, data);
  }

  @GrpcMethod("AIService", "GetHumanNarration")
  getHumanNarration(data: GetHumanNarrationRequest) {
    return this.aiService.getHumanNarration(data.storyId, data.chapterId);
  }

  @GrpcMethod("AIService", "GetNarrationOptions")
  getNarrationOptions(data: GetHumanNarrationRequest) {
    return this.aiService.getNarrationOptions(data.storyId, data.chapterId);
  }

  @GrpcMethod("AIService", "LookupWord")
  lookupWord(data: LookupWordRequest) {
    return this.aiService.lookupWord(data.word, data.fromLang, data.toLang, data.dictionarySource);
  }

  @GrpcMethod("AIService", "TouchTranslate")
  touchTranslate(data: TouchTranslateRequest) {
    return this.aiService.touchTranslate(data.word, data.fromLang, data.toLang, data.position);
  }

  @GrpcMethod("AIService", "GetPronunciation")
  getPronunciation(data: PronunciationRequest) {
    return this.aiService.getPronunciation(data.word, data.language);
  }

  @GrpcMethod("AIService", "SummarizeAnnotations")
  summarizeAnnotations(data: AnnotationSummaryRequest) {
    return this.aiService.summarizeAnnotations(data.annotationIds ?? [], data.highlights ?? [], data.context);
  }

  @GrpcMethod("AIService", "GetAnnotationSummary")
  getAnnotationSummary(data: AnnotationSummaryRequest) {
    if (!data.selectedText) {
      return {
        success: false,
        summary: "",
        insights: [],
        message: "selectedText is required",
      };
    }
    return this.aiService.getAnnotationSummary(data.selectedText, data.surroundingText, data.context);
  }
}

