import { Injectable, Inject } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { getGrpcResponse } from "../../common/utils/grpc.util";
import { GrpcResponse } from "../../common/types/grpc.types";

interface StoriesServiceClient {
  getStory(data: { id: string; userId: number }): Observable<GrpcResponse<any>>;
  getStories(data: { userId: number }): Observable<GrpcResponse<any[]>>;
}

/**
 * Stories Service
 * Aggregates data from stories-service via gRPC
 * NO business logic - just routing (Rule #4)
 */
@Injectable()
export class StoriesService {
  private readonly storiesService: StoriesServiceClient;

  constructor(@Inject("STORIES_SERVICE") private readonly storiesClient: ClientGrpc) {
    this.storiesService = this.storiesClient.getService<StoriesServiceClient>("StoriesService");
  }

  async getStory(id: string, userId: number) {
    const result = await getGrpcResponse(this.storiesService.getStory({ id, userId }));
    if (!result.success || !result.data) {
      throw new Error(result.message || "Failed to get story");
    }
    return result.data;
  }

  async getStories(userId: number) {
    const result = await getGrpcResponse(this.storiesService.getStories({ userId }));
    if (!result.success || !result.data) {
      throw new Error(result.message || "Failed to get stories");
    }
    return result.data;
  }
}

