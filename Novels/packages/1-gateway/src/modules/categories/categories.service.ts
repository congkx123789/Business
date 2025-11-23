import { Inject, Injectable } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { GrpcResponse } from "../../common/types/grpc.types";
import { getGrpcResponse } from "../../common/utils/grpc.util";
import { getErrorMessage } from "../../common/utils/error.util";

interface StoriesServiceClient {
  getCategories(data: Record<string, never>): Observable<GrpcResponse<any[]>>;
}

@Injectable()
export class CategoriesService {
  private readonly storiesService: StoriesServiceClient;

  constructor(@Inject("STORIES_SERVICE") private readonly storiesClient: ClientGrpc) {
    this.storiesService = this.storiesClient.getService<StoriesServiceClient>("StoriesService");
  }

  async findAll() {
    try {
      const result = await getGrpcResponse(this.storiesService.getCategories({}));

      if (!result.success) {
        throw new Error(result.message || "Failed to get categories");
      }

      return result.data ?? [];
    } catch (error) {
      throw new Error(getErrorMessage(error, "Failed to get categories"));
    }
  }
}
