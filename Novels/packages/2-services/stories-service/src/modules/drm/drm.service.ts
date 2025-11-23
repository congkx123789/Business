import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { CopyProtectionService } from "./copy-protection.service";
import { WatermarkingService } from "./watermarking.service";

@Injectable()
export class DrmService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly copyProtectionService: CopyProtectionService,
    private readonly watermarkingService: WatermarkingService
  ) {}

  async checkDrmStatus(chapterId: number, userId: number) {
    const result = (await this.databaseService.createData<any[]>(11, "spDrm_CheckChapter", [
      ["ChapterId", chapterId],
      ["UserId", userId],
    ])) as any[];
    const record = result?.[0];

    if (!record) {
      return {
        success: false,
        message: "Chapter not found",
      };
    }

    return {
      success: true,
      data: {
        hasAccess: !!record.hasAccess,
        directives: this.copyProtectionService.buildClientDirectives(record.isPaid === true),
      },
    };
  }

  async getWatermarkedContent(chapterId: number, userId: number) {
    const result = (await this.databaseService.createData<any[]>(11, "spChapters_GetContent", [
      ["ChapterId", chapterId],
    ])) as any[];
    const record = result?.[0];

    if (!record) {
      return {
        success: false,
        message: "Chapter not found",
      };
    }

    const content = this.watermarkingService.generateWatermarkPayload(record.content, userId);
    return {
      success: true,
      data: {
        ...record,
        content,
      },
    };
  }

  detectWatermark(content: string) {
    const watermark = this.watermarkingService.detectWatermark(content);
    if (!watermark) {
      return {
        success: false,
        message: "No watermark detected",
      };
    }

    return {
      success: true,
      data: watermark,
    };
  }
}


