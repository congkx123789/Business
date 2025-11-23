import { Module } from "@nestjs/common";
import { RecommendationsService } from "./recommendations.service";
import { CollaborativeFilteringService } from "./collaborative-filtering.service";
import { ContentBasedFilteringService } from "./content-based-filtering.service";
import { RecommendationEngineService } from "./recommendation-engine.service";
import { UserBehaviorAnalyzerService } from "./user-behavior-analyzer.service";
import { MoodBasedRecommendationsService } from "./mood-based-recommendations.service";
import { NaturalLanguageSearchService } from "./natural-language-search.service";
import { FilterBubbleBreakerService } from "./filter-bubble-breaker.service";
import { TrendingAnalyzerService } from "./trending-analyzer.service";
import { RecommendationCalculationWorker } from "./workers/recommendation-calculation.worker";
import { BehaviorEventProcessorWorker } from "./workers/behavior-event-processor.worker";

@Module({
  providers: [
    RecommendationsService,
    CollaborativeFilteringService,
    ContentBasedFilteringService,
    RecommendationEngineService,
    UserBehaviorAnalyzerService,
    MoodBasedRecommendationsService,
    NaturalLanguageSearchService,
    FilterBubbleBreakerService,
    TrendingAnalyzerService,
    RecommendationCalculationWorker,
    BehaviorEventProcessorWorker,
  ],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}


