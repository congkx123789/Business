// Translation types (Enhanced - Language Learning)

export interface Translation {
  id: string;
  text: string;
  translatedText: string;
  fromLang: string;
  toLang: string;
  context?: TranslationContext;
  createdAt: Date;
}

export interface TranslationContext {
  storyId?: string;
  chapterId?: string;
  paragraphIndex?: number;
  surroundingText?: string;
}

export interface ChapterTranslation {
  chapterId: string;
  fromLang: string;
  toLang: string;
  translations: SentenceTranslation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SentenceTranslation {
  sentence: string;
  translatedSentence: string;
  sentenceIndex: number;
  context?: string;
}

export interface ParallelTranslation {
  id: string;
  text: string;
  translatedText: string;
  fromLang: string;
  toLang: string;
  displayMode: ParallelDisplayMode;
  segments: ParallelSegment[];
  createdAt: Date;
}

export interface ParallelSegment {
  original: string;
  translated: string;
  segmentIndex: number;
}

export type ParallelDisplayMode = 'line-by-line' | 'side-by-side' | 'interleaved';

