import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MeiliSearch, Index } from "meilisearch";
import { SearchQueryDto } from "./dto/search-query.dto";

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private readonly storyIndex = "stories";
  private readonly postIndex = "posts";
  private client!: MeiliSearch;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>("meilisearch.host") ?? "http://localhost:7700";
    const apiKey = this.configService.get<string>("meilisearch.apiKey") ?? "masterKey";

    this.client = new MeiliSearch({ host, apiKey });
    this.logger.log(`Connected to MeiliSearch at ${host}`);

    await Promise.all([
      this.ensureIndex(this.storyIndex, {
        primaryKey: "id",
        searchableAttributes: ["title", "author", "description", "content"],
        filterableAttributes: ["author", "genres"],
      }),
      this.ensureIndex(this.postIndex, {
        primaryKey: "id",
        searchableAttributes: ["content"],
        filterableAttributes: ["userId", "storyId", "groupId"],
      }),
    ]);
  }

  async searchStories(query: SearchQueryDto) {
    return this.searchIndex(this.storyIndex, query, (hit: any) => ({
      id: hit.id,
      title: hit.title,
      author: hit.author,
      description: hit.description,
      coverImage: hit.coverImage,
      score: hit._rankingScore ?? 0,
    }));
  }

  async searchPosts(query: SearchQueryDto) {
    return this.searchIndex(this.postIndex, query, (hit: any) => ({
      id: hit.id,
      content: hit.content,
      userId: hit.userId,
      storyId: hit.storyId,
      groupId: hit.groupId,
      createdAt: hit.createdAt,
      score: hit._rankingScore ?? 0,
    }));
  }

  async indexStory(payload: {
    id: number;
    title: string;
    author?: string;
    description?: string;
    content?: string;
    coverImage?: string;
    genres?: string[];
  }) {
    return this.addDocuments(this.storyIndex, [
      {
        id: payload.id,
        title: payload.title,
        author: payload.author ?? "",
        description: payload.description ?? "",
        content: payload.content ?? "",
        coverImage: payload.coverImage ?? "",
        genres: payload.genres ?? [],
      },
    ]);
  }

  async updateStoryIndex(payload: {
    id: number;
    title?: string;
    author?: string;
    description?: string;
    content?: string;
    coverImage?: string;
    genres?: string[];
  }) {
    return this.updateDocuments(this.storyIndex, [
      {
        id: payload.id,
        title: payload.title,
        author: payload.author,
        description: payload.description,
        content: payload.content,
        coverImage: payload.coverImage,
        genres: payload.genres,
      },
    ]);
  }

  async deleteStoryIndex(id: number) {
    return this.deleteDocument(this.storyIndex, id);
  }

  async indexPost(payload: {
    id: number;
    userId: number;
    content: string;
    storyId?: number;
    groupId?: number;
    createdAt?: string;
  }) {
    return this.addDocuments(this.postIndex, [
      {
        id: payload.id,
        userId: payload.userId,
        content: payload.content,
        storyId: payload.storyId ?? null,
        groupId: payload.groupId ?? null,
        createdAt: payload.createdAt ?? new Date().toISOString(),
      },
    ]);
  }

  async deletePostIndex(id: number) {
    return this.deleteDocument(this.postIndex, id);
  }

  private async searchIndex<T>(
    indexName: string,
    { query, page, limit, filters }: SearchQueryDto,
    mapper: (hit: any) => T
  ) {
    try {
      const index = this.index<Record<string, any>>(indexName);
      const result = await index.search(query, {
        limit,
        offset: (page - 1) * limit,
        filter: filters.length ? filters.join(" AND ") : undefined,
      });

      return {
        success: true,
        data: result.hits.map(mapper),
        total: result.estimatedTotalHits ?? 0,
        message: "Search completed successfully",
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to execute search";
      this.logger.error(`Search failed on index "${indexName}": ${errorMessage}`);
      return {
        success: false,
        data: [],
        total: 0,
        message: errorMessage,
      };
    }
  }

  private async addDocuments(indexName: string, documents: Record<string, any>[]) {
    try {
      const index = this.index<Record<string, any>>(indexName);
      await index.addDocuments(documents);
      return {
        success: true,
        message: `${indexName} documents indexed successfully`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to index documents in ${indexName}`;
      this.logger.error(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  private async updateDocuments(indexName: string, documents: Record<string, any>[]) {
    try {
      const index = this.index<Record<string, any>>(indexName);
      await index.updateDocuments(documents);
      return {
        success: true,
        message: `${indexName} documents updated successfully`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to update documents in ${indexName}`;
      this.logger.error(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  private async deleteDocument(indexName: string, id: number) {
    try {
      const index = this.index<Record<string, any>>(indexName);
      await index.deleteDocument(id);
      return {
        success: true,
        message: `Document ${id} deleted from ${indexName}`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to delete document ${id} from ${indexName}`;
      this.logger.error(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  private index<TRecord extends Record<string, any>>(indexName: string): Index<TRecord> {
    if (!this.client) {
      throw new Error("MeiliSearch client has not been initialized yet");
    }
    return this.client.index<TRecord>(indexName);
  }

  private async ensureIndex(
    name: string,
    options: {
      primaryKey: string;
      searchableAttributes?: string[];
      filterableAttributes?: string[];
    }
  ) {
    const { primaryKey, searchableAttributes, filterableAttributes } = options;

    try {
      await this.client.getIndex(name);
    } catch {
      this.logger.warn(`Index "${name}" does not exist. Creating...`);
      await this.client.createIndex(name, { primaryKey });
    }

    const index = this.client.index(name);

    if (searchableAttributes?.length) {
      await index.updateSearchableAttributes(searchableAttributes);
    }

    if (filterableAttributes?.length) {
      await index.updateFilterableAttributes(filterableAttributes);
    }
  }
}

