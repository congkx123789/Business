import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { StorageService } from "../storage/storage.service";

@Injectable()
export class ChapterDownloadService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly storageService: StorageService
  ) {}

  async prepareDownload(chapterId: number, userId: number) {
    try {
      const result = (await this.databaseService.createData<any[]>(11, "spChapters_GetDownloadInfo", [
        ["ChapterId", chapterId],
        ["UserId", userId],
      ])) as any[];
      const chapter = result?.[0];

      if (!chapter) {
        return {
          success: false,
          message: "Chapter not found",
        };
      }

      if (!chapter.hasAccess) {
        return {
          success: false,
          message: "Chapter is locked behind paywall",
        };
      }

      const download = await this.storageService.createDownloadUrl(chapter.contentKey || chapter.contentUrl);

      return {
        success: true,
        data: {
          chapterId,
          storyId: chapter.bookId || chapter.storyId,
          title: chapter.title,
          downloadUrl: download.url,
          expiresAt: download.expiresAt,
        },
        message: "Download ready",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to prepare download";
      if (message.includes("spChapters_GetDownloadInfo")) {
        return {
          success: false,
          message: "Download metadata procedure missing",
        };
      }

      return {
        success: false,
        message,
      };
    }
  }
}


