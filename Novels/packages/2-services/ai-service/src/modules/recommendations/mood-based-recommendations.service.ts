import { Injectable } from "@nestjs/common";

type Mood =
  | "action"
  | "romance"
  | "mystery"
  | "comedy"
  | "drama"
  | "thriller"
  | "adventure";

@Injectable()
export class MoodBasedRecommendationsService {
  async getRecommendations(userId: number, mood: Mood, limit: number) {
    return Array.from({ length: limit }).map((_, index) => ({
      storyId: userId * 10 + index,
      title: `${mood.toUpperCase()} Pick #${index + 1}`,
      reason: `Matches your current mood: ${mood}`,
      score: Number((0.9 - index * 0.05).toFixed(2)),
    }));
  }
}


