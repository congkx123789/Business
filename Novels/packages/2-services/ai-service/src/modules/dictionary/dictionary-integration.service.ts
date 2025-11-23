import { Injectable } from "@nestjs/common";

interface DictionarySourceEntry {
  definitions: string[];
  examples: string[];
  pronunciation?: string;
  pinyin?: string;
}

@Injectable()
export class DictionaryIntegrationService {
  // Simulated third-party dictionary sources.
  private readonly providers: Record<string, DictionarySourceEntry> = {
    cultivate: {
      definitions: ["To improve by training or education", "In xianxia novels: to advance one's spiritual power"],
      examples: ["The protagonist must cultivate daily to reach a higher realm."],
      pronunciation: "ˈkʌl.tɪ.veɪt",
    },
    qi: {
      definitions: ["Vital energy forming part of any living entity", "Power used by cultivators"],
      examples: ["She circulated her qi to heal her wounds."],
      pronunciation: "chee",
      pinyin: "qì",
    },
  };

  async lookup(word: string, source: string | undefined): Promise<DictionarySourceEntry | null> {
    const normalized = word.toLowerCase().trim();
    const entry = this.providers[normalized];

    if (!entry) {
      return null;
    }

    if (!source || source === "default") {
      return entry;
    }

    // In a real implementation we would query the requested source.
    return entry;
  }
}


