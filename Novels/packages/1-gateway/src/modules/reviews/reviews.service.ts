import { Inject, Injectable } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { GrpcPaginatedResponse, GrpcResponse } from "../../common/types/grpc.types";
import { getGrpcResponse } from "../../common/utils/grpc.util";
import { getErrorMessage } from "../../common/utils/error.util";

interface CommentsServiceClient {
  getReviewsByBook(data: {
    bookId: number;
    page?: number;
    limit?: number;
  }): Observable<GrpcPaginatedResponse<any[]>>;
  createReview(data: {
    bookId: number;
    userId: number;
    rating: number;
    content: string;
  }): Observable<GrpcResponse<any>>;
  updateReview(data: {
    id: number;
    rating?: number;
    content?: string;
  }): Observable<GrpcResponse<any>>;
  deleteReview(data: { id: number }): Observable<GrpcResponse<boolean>>;
}

@Injectable()
export class ReviewsService {
  private readonly commentsService: CommentsServiceClient;

  constructor(@Inject("COMMENTS_SERVICE") private readonly commentsClient: ClientGrpc) {
    this.commentsService = this.commentsClient.getService<CommentsServiceClient>("CommentsService");
  }

  async getBookReviews(bookId: number, page: number = 1, limit: number = 10) {
    try {
      const result = await getGrpcResponse(
        this.commentsService.getReviewsByBook({ bookId, page, limit })
      );

      if (!result.success) {
        throw new Error(result.message || "Failed to get reviews");
      }

      return {
        data: result.data ?? [],
        total: result.total || 0,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to get reviews"));
    }
  }

  async createReview(
    userId: number,
    bookId: number,
    dto: { rating: number; content: string }
  ) {
    try {
      const result = await getGrpcResponse(
        this.commentsService.createReview({
          userId,
          bookId,
          rating: dto.rating,
          content: dto.content,
        })
      );

      if (!result.success) {
        throw new Error(result.message || "Failed to create review");
      }

      return result.data ?? null;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to create review"));
    }
  }

  async updateReview(id: number, dto: { rating?: number; content?: string }) {
    try {
      const result = await getGrpcResponse(
        this.commentsService.updateReview({
          id,
          rating: dto.rating,
          content: dto.content,
        })
      );

      if (!result.success) {
        throw new Error(result.message || "Failed to update review");
      }

      return result.data ?? null;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to update review"));
    }
  }

  async deleteReview(id: number) {
    try {
      const result = await getGrpcResponse(this.commentsService.deleteReview({ id }));

      if (!result.success) {
        throw new Error(result.message || "Failed to delete review");
      }

      return { success: true };
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to delete review"));
    }
  }
}
