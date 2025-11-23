import { Injectable } from "@nestjs/common";

@Injectable()
export class FilterBubbleBreakerService {
  async exploreNewTerritories(userId: number, limit: number) {
    return Array.from({ length: limit }).map((_, index) => ({
      storyId: 5000 + index,
      title: `Explore Genre #${index + 1}`,
      reason: "Outside your usual reading bubble",
      score: Number((0.7 - index * 0.03).toFixed(2)),
    }));
  }
}


