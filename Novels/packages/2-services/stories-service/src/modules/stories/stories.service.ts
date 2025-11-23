import { Inject, Injectable, Logger } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { DatabaseService, StoredProcedureParamList } from "../../common/database/database.service";
import { StoryEventsService } from "../../common/queue/story-events.service";
import { SearchIntegrationService } from "../search/search.service";

type ListStoriesOptions = {
  page?: number;
  limit?: number;
  genreSlug?: string;
  search?: string;
};

type CreateStoryPayload = {
  title: string;
  author?: string;
  description?: string;
  coverImage?: string;
  categoryId?: number;
};

type UpdateStoryPayload = {
  id: number;
  title?: string;
  author?: string;
  description?: string;
  coverImage?: string;
  categoryId?: number;
};

type UpsertStoryPayload = CreateStoryPayload | UpdateStoryPayload;

@Injectable()
export class StoriesService {
  private readonly logger = new Logger(StoriesService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly storyEventsService: StoryEventsService,
    private readonly searchIntegrationService: SearchIntegrationService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  async getStoryById(id: number) {
    const cacheKey = `story:${id}`;

    try {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: "Story retrieved successfully (cached)",
        };
      }

      const story = await this.executeRecordset("spStories_GetById", [["StoryId", id]]);

      if (story) {
        await this.cacheManager.set(cacheKey, story, 300);
      }

      return {
        success: true,
        data: story ?? null,
        message: "Story retrieved successfully",
      };
    } catch (error) {
      this.logger.error(`Failed to get story ${id}`, error instanceof Error ? error.stack : undefined);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to get story",
      };
    }
  }

  async listStories(options: ListStoriesOptions = {}) {
    const { page = 1, limit = 10, genreSlug = "", search = "" } = options;

    try {
      const stories = await this.executeRecordset("spStories_List", [
        ["Page", page],
        ["Limit", limit],
        ["GenreSlug", genreSlug],
        ["Search", search],
      ]);

      return {
        success: true,
        data: stories ?? [],
        total: Array.isArray(stories) ? stories.length : 0,
        message: "Stories retrieved successfully",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to list stories";

      if (this.isMissingStoredProcedureError(message, "spStories_List")) {
        this.logger.warn("spStories_List not found - returning empty list");
        return {
          success: true,
          data: [],
          total: 0,
          message: "Stories retrieved successfully (empty - database not initialized)",
        };
      }

      return {
        success: false,
        data: [],
        total: 0,
        message,
      };
    }
  }

  async upsertStory(payload: UpsertStoryPayload) {
    const isUpdate = "id" in payload && typeof payload.id === "number";
    const procedure = isUpdate ? "spStories_Update" : "spStories_Create";
    const params: StoredProcedureParamList = [
      ["StoryId", isUpdate ? payload.id : 0],
      ["Title", isUpdate ? payload.title ?? "" : payload.title],
      ["Author", payload.author || ""],
      ["Description", payload.description || ""],
      ["CoverImage", payload.coverImage || ""],
      ["CategoryId", payload.categoryId || 0],
    ];

    try {
      const records = await this.executeRecordset(procedure, params);
      const story = Array.isArray(records) ? records[0] : undefined;

      if (story) {
        if (isUpdate) {
          await this.storyEventsService.emitStoryUpdated({
            id: story.id,
            title: story.title,
            author: story.author,
            description: story.description,
          });
        } else {
          await this.storyEventsService.emitStoryCreated({
            id: story.id,
            title: story.title,
            author: story.author,
            description: story.description,
          });
        }
      }

      if (isUpdate && payload.id) {
        await this.cacheManager.del(`story:${payload.id}`);
      }

      return {
        success: true,
        data: story ?? null,
        message: isUpdate ? "Story updated successfully" : "Story created successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to save story",
      };
    }
  }

  async deleteStory(id: number) {
    try {
      await this.databaseService.createData<boolean>(12, "spStories_Delete", [["StoryId", id]]);
      await this.cacheManager.del(`story:${id}`);
      await this.searchIntegrationService.deleteStoryIndex(id);
      return {
        success: true,
        message: "Story deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete story",
      };
    }
  }

  async getStoriesByGenre(genreId: number, page = 1, limit = 10) {
    try {
      const stories = await this.executeRecordset("spStories_GetByGenre", [
        ["GenreId", genreId],
        ["Page", page],
        ["Limit", limit],
      ]);

      return {
        success: true,
        data: stories ?? [],
        total: Array.isArray(stories) ? stories.length : 0,
        message: "Stories by genre retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        total: 0,
        message: error instanceof Error ? error.message : "Failed to get stories by genre",
      };
    }
  }

  private async executeRecordset<T = any>(procedure: string, params: StoredProcedureParamList): Promise<T[]> {
    const result = (await this.databaseService.createData<T[]>(11, procedure, params)) as unknown;
    if (Array.isArray(result)) {
      return result as T[];
    }
    return [];
  }

  private isMissingStoredProcedureError(message: string, procedure: string) {
    return message.includes("Could not find stored procedure") || message.includes(procedure);
  }
}


