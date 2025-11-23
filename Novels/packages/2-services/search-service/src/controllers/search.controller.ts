import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { SearchService } from "../modules/search/search.service";
import { SearchQueryDto } from "../modules/search/dto/search-query.dto";

type IndexStoryRequest = {
  id: number;
  title: string;
  author?: string;
  description?: string;
  content?: string;
};

type UpdateStoryIndexRequest = {
  id: number;
  title?: string;
  author?: string;
  description?: string;
};

type DeleteStoryIndexRequest = { id: number };

type IndexPostRequest = {
  id: number;
  userId: number;
  content: string;
  storyId?: number;
  groupId?: number;
  createdAt?: string;
};

type DeletePostRequest = { id: number };

@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @GrpcMethod("SearchService", "SearchStories")
  async searchStories(payload: SearchQueryDto) {
    return this.searchService.searchStories(payload);
  }

  @GrpcMethod("SearchService", "SearchPosts")
  async searchPosts(payload: SearchQueryDto) {
    return this.searchService.searchPosts(payload);
  }

  @GrpcMethod("SearchService", "IndexStory")
  async indexStory(payload: IndexStoryRequest) {
    return this.searchService.indexStory(payload);
  }

  @GrpcMethod("SearchService", "UpdateStoryIndex")
  async updateStoryIndex(payload: UpdateStoryIndexRequest) {
    return this.searchService.updateStoryIndex(payload);
  }

  @GrpcMethod("SearchService", "DeleteStoryIndex")
  async deleteStoryIndex(payload: DeleteStoryIndexRequest) {
    return this.searchService.deleteStoryIndex(payload.id);
  }

  @GrpcMethod("SearchService", "IndexPost")
  async indexPost(payload: IndexPostRequest) {
    return this.searchService.indexPost(payload);
  }

  @GrpcMethod("SearchService", "DeletePostIndex")
  async deletePostIndex(payload: DeletePostRequest) {
    return this.searchService.deletePostIndex(payload.id);
  }
}


