// Dictionary types (Enhanced - Language Learning)

export interface DictionaryEntry {
  word: string;
  definitions: Definition[];
  pronunciation?: Pronunciation;
  exampleSentences?: ExampleSentence[];
  relatedWords?: RelatedWord[];
  source: DictionarySource;
  createdAt: Date;
}

export interface Definition {
  partOfSpeech: string;
  meaning: string;
  examples?: string[];
}

export interface Pronunciation {
  audioUrl?: string;
  phonetic?: string;
  pinyin?: string; // For Chinese
}

export interface ExampleSentence {
  sentence: string;
  translation?: string;
  context?: string;
}

export interface RelatedWord {
  word: string;
  relationship: 'synonym' | 'antonym' | 'related';
}

export interface TouchTranslateResult {
  word: string;
  translation: string;
  definitions?: Definition[];
  pronunciation?: Pronunciation;
  position?: {
    x: number;
    y: number;
  };
}

export type DictionarySource = 'default' | 'abbyy' | 'oxford' | 'custom';

