import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { ConfigType } from "@nestjs/config";
import { lastValueFrom } from "rxjs";
import { timeout } from "rxjs/operators";
import { STORIES_GRPC_CLIENT } from "./stories-client.module";
import { servicesConfig } from "../config/configuration";

interface GetChapterRequest {
  id: string;
}

interface ChapterResponse {
  id: string;
  content?: string;
  title?: string;
}

interface StoriesServiceClient {
  GetChapter(data: GetChapterRequest): import("rxjs").Observable<ChapterResponse>;
}

@Injectable()
export class StoriesClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StoriesClientService.name);
  private storiesService: StoriesServiceClient | null = null;
  private readonly retryAttempts: number;
  private readonly retryDelayMs: number;
  private readonly retryBackoffMultiplier: number;
  private readonly rpcTimeoutMs: number;

  constructor(
    @Inject(STORIES_GRPC_CLIENT) private readonly storiesGrpcClient: ClientGrpc,
    @Inject(servicesConfig.KEY) private readonly servicesOptions: ConfigType<typeof servicesConfig>
  ) {
    this.retryAttempts = servicesOptions.storiesRetryAttempts;
    this.retryDelayMs = servicesOptions.storiesRetryDelayMs;
    this.retryBackoffMultiplier = servicesOptions.storiesRetryBackoffMultiplier;
    this.rpcTimeoutMs = servicesOptions.storiesRpcTimeoutMs;
  }

  onModuleInit() {
    this.storiesService = this.storiesGrpcClient.getService<StoriesServiceClient>("StoriesService");
  }

  onModuleDestroy() {
    this.storiesService = null;
  }

  async getChapterContent(chapterId: string): Promise<string | null> {
    if (!this.storiesService) {
      this.logger.warn("Stories gRPC client is not initialized yet.");
      return null;
    }

    let attempt = 1;
    let currentDelay = this.retryDelayMs;

    while (attempt <= this.retryAttempts) {
      try {
        const observable = this.storiesService.GetChapter({ id: chapterId }).pipe(timeout(this.rpcTimeoutMs));
        const response = await lastValueFrom(observable);
        return response?.content ?? null;
      } catch (error) {
        const formattedError = this.formatError(error);
        this.logger.warn(
          `Failed to fetch chapter ${chapterId} (attempt ${attempt}/${this.retryAttempts}, timeout ${this.rpcTimeoutMs}ms): ${formattedError}`
        );

        if (attempt >= this.retryAttempts) {
          this.logger.error(`Exhausted retries fetching chapter ${chapterId}.`, error instanceof Error ? error.stack : undefined);
          break;
        }

        await this.delay(currentDelay);
        currentDelay *= this.retryBackoffMultiplier;
      }

      attempt += 1;
    }

    return null;
  }

  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    return "Unknown error";
  }
}


