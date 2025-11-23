import { Injectable } from "@nestjs/common";

@Injectable()
export class WatermarkingService {
  generateWatermarkPayload(content: string, userId: number) {
    if (!content) {
      return content;
    }

    const suffix = `<!-- wm:${userId}:${Date.now()} -->`;
    return `${content}\n${suffix}`;
  }

  detectWatermark(content: string) {
    const match = content?.match(/wm:(\d+):(\d+)/);
    if (!match) {
      return null;
    }

    return {
      userId: Number(match[1]),
      timestamp: new Date(Number(match[2])),
    };
  }
}


