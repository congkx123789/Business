import { Inject, Injectable } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { GrpcPaginatedResponse, GrpcResponse } from "../../common/types/grpc.types";
import { getGrpcResponse } from "../../common/utils/grpc.util";
import { getErrorMessage } from "../../common/utils/error.util";

interface CommentsServiceClient {
  getBookmarksByUser(data: {
    userId: number;
    page?: number;
    limit?: number;
  }): Observable<GrpcPaginatedResponse<any[]>>;
  createBookmark(data: {
    userId: number;
    bookId: number;
    chapterId?: number;
  }): Observable<GrpcResponse<any>>;
  deleteBookmark(data: { id: number }): Observable<GrpcResponse<boolean>>;
}

@Injectable()
export class BookmarksService {
  private readonly commentsService: CommentsServiceClient;

  constructor(@Inject("COMMENTS_SERVICE") private readonly commentsClient: ClientGrpc) {
    this.commentsService = this.commentsClient.getService<CommentsServiceClient>("CommentsService");
  }

  async getUserBookmarks(userId: number, page: number = 1, limit: number = 10) {
    try {
      const result = await getGrpcResponse(
        this.commentsService.getBookmarksByUser({ userId, page, limit })
      );

      if (!result.success) {
        throw new Error(result.message || "Failed to get bookmarks");
      }

      return {
        data: result.data ?? [],
        total: result.total || 0,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to get bookmarks"));
    }
  }

  async createBookmark(userId: number, bookId: number, chapterId?: number) {
    try {
      const result = await getGrpcResponse(
        this.commentsService.createBookmark({ userId, bookId, chapterId })
      );

      if (!result.success) {
        throw new Error(result.message || "Failed to create bookmark");
      }

      return result.data ?? null;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to create bookmark"));
    }
  }

  async deleteBookmark(id: number) {
    try {
      const result = await getGrpcResponse(this.commentsService.deleteBookmark({ id }));

      if (!result.success) {
        throw new Error(result.message || "Failed to delete bookmark");
      }

      return { success: true };
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to delete bookmark"));
    }
  }
}
