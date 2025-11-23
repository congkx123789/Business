import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash } from "crypto";

export interface PresignedUrlPayload {
  key: string;
  url: string;
}

@Injectable()
export class S3StorageService {
  private readonly bucket: string;
  private readonly publicBaseUrl: string;
  private readonly prefix: string;

  constructor(configService: ConfigService) {
    this.bucket = configService.get<string>("storage.bucket", "ai-service-tts");
    this.publicBaseUrl = configService.get<string>("storage.publicBaseUrl", "https://cdn.local/ai");
    this.prefix = configService.get<string>("storage.prefix", "tts");
  }

  createObjectKey(seed: string, extension: string): string {
    const hash = createHash("sha1").update(seed).digest("hex");
    return `${this.prefix}/${hash}.${extension}`;
  }

  async createPresignedUrl(seed: string, extension: string): Promise<PresignedUrlPayload> {
    const key = this.createObjectKey(seed, extension);
    const url = `${this.publicBaseUrl.replace(/\/$/, "")}/${key}`;
    // NOTE: Real implementation would request a presigned URL from AWS SDK.
    return { key: `${this.bucket}/${key}`, url };
  }
}


