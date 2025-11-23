import { Resolver, Query, Args, Int } from "@nestjs/graphql";
import { Inject } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import type { Story, Chapter } from "7-shared";
import { GrpcPaginatedResponse, GrpcResponse } from "../../common/types/grpc.types";
import { getGrpcResponse } from "../../common/utils/grpc.util";
import { getErrorMessage } from "../../common/utils/error.util";

interface StoriesServiceClient {
  getBookById(data: { id: number }): Observable<GrpcResponse<Story>>;
  listBooks(data: { page: number; limit: number }): Observable<GrpcPaginatedResponse<Story[]>>;
  getChapterById(data: { id: number }): Observable<GrpcResponse<Chapter>>;
}

@Resolver()
export class StoriesResolver {
  private readonly storiesService: StoriesServiceClient;

  constructor(@Inject("STORIES_SERVICE") private readonly storiesClient: ClientGrpc) {
    this.storiesService = this.storiesClient.getService<StoriesServiceClient>("StoriesService");
  }

  @Query(() => String, { name: "story" })
  async getStory(@Args("id", { type: () => Int }) id: number) {
    try {
      const result = await getGrpcResponse(this.storiesService.getBookById({ id }));

      if (!result.success || !result.data) {
        throw new Error(result.message || "Failed to get story");
      }

      return JSON.stringify({
        id: result.data.id,
        title: result.data.title,
        author: result.data.author,
        description: result.data.description,
      });
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to get story"));
    }
  }

  @Query(() => String, { name: "stories" })
  async getStories(
    @Args("page", { type: () => Int, nullable: true }) page?: number,
    @Args("limit", { type: () => Int, nullable: true }) limit?: number
  ) {
    try {
      const result = await getGrpcResponse(
        this.storiesService.listBooks({ page: page || 1, limit: limit || 10 })
      );

      if (!result.success || !result.data) {
        throw new Error(result.message || "Failed to list stories");
      }

      const stories = Array.isArray(result.data) ? result.data : [];
      return JSON.stringify(
        stories.map((story: any) => ({
          id: story.id,
          title: story.title,
          author: story.author,
          coverImage: story.coverImage,
        }))
      );
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to list stories"));
    }
  }

  @Query(() => String, { name: "chapter" })
  async getChapter(@Args("id", { type: () => Int }) id: number) {
    try {
      const result = await getGrpcResponse(this.storiesService.getChapterById({ id }));

      if (!result.success || !result.data) {
        throw new Error(result.message || "Failed to get chapter");
      }

      return JSON.stringify({
        id: result.data.id,
        storyId: result.data.storyId,
        title: result.data.title,
        content: result.data.content,
        chapterNumber: result.data.chapterNumber,
      });
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to get chapter"));
    }
  }
}
