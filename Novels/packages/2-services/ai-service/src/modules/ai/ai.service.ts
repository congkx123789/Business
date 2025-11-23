import { Injectable } from "@nestjs/common";
import { SummarizationService } from "../summarization/summarization.service";
import { TranslationService } from "../translation/translation.service";
import { ParallelTranslationService } from "../translation/parallel-translation.service";
import { RecommendationsService } from "../recommendations/recommendations.service";
import { ContentGenerationService } from "./content-generation.service";
import { NarrationStrategyService } from "../tts/narration-strategy.service";
import { DictionaryService } from "../dictionary/dictionary.service";
import { AnnotationSummaryService } from "../summarization/annotation-summary.service";

@Injectable()
export class AIService {
  constructor(
    private readonly summarizationService: SummarizationService,
    private readonly annotationSummaryService: AnnotationSummaryService,
    private readonly translationService: TranslationService,
    private readonly parallelTranslationService: ParallelTranslationService,
    private readonly recommendationsService: RecommendationsService,
    private readonly contentGenerationService: ContentGenerationService,
    private readonly narrationStrategyService: NarrationStrategyService,
    private readonly dictionaryService: DictionaryService
  ) {}

  summarize(text: string, maxLength: number) {
    return this.summarizationService.summarize(text, maxLength);
  }

  summarizeAnnotations(annotationIds: string[], highlights: string[], context?: string) {
    return this.annotationSummaryService.summarizeAnnotations({ annotationIds, highlights, context });
  }

  getAnnotationSummary(selectedText: string, surroundingText?: string, context?: string) {
    return this.annotationSummaryService.summarizeSelection(selectedText, surroundingText, context);
  }

  translate(text: string, fromLang: string, toLang: string, context?: string) {
    return this.translationService.translateText(text, fromLang, toLang, context);
  }

  translateSentence(text: string, fromLang: string, toLang: string, context?: string) {
    return this.translationService.translateSentence(text, fromLang, toLang, context);
  }

  translateChapter(chapterId: string, fromLang: string, toLang: string) {
    return this.translationService.translateChapter(chapterId, fromLang, toLang);
  }

  getRecommendations(userId: number, limit: number) {
    return this.recommendationsService.getRecommendations(userId, limit);
  }

  generateContent(prompt: string, maxTokens: number) {
    return this.contentGenerationService.generateContent(prompt, maxTokens);
  }

  synthesizeSpeech(text: string, payload: { language: string; voice?: string; speed?: number; emotion?: string; voiceStyle?: string; context?: string; syncMode?: "word-by-word" | "sentence-by-sentence" }) {
    return this.narrationStrategyService.synthesizeSpeech(text, payload);
  }

  synthesizeEmotionalSpeech(text: string, payload: { language: string; voice?: string; speed?: number; emotion: string; voiceStyle?: string; context?: string }) {
    return this.narrationStrategyService.synthesizeEmotionalSpeech(text, payload);
  }

  getTtsWithSync(text: string, payload: { language: string; voice?: string; syncMode?: "word-by-word" | "sentence-by-sentence" }) {
    return this.narrationStrategyService.synthesizeSpeechWithSync(text, payload);
  }

  getHumanNarration(storyId: string, chapterId: string) {
    return this.narrationStrategyService.getHumanNarration(storyId, chapterId);
  }

  getNarrationOptions(storyId: string, chapterId: string) {
    return this.narrationStrategyService.getNarrationOptions(storyId, chapterId);
  }

  lookupWord(word: string, fromLang: string, toLang: string, dictionarySource?: string) {
    return this.dictionaryService.lookupWord(word, fromLang, toLang, dictionarySource);
  }

  touchTranslate(word: string, fromLang: string, toLang: string, position?: string) {
    return this.dictionaryService.touchTranslate(word, fromLang, toLang, position);
  }

  getPronunciation(word: string, language: string) {
    return this.dictionaryService.getPronunciation(word, language);
  }

  getParallelTranslation(text: string, fromLang: string, toLang: string, displayMode?: "line-by-line" | "side-by-side" | "interleaved") {
    return this.parallelTranslationService.getParallelTranslation(text, fromLang, toLang, displayMode);
  }

  getMoodRecommendations(userId: number, mood: string, limit: number) {
    return this.recommendationsService.getMoodRecommendations(userId, mood, limit);
  }

  searchByNaturalLanguage(userId: number, query: string, limit: number) {
    return this.recommendationsService.searchByNaturalLanguage(userId, query, limit);
  }

  exploreNewTerritories(userId: number, limit: number) {
    return this.recommendationsService.exploreNewTerritories(userId, limit);
  }

  getSimilarStories(storyId: number, limit: number) {
    return this.recommendationsService.getSimilarStories(storyId, limit);
  }

  getTrendingStories(timeRange: string, genre: string | undefined, limit: number) {
    const allowed: Array<"daily" | "weekly" | "monthly"> = ["daily", "weekly", "monthly"];
    const normalized = (allowed.includes(timeRange as any) ? timeRange : "daily") as "daily" | "weekly" | "monthly";
    return this.recommendationsService.getTrendingStories(normalized, genre, limit);
  }

  explainRecommendation(userId: number, storyId?: number) {
    return this.recommendationsService.explainRecommendation(userId, storyId);
  }
}

