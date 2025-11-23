import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";
import { SEARCH_GRPC_CLIENT } from "./search.module";

interface SearchStoriesRequest {
  query: string;
  page?: number;
  limit?: number;
  filters?: string[];
}

interface SearchStoriesResponse {
  success: boolean;
  data: StoryResult[];
  total: number;
  message?: string;
}

interface StoryResult {
  id: number;
  title: string;
  author?: string;
  description?: string;
  coverImage?: string;
  score?: number;
}

interface SearchServiceClient {
  SearchStories(request: SearchStoriesRequest): import("rxjs").Observable<SearchStoriesResponse>;
  IndexStory(request: IndexStoryRequest): import("rxjs").Observable<OperationResponse>;
  UpdateStoryIndex(request: UpdateStoryIndexRequest): import("rxjs").Observable<OperationResponse>;
  DeleteStoryIndex(request: DeleteStoryIndexRequest): import("rxjs").Observable<OperationResponse>;
}

interface IndexStoryRequest {
  id: number;
  title: string;
  author?: string;
  description?: string;
  content?: string;
}

interface UpdateStoryIndexRequest {
  id: number;
  title?: string;
  author?: string;
  description?: string;
}

interface DeleteStoryIndexRequest {
  id: number;
}

interface OperationResponse {
  success: boolean;
  message?: string;
}

@Injectable()
export class SearchIntegrationService implements OnModuleInit {
  private readonly logger = new Logger(SearchIntegrationService.name);
  private searchClient: SearchServiceClient | null = null;

  constructor(@Inject(SEARCH_GRPC_CLIENT) private readonly grpcClient: ClientGrpc) {}

  onModuleInit() {
    this.searchClient = this.grpcClient.getService<SearchServiceClient>("SearchService");
  }

  async searchStories(params: SearchStoriesRequest) {
    if (!this.searchClient) {
      return {
        success: false,
        data: [],
        total: 0,
        message: "Search service unavailable",
      };
    }

    try {
      const response = await lastValueFrom(
        this.searchClient.SearchStories({
          query: params.query,
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          filters: params.filters ?? [],
        })
      );
      return response;
    } catch (error) {
      this.logger.error(`SearchStories failed for query "${params.query}"`, error instanceof Error ? error.stack : undefined);
      return {
        success: false,
        data: [],
        total: 0,
        message: error instanceof Error ? error.message : "Failed to search stories",
      };
    }
  }

  async indexStory(payload: IndexStoryRequest) {
    if (!this.searchClient) {
      return;
    }

    try {
      await lastValueFrom(
        this.searchClient.IndexStory({
          id: payload.id,
          title: payload.title,
          author: payload.author ?? "",
          description: payload.description ?? "",
          content: payload.content ?? payload.description ?? "",
        })
      );
    } catch (error) {
      this.logger.warn(`IndexStory failed for story ${payload.id}: ${error instanceof Error ? error.message : error}`);
    }
  }

  async updateStoryIndex(payload: UpdateStoryIndexRequest) {
    if (!this.searchClient) {
      return;
    }

    try {
      await lastValueFrom(
        this.searchClient.UpdateStoryIndex({
          id: payload.id,
          title: payload.title ?? "",
          author: payload.author ?? "",
          description: payload.description ?? "",
        })
      );
    } catch (error) {
      this.logger.warn(`UpdateStoryIndex failed for story ${payload.id}: ${error instanceof Error ? error.message : error}`);
    }
  }

  async deleteStoryIndex(storyId: number) {
    if (!this.searchClient) {
      return;
    }

    try {
      await lastValueFrom(
        this.searchClient.DeleteStoryIndex({
          id: storyId,
        })
      );
    } catch (error) {
      this.logger.warn(`DeleteStoryIndex failed for story ${storyId}: ${error instanceof Error ? error.message : error}`);
    }
  }
}


