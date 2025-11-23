export type TrendingTimeRange = "daily" | "weekly" | "monthly";

export interface TrendingStoriesRequestDto {
  timeRange: TrendingTimeRange;
  genre?: string;
  limit?: number;
}


