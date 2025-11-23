export type RankingType = "monthly-votes" | "sales" | "recommendations" | "popularity";
export type RankingTimeRange = "daily" | "weekly" | "monthly" | "all-time";

export interface RankingQueryDto {
  rankingType: RankingType;
  genreId?: number;
  timeRange?: RankingTimeRange;
  limit?: number;
}


