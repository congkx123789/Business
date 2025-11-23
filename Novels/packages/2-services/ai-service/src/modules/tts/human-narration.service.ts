import { Injectable } from "@nestjs/common";

interface HumanNarrationRecord {
  storyId: string;
  chapterId: string;
  audioUrl: string;
  voiceActor: string;
}

@Injectable()
export class HumanNarrationService {
  private readonly catalogue = new Map<string, HumanNarrationRecord>();

  constructor() {
    // Seed catalogue with demo data
    const sample: HumanNarrationRecord = {
      storyId: "demo-story",
      chapterId: "1",
      audioUrl: "https://cdn.local/ai/human/demo-story-1.mp3",
      voiceActor: "Studio Voice Team",
    };
    this.catalogue.set(this.key(sample.storyId, sample.chapterId), sample);
  }

  private key(storyId: string, chapterId: string) {
    return `${storyId}:${chapterId}`;
  }

  async getNarration(storyId: string, chapterId: string) {
    const record = this.catalogue.get(this.key(storyId, chapterId));
    if (!record) {
      return {
        success: false,
        audioUrl: "",
        duration: 0,
        message: "No human narration available",
      };
    }

    return {
      success: true,
      audioUrl: record.audioUrl,
      duration: 0,
      message: `Human narration voiced by ${record.voiceActor}`,
    };
  }

  async listNarrationOptions(storyId: string, chapterId: string) {
    const record = this.catalogue.get(this.key(storyId, chapterId));
    return {
      success: true,
      storyId,
      chapterId,
      hasHumanNarration: Boolean(record),
      availableNarrators: record ? [record.voiceActor] : [],
      message: record ? "Human narration available" : "No human narration recorded",
    };
  }
}


