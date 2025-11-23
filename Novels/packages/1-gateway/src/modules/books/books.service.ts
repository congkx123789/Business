import { Inject, Injectable } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { PaginationQueryDto } from "../../common/dto/pagination-query.dto";
import type { Story } from "7-shared";
import { GrpcPaginatedResponse, GrpcResponse } from "../../common/types/grpc.types";
import { getGrpcResponse } from "../../common/utils/grpc.util";
import { getErrorMessage } from "../../common/utils/error.util";

interface StoriesServiceClient {
  getBookById(data: { id: number }): Observable<GrpcResponse<Story>>;
  listBooks(data: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Observable<GrpcPaginatedResponse<Story[]>>;
}

@Injectable()
export class BooksService {
  private storiesService: StoriesServiceClient;

  constructor(@Inject("STORIES_SERVICE") private readonly storiesClient: ClientGrpc) {
    this.storiesService = this.storiesClient.getService<StoriesServiceClient>("StoriesService");
  }

  async findAll(query: PaginationQueryDto) {
    try {
      const result = await getGrpcResponse(
        this.storiesService.listBooks({
          page: query.page,
          limit: query.limit,
        })
      );

      if (!result.success) {
        throw new Error(result.message || "Failed to list books");
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
      throw new Error(getErrorMessage(error, "Failed to list books"));
    }
  }

  async findOne(id: number) {
    try {
      const result = await getGrpcResponse(this.storiesService.getBookById({ id }));

      if (!result.success) {
        throw new Error(result.message || "Failed to get book");
      }

      return result.data ?? null;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to get book"));
    }
  }
}
