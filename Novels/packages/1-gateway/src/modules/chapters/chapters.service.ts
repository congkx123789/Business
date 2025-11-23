import { Inject, Injectable } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import type { Chapter } from "7-shared";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import { GrpcPaginatedResponse, GrpcResponse } from "../../common/types/grpc.types";
import { getGrpcResponse } from "../../common/utils/grpc.util";
import { getErrorMessage } from "../../common/utils/error.util";

interface StoriesServiceClient {
  getChapterById(data: { id: number }): Observable<GrpcResponse<Chapter>>;
  listChaptersByBook(data: {
    bookId: number;
    page?: number;
    limit?: number;
  }): Observable<GrpcPaginatedResponse<Chapter[]>>;
}

@Injectable()
export class ChaptersService {
  private readonly storiesService: StoriesServiceClient;

  constructor(@Inject("STORIES_SERVICE") private readonly storiesClient: ClientGrpc) {
    this.storiesService = this.storiesClient.getService<StoriesServiceClient>("StoriesService");
  }

  async findAll(bookId: number, query: PaginationQueryDto) {
    try {
      const result = await getGrpcResponse(
        this.storiesService.listChaptersByBook({
          bookId,
          page: query.page,
          limit: query.limit,
        })
      );

      if (!result.success) {
        throw new Error(result.message || "Failed to list chapters");
      }

      return {
        data: result.data ?? [],
        pagination: {
          page: query.page || 1,
          limit: query.limit || 10,
          total: result.total || 0,
        },
      };
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to list chapters"));
    }
  }

  async findOne(id: number) {
    try {
      const result = await getGrpcResponse(this.storiesService.getChapterById({ id }));

      if (!result.success) {
        throw new Error(result.message || "Failed to get chapter");
      }

      return result.data ?? null;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to get chapter"));
    }
  }
}
