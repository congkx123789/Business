import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

@Injectable()
export class ReadingProgressService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getReadingProgress(userId: number, storyId: number) {
    try {
      const result = await this.databaseService.createData<any[]>(
        11,
        "spReadingProgress_Get",
        [
          ["UserId", userId],
          ["BookId", storyId],
        ]
      );
      return {
        success: true,
        data: result[0] || null,
        message: "Reading progress retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to get reading progress",
      };
    }
  }

  async updateReadingProgress(data: { userId: number; storyId: number; chapterId?: number; progress?: number }) {
    try {
      const result = await this.databaseService.createData<any[]>(
        11,
        "spReadingProgress_Update",
        [
          ["UserId", data.userId],
          ["BookId", data.storyId],
          ["ChapterId", data.chapterId || 0],
          ["Progress", data.progress || 0],
        ]
      );
      return {
        success: true,
        data: result[0] || null,
        message: "Reading progress updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to update reading progress",
      };
    }
  }
}

