// Recommendation types (Enhanced)

export interface Recommendation {
  id: string;
  storyId: string;
  story?: Story;
  userId: string;
  score: number; // 0-1
  explanation?: string;
  source: RecommendationSource;
  context: RecommendationContext;
  createdAt: Date;
}

export interface SimilarStory {
  storyId: string;
  story?: Story;
  similarityScore: number; // 0-1
  reasons: string[];
}

export interface TrendingStory {
  storyId: string;
  story?: Story;
  trendScore: number;
  timeRange: TimeRange;
  trendDirection: 'up' | 'down' | 'stable';
}

export interface MoodBasedRecommendation {
  storyId: string;
  story?: Story;
  mood: Mood;
  confidence: number; // 0-1
  reasons: string[];
}

export interface NaturalLanguageQuery {
  query: string;
  userId?: string;
  results: Recommendation[];
  interpretedQuery?: {
    genres?: string[];
    themes?: string[];
    mood?: Mood;
    keywords?: string[];
  };
}

export interface FilterBubbleBreaker {
  storyId: string;
  story?: Story;
  reason: string; // Why this breaks the filter bubble
  newGenre?: string;
  newTheme?: string;
}

export type RecommendationSource = 
  | 'collaborative' 
  | 'content-based' 
  | 'hybrid' 
  | 'mood-based' 
  | 'natural-language'
  | 'trending';

export type RecommendationContext = 'home' | 'story' | 'chapter' | 'library';

export type Mood = 
  | 'action' 
  | 'romance' 
  | 'mystery' 
  | 'comedy' 
  | 'drama' 
  | 'thriller' 
  | 'fantasy' 
  | 'sci-fi'
  | 'horror'
  | 'slice-of-life';

// Import types
import type { Story } from '../story/story.types';
import type { TimeRange } from '../story/ranking.types';

