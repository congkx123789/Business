import { Injectable } from "@nestjs/common";
import { S3StorageService } from "../../storage/s3-storage.service";

@Injectable()
export class PronunciationService {
  constructor(private readonly storageService: S3StorageService) {}

  async getPronunciation(word: string, language: string) {
    const payload = await this.storageService.createPresignedUrl(`${language}:${word}`, "mp3");
    return {
      success: true,
      audioUrl: payload.url,
      message: "Pronunciation URL generated",
    };
  }
}


