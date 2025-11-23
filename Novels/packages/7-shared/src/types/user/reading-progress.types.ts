// Reading Progress types

export interface ReadingProgress {
  id: string;
  userId: string;
  storyId: string;
  chapterId: string;
  paragraphIndex: number; // Last read paragraph
  scrollPosition?: number; // Scroll position in pixels
  readingTime: number; // Total reading time in seconds
  lastReadAt: Date;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Sync fields
  deviceId?: string;
  syncedAt?: Date;
  conflictResolution?: 'last-write-wins' | 'server-wins' | 'client-wins' | 'merge';
}

export interface SyncConflict {
  itemId: string;
  itemType: 'reading-progress' | 'bookmark' | 'annotation' | 'library';
  serverVersion: any;
  clientVersion: any;
  conflictReason: string;
}

export interface SyncOperation {
  id: string;
  userId: string;
  deviceId: string;
  operationType: 'create' | 'update' | 'delete';
  itemType: 'reading-progress' | 'bookmark' | 'annotation' | 'library';
  itemId: string;
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  processedAt?: Date;
}

