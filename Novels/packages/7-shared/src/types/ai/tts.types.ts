// TTS types (Enhanced - Emotional AI Narration)

export interface TTSAudio {
  id: string;
  text: string;
  audioUrl: string;
  duration: number; // seconds
  format: 'mp3' | 'wav' | 'ogg';
  language: string;
  narrationType: NarrationType;
  options: NarrationOptions;
  syncData?: TTSSyncData; // For text highlighting sync
  createdAt: Date;
}

export interface NarrationOptions {
  voice: string;
  speed: number; // 0.5-2.0, default: 1.0
  language: string;
  emotion?: EmotionControl; // Emotion control string
  voiceStyle?: VoiceStyle;
  context?: ContextualAwareness; // Surrounding text for context
}

export interface EmotionControl {
  emotion: string; // "emotional and dramatic", "calm and soothing"
  intensity?: number; // 0-100
}

export type VoiceStyle = 'terrified' | 'sad' | 'shouting' | 'whispering' | 'cheerful' | 'angry' | 'neutral';

export interface ContextualAwareness {
  previousText?: string; // Text before current segment
  nextText?: string; // Text after current segment
  punctuation?: string; // Punctuation context
}

export interface TTSSyncData {
  syncMode: SyncMode;
  timestamps: SyncTimestamp[];
}

export interface SyncTimestamp {
  text: string;
  startTime: number; // milliseconds
  endTime: number; // milliseconds
  wordIndex?: number; // For word-by-word sync
  sentenceIndex?: number; // For sentence-by-sentence sync
}

export type NarrationType = 'ai' | 'human';
export type SyncMode = 'word-by-word' | 'sentence-by-sentence';

