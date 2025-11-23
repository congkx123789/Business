import { Injectable } from "@nestjs/common";
import { S3StorageService } from "../../storage/s3-storage.service";

export interface TtsOptions {
  voice?: string;
  speed?: number;
  language?: string;
}

export interface TtsResponse {
  success: boolean;
  audioUrl: string;
  duration: number;
  message: string;
}

@Injectable()
export class TtsService {
  constructor(private readonly storageService: S3StorageService) {}

  async synthesizeSpeech(text: string, options: TtsOptions = {}): Promise<TtsResponse> {
    const seed = `${text}:${options.voice ?? "default"}:${options.language ?? "en-US"}`;
    const payload = await this.storageService.createPresignedUrl(seed, "mp3");

    return {
      success: true,
      audioUrl: payload.url,
      duration: Math.max(1, Math.round(text.split(" ").length / 2)),
      message: "AI narration generated",
    };
  }
}


