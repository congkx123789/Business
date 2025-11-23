// Annotation types (Enhanced - Annotation Suite)

export interface Annotation {
  id: string;
  userId: string;
  storyId: string;
  chapterId: string;
  paragraphIndex?: number;
  selectedText: string;
  highlightColor?: string;
  note?: string;
  
  // Unification fields
  source: AnnotationSource;
  unifiedId?: string; // ID for unified annotation across sources
  
  // Revisitation fields
  revisitationQueue: boolean; // Include in spaced repetition
  lastReviewedAt?: Date;
  nextReviewAt?: Date;
  reviewCount: number;
  
  // AI Summary
  aiSummary?: AnnotationAISummary;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AnnotationSource {
  type: 'epub' | 'pdf' | 'web' | 'youtube' | 'twitter' | 'app';
  sourceId?: string; // External source ID
  sourceUrl?: string;
  sourceTitle?: string;
}

export interface AnnotationAISummary {
  summary: string;
  highlights: string[]; // Selected highlights used for summary
  context?: string; // Additional context
  generatedAt: Date;
  model?: string; // AI model used
}

export interface AnnotationExportResult {
  format: ExportFormat;
  content: string; // Exported content
  exportedAt: Date;
  annotationIds: string[];
}

export type ExportFormat = 'markdown' | 'notion' | 'obsidian' | 'capacities' | 'pdf';

