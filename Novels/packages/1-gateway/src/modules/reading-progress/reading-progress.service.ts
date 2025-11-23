import { Inject, Injectable } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { GrpcResponse } from "../../common/types/grpc.types";
import { getGrpcResponse } from "../../common/utils/grpc.util";
import { getErrorMessage } from "../../common/utils/error.util";

interface StoriesServiceClient {
  getReadingProgress(data: {
    userId: number;
    storyId?: number;
    bookId?: number;
  }): Observable<GrpcResponse<any>>;
  updateReadingProgress(data: {
    userId: number;
    storyId?: number;
    bookId?: number;
    chapterId?: number;
    progress?: number;
  }): Observable<GrpcResponse<any>>;
}

@Injectable()
export class ReadingProgressService {
  private readonly storiesService: StoriesServiceClient;

  constructor(@Inject("STORIES_SERVICE") private readonly storiesClient: ClientGrpc) {
    this.storiesService = this.storiesClient.getService<StoriesServiceClient>("StoriesService");
  }

  async getProgress(userId: number, bookId: number) {
    try {
      const result = await getGrpcResponse(
        this.storiesService.getReadingProgress({ userId, storyId: bookId, bookId })
      );

      if (!result.success) {
        throw new Error(result.message || "Failed to get reading progress");
      }

      return result.data ?? null;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to get reading progress"));
    }
  }

  async updateProgress(
    userId: number,
    bookId: number,
    dto: { chapterId?: number; progress?: number }
  ) {
    try {
      const result = await getGrpcResponse(
        this.storiesService.updateReadingProgress({
          userId,
          storyId: bookId,
          bookId,
          chapterId: dto.chapterId,
          progress: dto.progress,
        })
      );

      if (!result.success) {
        throw new Error(result.message || "Failed to update reading progress");
      }

      return result.data ?? null;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to update reading progress"));
    }
  }
}
