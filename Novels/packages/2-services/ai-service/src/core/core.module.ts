import { Global, Module } from "@nestjs/common";
import { GenerativeAIProvider } from "./generative-ai.provider";
import { RedisCacheService } from "../cache/redis-cache.service";
import { S3StorageService } from "../storage/s3-storage.service";

@Global()
@Module({
  providers: [GenerativeAIProvider, RedisCacheService, S3StorageService],
  exports: [GenerativeAIProvider, RedisCacheService, S3StorageService],
})
export class CoreModule {}


