import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { StoryEventsService } from "../../common/queue/story-events.service";

@Injectable()
export class ChaptersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly storyEventsService: StoryEventsService
  ) {}

  async getChapterById(id: number) {
    try {
      const result = await this.databaseService.createData<any[]>(
        11,
        "spChapters_GetById",
        [["ChapterId", id]]
      );
      return {
        success: true,
        data: result[0] || null,
        message: "Chapter retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to get chapter",
      };
    }
  }

  async listChaptersByStory(storyId: number, page: number = 1, limit: number = 10) {
    try {
      const result = await this.databaseService.createData<any[]>(
        11,
        "spChapters_ListByBook",
        [
          ["BookId", storyId],
          ["Page", page],
          ["Limit", limit],
        ]
      );
      return {
        success: true,
        data: result || [],
        total: Array.isArray(result) ? result.length : 0,
        message: "Chapters retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        total: 0,
        message: error instanceof Error ? error.message : "Failed to list chapters",
      };
    }
  }

  async createChapter(data: { storyId: number; title: string; content: string; order?: number }) {
    try {
      const result = await this.databaseService.createData<any[]>(
        11,
        "spChapters_Create",
        [
          ["BookId", data.storyId],
          ["Title", data.title],
          ["Content", data.content],
          ["Order", data.order || 0],
        ]
      );

      const chapter = result[0];
      if (chapter) {
        // Emit event to Event Bus (Rule #2 - Async communication)
        const storyId = chapter.bookId ?? chapter.storyId;
        await this.storyEventsService.emitChapterCreated({
          id: chapter.id,
          storyId,
          title: chapter.title,
          order: chapter.order,
        });
      }

      return {
        success: true,
        data: chapter || null,
        message: "Chapter created successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to create chapter",
      };
    }
  }

  async updateChapter(data: { id: number; title?: string; content?: string }) {
    try {
      const result = await this.databaseService.createData<any[]>(
        11,
        "spChapters_Update",
        [
          ["ChapterId", data.id],
          ["Title", data.title || ""],
          ["Content", data.content || ""],
        ]
      );

      const chapter = result[0];
      if (chapter) {
        // Emit event to Event Bus (Rule #2 - Async communication)
        const storyId = chapter.bookId ?? chapter.storyId;
        await this.storyEventsService.emitChapterUpdated({
          id: chapter.id,
          storyId,
          title: chapter.title,
        });
      }

      return {
        success: true,
        data: chapter || null,
        message: "Chapter updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to update chapter",
      };
    }
  }

  async deleteChapter(id: number) {
    try {
      await this.databaseService.createData<boolean>(
        12,
        "spChapters_Delete",
        [["ChapterId", id]]
      );
      return {
        success: true,
        message: "Chapter deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete chapter",
      };
    }
  }
}

