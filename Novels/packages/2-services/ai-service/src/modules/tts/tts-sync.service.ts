import { Injectable } from "@nestjs/common";

type SyncMode = "word-by-word" | "sentence-by-sentence";

@Injectable()
export class TtsSyncService {
  generateSyncMap(text: string, mode: SyncMode = "sentence-by-sentence") {
    const segments = mode === "word-by-word" ? text.split(/\s+/) : text.split(/(?<=[.!?])/);
    const syncPoints = segments
      .map((segment, index) => ({
        index,
        content: segment.trim(),
        timestamp: index * (mode === "word-by-word" ? 0.5 : 2), // mocked timing
      }))
      .filter((segment) => Boolean(segment.content));

    return {
      success: true,
      syncMode: mode,
      syncPoints,
      message: "Generated sync metadata",
    };
  }
}


