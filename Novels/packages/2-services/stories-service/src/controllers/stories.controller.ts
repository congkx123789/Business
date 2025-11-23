import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { StoriesService } from "../modules/stories/stories.service";
import { ChaptersService } from "../modules/chapters/chapters.service";
import { ChapterDownloadService } from "../modules/chapters/chapter-download.service";
import { GenresService } from "../modules/genres/genres.service";
import { DiscoveryService } from "../modules/discovery/discovery.service";
import { StorefrontService } from "../modules/discovery/storefront.service";
import { DrmService } from "../modules/drm/drm.service";
import { VotingService } from "../modules/discovery/voting.service";
import { SearchIntegrationService } from "../modules/search/search.service";
import { ReadingProgressService } from "../modules/reading-progress/reading-progress.service";
import { AuthorDashboardService } from "../modules/author/author-dashboard.service";
import { AuthorAnalyticsService } from "../modules/author/author-analytics.service";

type SearchStoriesGrpcResponse = {
  success: boolean;
  data: unknown[];
  total: number;
  message?: string;
};

@Controller()
export class StoriesController {
  constructor(
    private readonly storiesService: StoriesService,
    private readonly chaptersService: ChaptersService,
    private readonly chapterDownloadService: ChapterDownloadService,
    private readonly genresService: GenresService,
    private readonly discoveryService: DiscoveryService,
    private readonly storefrontService: StorefrontService,
    private readonly drmService: DrmService,
    private readonly votingService: VotingService,
    private readonly searchIntegrationService: SearchIntegrationService,
    private readonly readingProgressService: ReadingProgressService,
    private readonly authorDashboardService: AuthorDashboardService,
    private readonly authorAnalyticsService: AuthorAnalyticsService
  ) {}

  @GrpcMethod("StoriesService", "GetStoryById")
  getStoryById(data: { id: number }) {
    return this.storiesService.getStoryById(data.id);
  }

  @GrpcMethod("StoriesService", "ListStories")
  listStories(data: { page?: number; limit?: number; genreSlug?: string; search?: string }) {
    return this.storiesService.listStories(data);
  }

  @GrpcMethod("StoriesService", "CreateStory")
  createStory(data: { title: string; author?: string; description?: string; coverImage?: string; categoryId?: number }) {
    return this.storiesService.upsertStory(data);
  }

  @GrpcMethod("StoriesService", "UpdateStory")
  updateStory(data: { id: number; title?: string; author?: string; description?: string; coverImage?: string }) {
    return this.storiesService.upsertStory(data);
  }

  @GrpcMethod("StoriesService", "DeleteStory")
  deleteStory(data: { id: number }) {
    return this.storiesService.deleteStory(data.id);
  }

  @GrpcMethod("StoriesService", "GetChapterById")
  getChapterById(data: { id: number }) {
    return this.chaptersService.getChapterById(data.id);
  }

  @GrpcMethod("StoriesService", "ListChapters")
  listChapters(data: { storyId: number; page?: number; limit?: number }) {
    return this.chaptersService.listChaptersByStory(data.storyId, data.page, data.limit);
  }

  @GrpcMethod("StoriesService", "CreateChapter")
  createChapter(data: { storyId: number; title: string; content: string; order?: number }) {
    return this.chaptersService.createChapter(data);
  }

  @GrpcMethod("StoriesService", "UpdateChapter")
  updateChapter(data: { id: number; title?: string; content?: string }) {
    return this.chaptersService.updateChapter(data);
  }

  @GrpcMethod("StoriesService", "DeleteChapter")
  deleteChapter(data: { id: number }) {
    return this.chaptersService.deleteChapter(data.id);
  }

  @GrpcMethod("StoriesService", "DownloadChapter")
  downloadChapter(data: { chapterId: number; userId: number }) {
    return this.chapterDownloadService.prepareDownload(data.chapterId, data.userId);
  }

  @GrpcMethod("StoriesService", "GetGenres")
  getGenres() {
    return this.genresService.getGenres();
  }

  @GrpcMethod("StoriesService", "GetGenreLandingPage")
  getGenreLandingPage(data: { genreId: number }) {
    return this.discoveryService.getGenreLandingPage(data.genreId);
  }

  @GrpcMethod("StoriesService", "GetStoriesByGenre")
  getStoriesByGenre(data: { genreId: number; page?: number; limit?: number }) {
    return this.discoveryService.getStoriesByGenre(data.genreId, data.page ?? 1, data.limit ?? 10);
  }

  @GrpcMethod("StoriesService", "GetRankings")
  getRankings(data: { rankingType: string; genreId?: number; timeRange?: string; limit?: number }) {
    return this.discoveryService.getRankings({
      rankingType: (data.rankingType as any) || "monthly-votes",
      genreId: data.genreId,
      timeRange: (data.timeRange as any) ?? "monthly",
      limit: data.limit,
    });
  }

  @GrpcMethod("StoriesService", "GetEditorPicks")
  getEditorPicks(data: { genreId?: number; limit?: number }) {
    return this.discoveryService.getEditorPicks({ genreId: data.genreId, limit: data.limit });
  }

  @GrpcMethod("StoriesService", "GetStorefrontData")
  getStorefrontData(data: { userId?: number }) {
    return this.storefrontService.getStorefrontData({ userId: data.userId });
  }

  @GrpcMethod("StoriesService", "GetReadingProgress")
  getReadingProgress(data: { userId: number; storyId?: number; bookId?: number }) {
    const storyId = data.storyId ?? data.bookId;
    if (!storyId) {
      return {
        success: false,
        message: "storyId is required",
      };
    }
    return this.readingProgressService.getReadingProgress(data.userId, storyId);
  }

  @GrpcMethod("StoriesService", "UpdateReadingProgress")
  updateReadingProgress(data: { userId: number; storyId?: number; bookId?: number; chapterId?: number; progress?: number }) {
    const storyId = data.storyId ?? data.bookId;
    if (!storyId) {
      return {
        success: false,
        message: "storyId is required",
      };
    }
    return this.readingProgressService.updateReadingProgress({
      ...data,
      storyId,
    });
  }

  @GrpcMethod("StoriesService", "GetAuthorDashboard")
  getAuthorDashboard(data: { authorId: number; storyId?: number }) {
    return this.authorDashboardService.getAuthorDashboard({
      authorId: data.authorId,
      storyId: data.storyId,
    });
  }

  @GrpcMethod("StoriesService", "GetAuthorAnalytics")
  getAuthorAnalytics(data: { authorId: number; storyId?: number; timeRange?: string }) {
    return this.authorAnalyticsService.getAuthorAnalytics({
      authorId: data.authorId,
      storyId: data.storyId,
      timeRange: data.timeRange,
    });
  }

  @GrpcMethod("StoriesService", "GetAuthorRevenue")
  getAuthorRevenue(data: { authorId: number; storyId?: number; timeRange?: string }) {
    return this.authorAnalyticsService.getAuthorRevenue({
      authorId: data.authorId,
      storyId: data.storyId,
      timeRange: data.timeRange,
    });
  }

  @GrpcMethod("StoriesService", "GetAuthorEngagement")
  getAuthorEngagement(data: { authorId: number; storyId?: number }) {
    return this.authorAnalyticsService.getAuthorEngagement({
      authorId: data.authorId,
      storyId: data.storyId,
    });
  }

  @GrpcMethod("StoriesService", "GetReaderInsights")
  getReaderInsights(data: { authorId: number; storyId?: number }) {
    return this.authorAnalyticsService.getReaderInsights({
      authorId: data.authorId,
      storyId: data.storyId,
    });
  }

  @GrpcMethod("StoriesService", "CheckDrmStatus")
  checkDrmStatus(data: { chapterId: number; userId: number }) {
    return this.drmService.checkDrmStatus(data.chapterId, data.userId);
  }

  @GrpcMethod("StoriesService", "GetWatermarkedChapter")
  getWatermarkedChapter(data: { chapterId: number; userId: number }) {
    return this.drmService.getWatermarkedContent(data.chapterId, data.userId);
  }

  @GrpcMethod("StoriesService", "DetectWatermark")
  detectWatermark(data: { content: string }) {
    return this.drmService.detectWatermark(data.content);
  }

  @GrpcMethod("StoriesService", "SearchStories")
  searchStories(data: { query: string; page?: number; limit?: number; filters?: string[] }): Promise<SearchStoriesGrpcResponse> {
    return this.searchIntegrationService.searchStories(data);
  }

  @GrpcMethod("StoriesService", "CastPowerStone")
  castPowerStone(data: { userId: number; storyId: number }) {
    return this.votingService.castPowerStone(data.userId, data.storyId);
  }

  @GrpcMethod("StoriesService", "CastMonthlyVote")
  castMonthlyVote(data: { userId: number; storyId: number; votes: number }) {
    return this.votingService.castMonthlyVote(data.userId, data.storyId, data.votes);
  }

  @GrpcMethod("StoriesService", "GetUserVotes")
  getUserVotes(data: { userId: number }) {
    return this.votingService.getUserVotes(data.userId);
  }

}




