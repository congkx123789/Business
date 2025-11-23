export interface AuthorDashboardQueryDto {
  authorId: number;
  storyId?: number;
}

export interface AuthorAnalyticsQueryDto {
  authorId: number;
  storyId?: number;
  timeRange?: string;
}

export interface AuthorRevenueQueryDto {
  authorId: number;
  storyId?: number;
  timeRange?: string;
}

export interface AuthorEngagementQueryDto {
  authorId: number;
  storyId?: number;
}

export interface ReaderInsightsQueryDto {
  authorId: number;
  storyId?: number;
}
